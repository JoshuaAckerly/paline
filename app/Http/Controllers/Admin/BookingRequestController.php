<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Booking\BookingStatus;
use App\Http\Controllers\Controller;
use App\Models\BookingRequest;
use App\Services\RouteSavingsTriggerService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Minimal admin bookings list + confirm action — enough to trigger Route Savings
 * recalculation for real. The full inbox/approval workflow (quote overrides, holds,
 * notifications) is separate, larger, unbuilt work (BOOKING_TODO.md Phase 6).
 */
class BookingRequestController extends Controller
{
    public function index(): Response
    {
        $bookings = BookingRequest::query()
            ->whereIn('status', [BookingStatus::Submitted, BookingStatus::Confirmed])
            ->with('venue')
            ->orderByDesc('submitted_at')
            ->get()
            ->map(fn (BookingRequest $booking) => [
                'id' => $booking->id,
                'event_name' => $booking->event_name,
                'venue_name' => $booking->venue?->name,
                'primary_date' => $booking->primary_date?->toDateString(),
                'status' => $booking->status->value,
                'submitted_at' => $booking->submitted_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/bookings/index', ['bookings' => $bookings]);
    }

    public function confirm(BookingRequest $bookingRequest, RouteSavingsTriggerService $trigger): RedirectResponse
    {
        if ($bookingRequest->status !== BookingStatus::Submitted) {
            return back()->with('error', 'Only submitted bookings can be confirmed.');
        }

        $trigger->confirm($bookingRequest);

        return back()->with('success', 'Booking confirmed.');
    }
}
