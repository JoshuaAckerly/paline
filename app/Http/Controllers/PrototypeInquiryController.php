<?php

namespace App\Http\Controllers;

use App\Models\PrototypeInquiry;
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

        Notification::route('mail', config('app.admin_emails'))->notify(new NewPrototypeInquiry($inquiry));

        return response()->json(['status' => 'received'], 201);
    }
}
