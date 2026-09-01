<?php

namespace App\Domain\Booking;

use DateTimeImmutable;
use DateTimeInterface;
use InvalidArgumentException;

final readonly class AvailabilityService
{
    /**
     * @param array{
     *     booking_horizon_months: int,
     *     earliest_performance_start_minutes: int,
     *     latest_performance_start_minutes: int,
     *     pre_show_minutes: int,
     *     post_show_minutes: int,
     *     default_performance_duration_minutes: int
     * } $rules
     */
    public function __construct(private array $rules) {}

    public function stateFor(
        DateTimeInterface $date,
        bool $hasConfirmedEngagement = false,
        bool $hasHold = false,
        bool $isBlocked = false,
        ?DateTimeInterface $today = null,
    ): AvailabilityState {
        $requestedDate = DateTimeImmutable::createFromInterface($date)->setTime(0, 0);
        $currentDate = DateTimeImmutable::createFromInterface($today ?? new DateTimeImmutable)->setTime(0, 0);
        $lastBookableDate = $currentDate->modify("+{$this->rules['booking_horizon_months']} months");

        if ($requestedDate < $currentDate || $requestedDate > $lastBookableDate || $isBlocked) {
            return AvailabilityState::Blocked;
        }

        if ($hasHold) {
            return AvailabilityState::Held;
        }

        return $hasConfirmedEngagement
            ? AvailabilityState::Limited
            : AvailabilityState::Available;
    }

    /**
     * @param list<ScheduledEngagement> $existingEngagements
     * @param null|callable(string, string): int $travelMinutes
     */
    public function sameDayWindows(
        array $existingEngagements,
        ?int $candidateDurationMinutes = null,
        ?string $candidateLocation = null,
        ?callable $travelMinutes = null,
    ): SameDayAvailability {
        $duration = $candidateDurationMinutes ?? $this->rules['default_performance_duration_minutes'];

        if ($duration <= 0) {
            throw new InvalidArgumentException('Performance duration must be greater than zero.');
        }

        usort($existingEngagements, fn (ScheduledEngagement $left, ScheduledEngagement $right): int => (
            $left->startMinute <=> $right->startMinute
        ));

        if ($existingEngagements === []) {
            return new SameDayAvailability([
                new StartWindow(
                    $this->rules['earliest_performance_start_minutes'],
                    $this->rules['latest_performance_start_minutes'],
                ),
            ], $candidateLocation === null || $travelMinutes === null);
        }

        $preliminary = $candidateLocation === null || $travelMinutes === null;
        $travel = function (?string $from, ?string $to) use ($preliminary, $travelMinutes): int {
            if ($preliminary) {
                return 0;
            }

            if ($from === null || $to === null) {
                throw new InvalidArgumentException('Locations are required for final same-day validation.');
            }

            $minutes = $travelMinutes($from, $to);

            if ($minutes < 0) {
                throw new InvalidArgumentException('Travel time cannot be negative.');
            }

            return $minutes;
        };

        $earliest = $this->rules['earliest_performance_start_minutes'];
        $latest = $this->rules['latest_performance_start_minutes'];
        $pre = $this->rules['pre_show_minutes'];
        $post = $this->rules['post_show_minutes'];
        $windows = [];
        $first = $existingEngagements[0];
        $beforeEnd = $first->startMinute
            - $pre
            - $travel($candidateLocation, $first->location)
            - $post
            - $duration;

        if ($beforeEnd >= $earliest) {
            $windows[] = new StartWindow($earliest, min($beforeEnd, $latest));
        }

        for ($index = 0; $index < count($existingEngagements) - 1; $index++) {
            $previous = $existingEngagements[$index];
            $next = $existingEngagements[$index + 1];
            $windowStart = $previous->normalizedEndMinute()
                + $post
                + $travel($previous->location, $candidateLocation)
                + $pre;
            $windowEnd = $next->startMinute
                - $pre
                - $travel($candidateLocation, $next->location)
                - $post
                - $duration;

            if ($windowEnd >= $windowStart && $windowEnd >= $earliest && $windowStart <= $latest) {
                $windows[] = new StartWindow(max($windowStart, $earliest), min($windowEnd, $latest));
            }
        }

        $last = $existingEngagements[array_key_last($existingEngagements)];
        $afterStart = $last->normalizedEndMinute()
            + $post
            + $travel($last->location, $candidateLocation)
            + $pre;

        if ($afterStart <= $latest) {
            $windows[] = new StartWindow(max($afterStart, $earliest), $latest);
        }

        return new SameDayAvailability($windows, $preliminary);
    }
}