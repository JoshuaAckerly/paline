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
        $travel = $this->travelDetails($booking, $base);

        return $base + $sound + $travel['mileageCost'] + $travel['extendedAllowance'];
    }

    /**
     * Full itemized breakdown for the public quote-reveal step. Never called until the
     * booker has accepted the confidentiality agreement (checked by the caller).
     *
     * @return array{
     *     priced: bool,
     *     reason?: string,
     *     format?: string,
     *     seasonMultiplier?: float,
     *     performanceBase?: int,
     *     soundFee?: int,
     *     mileage?: float,
     *     mileageCost?: int,
     *     driveHours?: float,
     *     extendedTravelAllowance?: int,
     *     soundTechnicianCost?: int,
     *     total?: int,
     * }
     */
    public function itemize(BookingRequest $booking): array
    {
        if ($booking->true_potential_requested) {
            return ['priced' => false, 'reason' => 'true_potential'];
        }

        if ($booking->budget_status?->value === 'manual_review') {
            return ['priced' => false, 'reason' => 'manual_review'];
        }

        $format = $booking->performance_format ?? PerformanceFormat::FullPaLine;
        $date = $booking->primary_date ?? CarbonImmutable::today();

        $base = $this->pricing->seasonAdjustedBase($format, $date);
        $sound = $this->pricing->soundFee($format, (bool) $booking->sound_provided);
        $travel = $this->travelDetails($booking, $base);
        $needsTechnician = (bool) $booking->sound_provided && $booking->house_engineer_provided === false;
        $technicianCost = $this->pricing->soundTechnicianCost($travel['miles'], $needsTechnician);

        return [
            'priced' => true,
            'format' => $format->value,
            'seasonMultiplier' => $this->pricing->seasonMultiplier($date),
            'performanceBase' => $base,
            'soundFee' => $sound,
            'mileage' => $travel['miles'],
            'mileageCost' => $travel['mileageCost'],
            'driveHours' => $travel['driveHours'],
            'extendedTravelAllowance' => $travel['extendedAllowance'],
            'soundTechnicianCost' => $technicianCost,
            'total' => $base + $sound + $travel['mileageCost'] + $travel['extendedAllowance'] + $technicianCost,
        ];
    }

    /**
     * @return array{miles: float, driveHours: float, mileageCost: int, extendedAllowance: int}
     */
    private function travelDetails(BookingRequest $booking, int $seasonAdjustedBase): array
    {
        $venue = $booking->venue;

        if ($venue === null) {
            return ['miles' => 0.0, 'driveHours' => 0.0, 'mileageCost' => 0, 'extendedAllowance' => 0];
        }

        try {
            $destination = $venue->latitude !== null && $venue->longitude !== null
                ? new Coordinates((float) $venue->latitude, (float) $venue->longitude)
                : $this->geocoding->geocode($venue->city, $venue->state, $venue->postal_code);

            $outbound = $this->routing->calculate($this->homeBase, $destination);
            $inbound = $this->routing->calculate($destination, $this->homeBase);
        } catch (GeocodingUnavailableException|RoutingUnavailableException) {
            return ['miles' => 0.0, 'driveHours' => 0.0, 'mileageCost' => 0, 'extendedAllowance' => 0];
        }

        $miles = $outbound->miles + $inbound->miles;
        $driveHours = ($outbound->driveMinutes + $inbound->driveMinutes) / 60;

        return [
            'miles' => $miles,
            'driveHours' => $driveHours,
            'mileageCost' => $this->pricing->mileageCost($miles),
            'extendedAllowance' => $this->pricing->extendedTravelAllowance($seasonAdjustedBase, $driveHours),
        ];
    }
}
