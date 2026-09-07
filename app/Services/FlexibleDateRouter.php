<?php

namespace App\Services;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\EngagementStatus;
use App\Exceptions\RoutingUnavailableException;
use App\Models\Engagement;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

/**
 * Ranks flexible-date candidates by verified server-side routing so the
 * best route-fit dates surface first (spec section 9.3 scoring formula),
 * instead of only ordering by availability and date.
 */
class FlexibleDateRouter
{
    public function __construct(
        private readonly RoutingProvider $routing,
        private readonly Coordinates $homeBase,
    ) {}

    /**
     * @param  list<array{date: string, state: string}>  $candidates
     * @return array{status: string, candidates: list<array{date: string, state: string, miles: float|null, routing_status: string}>}
     */
    public function rank(array $candidates, ?Coordinates $destination, int $limit = 5): array
    {
        if ($destination === null) {
            return [
                'status' => 'verification_pending',
                'candidates' => array_slice($this->sortByFallback($candidates), 0, $limit),
            ];
        }

        $engagements = $this->confirmedEngagements();
        $verifiedAny = false;

        $scored = array_map(function (array $candidate) use ($engagements, $destination, &$verifiedAny) {
            $date = Carbon::parse($candidate['date']);
            [$origin, $onward] = $this->surroundingCoordinates($engagements, $date);

            try {
                $inbound = $this->routing->calculate($origin, $destination);
                $outbound = $this->routing->calculate($destination, $onward);
                $miles = round($inbound->miles + $outbound->miles, 1);
                $verifiedAny = true;

                return [
                    'date' => $candidate['date'],
                    'state' => $candidate['state'],
                    'miles' => $miles,
                    'routing_status' => 'verified',
                    'score' => 100 - ($miles / 4) - ($candidate['state'] === AvailabilityState::Limited->value ? 35 : 0),
                ];
            } catch (RoutingUnavailableException) {
                return [
                    'date' => $candidate['date'],
                    'state' => $candidate['state'],
                    'miles' => null,
                    'routing_status' => 'verification_pending',
                    'score' => $this->fallbackScore($candidate, $date),
                ];
            }
        }, $candidates);

        usort($scored, fn (array $left, array $right) => $right['score'] <=> $left['score']);

        return [
            'status' => $verifiedAny ? 'verified' : 'verification_pending',
            'candidates' => array_slice(array_map($this->withoutScore(...), $scored), 0, $limit),
        ];
    }

    /** @return array{0: Coordinates, 1: Coordinates} */
    private function surroundingCoordinates(Collection $engagements, Carbon $date): array
    {
        $previous = $engagements->last(fn (Engagement $engagement) => $engagement->performance_date->lt($date));
        $next = $engagements->first(fn (Engagement $engagement) => $engagement->performance_date->gt($date));

        return [
            $this->venueCoordinates($previous) ?? $this->homeBase,
            $this->venueCoordinates($next) ?? $this->homeBase,
        ];
    }

    private function venueCoordinates(?Engagement $engagement): ?Coordinates
    {
        $venue = $engagement?->venue;

        if ($venue === null || $venue->latitude === null || $venue->longitude === null) {
            return null;
        }

        return new Coordinates((float) $venue->latitude, (float) $venue->longitude);
    }

    /** @return Collection<int, Engagement> */
    private function confirmedEngagements(): Collection
    {
        return Engagement::query()
            ->where('status', EngagementStatus::Confirmed)
            ->whereNotNull('performance_date')
            ->with('venue')
            ->orderBy('performance_date')
            ->get();
    }

    /** @param array{date: string, state: string} $candidate */
    private function fallbackScore(array $candidate, Carbon $date): float
    {
        return -1000
            - ($candidate['state'] === AvailabilityState::Limited->value ? 500 : 0)
            - ($date->timestamp / 1_000_000_000);
    }

    /**
     * @param  list<array{date: string, state: string}>  $candidates
     * @return list<array{date: string, state: string, miles: float|null, routing_status: string}>
     */
    private function sortByFallback(array $candidates): array
    {
        $scored = array_map(fn (array $candidate) => [
            'date' => $candidate['date'],
            'state' => $candidate['state'],
            'miles' => null,
            'routing_status' => 'verification_pending',
            'score' => $this->fallbackScore($candidate, Carbon::parse($candidate['date'])),
        ], $candidates);

        usort($scored, fn (array $left, array $right) => $right['score'] <=> $left['score']);

        return array_map($this->withoutScore(...), $scored);
    }

    private function withoutScore(array $scored): array
    {
        unset($scored['score']);

        return $scored;
    }
}
