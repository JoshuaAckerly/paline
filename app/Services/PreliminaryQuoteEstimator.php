<?php

namespace App\Services;

use App\Contracts\GeocodingProvider;
use App\Contracts\RoutingProvider;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\PerformanceFormat;
use App\Domain\Booking\PricingCalculator;
use App\Exceptions\GeocodingUnavailableException;
use App\Exceptions\RoutingUnavailableException;
use App\Models\BookingRequest;
use Carbon\CarbonImmutable;

/**
 * Estimates a booking's required internal amount so it can be compared against
 * a booker's working budget (App\Domain\Booking\BudgetFitEvaluator). This is an
 * internal-only figure: it must never be returned to the client directly, since
 * individualized pricing stays gated behind the secure-pricing phase (Phase 5).
 *
 * Travel is approximated as a home-base round trip to the venue. It does not yet
 * account for surrounding confirmed engagements the way final pricing will.
 */
class PreliminaryQuoteEstimator
{
    public function __construct(
        private readonly PricingCalculator $pricing,
        private readonly GeocodingProvider $geocoding,
        private readonly RoutingProvider $routing,
        private readonly Coordinates $homeBase,
    ) {}

    public function estimate(BookingRequest $booking): int
    {
        $format = $booking->performance_format ?? PerformanceFormat::FullPaLine;
        $date = $booking->primary_date ?? CarbonImmutable::today();

        $base = $this->pricing->seasonAdjustedBase($format, $date);
        $sound = $this->pricing->soundFee($format, (bool) $booking->sound_provided);
        $travel = $this->estimateTravel($booking, $base);

        return $base + $sound + $travel;
    }

    private function estimateTravel(BookingRequest $booking, int $seasonAdjustedBase): int
    {
        $venue = $booking->venue;

        if ($venue === null) {
            return 0;
        }

        try {
            $destination = $venue->latitude !== null && $venue->longitude !== null
                ? new Coordinates((float) $venue->latitude, (float) $venue->longitude)
                : $this->geocoding->geocode($venue->city, $venue->state, $venue->postal_code);

            $outbound = $this->routing->calculate($this->homeBase, $destination);
            $inbound = $this->routing->calculate($destination, $this->homeBase);
        } catch (GeocodingUnavailableException|RoutingUnavailableException) {
            return 0;
        }

        $miles = $outbound->miles + $inbound->miles;
        $driveHours = ($outbound->driveMinutes + $inbound->driveMinutes) / 60;

        return $this->pricing->mileageCost($miles) + $this->pricing->extendedTravelAllowance($seasonAdjustedBase, $driveHours);
    }
}
