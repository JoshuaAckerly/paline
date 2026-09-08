<?php

namespace App\Services;

use App\Contracts\GeocodingProvider;
use App\Contracts\RoutingProvider;
use App\Domain\Booking\BookingStatus;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\PricingCalculator;
use App\Domain\Booking\RouteSavingsCalculator;
use App\Domain\Booking\RouteSavingsSource;
use App\Exceptions\GeocodingUnavailableException;
use App\Exceptions\RoutingUnavailableException;
use App\Models\BookingRequest;
use App\Models\RouteSavingsEvent;
use App\Notifications\RouteSavingsEventAvailable;
use Illuminate\Support\Facades\Notification;

/**
 * Minimal Route Savings trigger: when admin confirms a booking, checks the nearest
 * already-confirmed neighbors (by date) to see if routing through the new booking's
 * venue would have been cheaper than their locked-in home-base-based travel charge.
 *
 * This is a simplified single-leg heuristic, not full multi-stop route optimization
 * (that would require the admin booking/tour-planning workflow this app doesn't have
 * yet). It reuses the existing PreliminaryQuoteEstimator/PricingCalculator/RouteSavingsCalculator
 * so the ceiling-protection and allocation math stays identical to what's already tested.
 */
class RouteSavingsTriggerService
{
    public function __construct(
        private readonly PreliminaryQuoteEstimator $quoteEstimator,
        private readonly GeocodingProvider $geocoding,
        private readonly RoutingProvider $routing,
        private readonly PricingCalculator $pricing,
        private readonly RouteSavingsCalculator $routeSavings,
    ) {}

    public function confirm(BookingRequest $booking): void
    {
        $itemized = $this->quoteEstimator->itemize($booking);
        $travelCharge = $itemized['priced']
            ? $itemized['mileageCost'] + $itemized['extendedTravelAllowance']
            : 0;

        $booking->update(['status' => BookingStatus::Confirmed, 'confirmed_at' => now(), 'confirmed_travel_charge' => $travelCharge]);

        foreach ($this->neighbors($booking) as $neighbor) {
            $this->recomputeNeighbor($neighbor, $booking);
        }
    }

    /** @return list<BookingRequest> */
    private function neighbors(BookingRequest $booking): array
    {
        $previous = BookingRequest::query()
            ->where('status', BookingStatus::Confirmed)
            ->where('id', '!=', $booking->id)
            ->whereNotNull('primary_date')
            ->whereNotNull('confirmed_travel_charge')
            ->where('primary_date', '<=', $booking->primary_date)
            ->orderByDesc('primary_date')
            ->first();

        $next = BookingRequest::query()
            ->where('status', BookingStatus::Confirmed)
            ->where('id', '!=', $booking->id)
            ->whereNotNull('primary_date')
            ->whereNotNull('confirmed_travel_charge')
            ->where('primary_date', '>=', $booking->primary_date)
            ->orderBy('primary_date')
            ->first();

        return array_values(array_filter([$previous, $next]));
    }

    private function recomputeNeighbor(BookingRequest $neighbor, BookingRequest $newlyConfirmed): void
    {
        $neighborVenue = $neighbor->venue;
        $newVenue = $newlyConfirmed->venue;

        if ($neighborVenue === null || $newVenue === null) {
            return;
        }

        try {
            $neighborCoords = $this->coordinatesFor($neighborVenue);
            $newCoords = $this->coordinatesFor($newVenue);
            $leg = $this->routing->calculate($neighborCoords, $newCoords);
        } catch (GeocodingUnavailableException|RoutingUnavailableException) {
            return;
        }

        // Heuristic: one round trip between the two venues, replacing the neighbor's
        // locked-in home-base round trip, if that leg is cheaper.
        $recalculated = $this->pricing->mileageCost($leg->miles * 2);
        $alreadyGranted = (int) RouteSavingsEvent::query()->where('booking_request_id', $neighbor->id)->sum('savings');

        $calculation = $this->routeSavings->calculate($neighbor->confirmed_travel_charge, $alreadyGranted, $recalculated);
        $event = $this->routeSavings->createEvent($calculation);

        if ($event === null) {
            return;
        }

        $record = RouteSavingsEvent::create([
            'booking_request_id' => $neighbor->id,
            'triggering_booking_request_id' => $newlyConfirmed->id,
            'protected_travel_ceiling' => $event->protectedTravelCharge,
            'recalculated_travel_charge' => $event->recalculatedTravelCharge,
            'savings' => $event->savings,
            'source' => $event->source === RouteSavingsSource::RouteBuilderReferral ? 'route_builder_referral' : 'route_reoptimization',
            'status' => 'pending',
        ]);

        $this->notifyBooker($record);
    }

    private function coordinatesFor(\App\Models\Venue $venue): Coordinates
    {
        return $venue->latitude !== null && $venue->longitude !== null
            ? new Coordinates((float) $venue->latitude, (float) $venue->longitude)
            : $this->geocoding->geocode($venue->city, $venue->state, $venue->postal_code);
    }

    private function notifyBooker(RouteSavingsEvent $event): void
    {
        $contact = $event->bookingRequest?->contact;

        if ($contact?->email === null) {
            return;
        }

        Notification::route('mail', $contact->email)->notify(new RouteSavingsEventAvailable($event));
    }
}
