<?php

namespace App\Http\Controllers;

use App\Models\PrototypeInquiry;
use App\Notifications\BookingConfirmation;
use App\Notifications\NewPrototypeInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Illuminate\Validation\Rule;

/**
 * Receives the exact-copy static prototype's assembled inquiry packet
 * (contact/lead/record/notification, see PA_LINE_PUBLIC_BOOKING.html's
 * timeLogPublicBookingRequest()/timeLogPublicDemandRequest()) so submissions
 * actually reach Trever instead of staying in the visitor's own localStorage.
 */
class PrototypeInquiryController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', Rule::in(['booking', 'demand'])],
            'source_key' => ['nullable', 'string', 'max:255'],
            'contact' => ['required', 'array'],
            'contact.name' => ['required', 'string', 'max:255'],
            'contact.email' => ['required', 'email:rfc', 'max:255'],
            'contact.phone' => ['nullable', 'string', 'max:40'],
            'lead' => ['required', 'array'],
            'record' => ['required', 'array'],
            'notification' => ['required', 'array'],
        ]);

        $inquiry = PrototypeInquiry::create([
            'type' => $validated['type'],
            'source_key' => $validated['source_key'] ?? null,
            'contact_name' => $validated['contact']['name'],
            'contact_email' => $validated['contact']['email'],
            'contact_phone' => $validated['contact']['phone'] ?? null,
            'payload' => $request->only(['contact', 'lead', 'record', 'notification']),
        ]);

        // Send synchronously: production has no queue worker, so a queued
        // notification would never leave the jobs table. notifyNow() bypasses
        // the queue regardless of the notification's Queueable trait.
        Notification::route('mail', config('app.admin_emails'))
            ->notifyNow(new NewPrototypeInquiry($inquiry));

        // Confirm receipt to the person who submitted a booking (not demand).
        if ($inquiry->type === 'booking') {
            Notification::route('mail', $inquiry->contact_email)
                ->notifyNow(new BookingConfirmation($inquiry));
        }

        return response()->json(['status' => 'received'], 201);
    }
}
