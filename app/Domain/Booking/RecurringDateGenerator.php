<?php

namespace App\Domain\Booking;

use DateTimeImmutable;
use InvalidArgumentException;

final readonly class RecurringDateGenerator
{
    public function __construct(private int $maximumAdditionalBookings) {}

    /**
     * @param list<DateTimeImmutable> $existingAdditionalDates
     * @param callable(DateTimeImmutable): AvailabilityState $availability
     */
    public function generate(
        DateTimeImmutable $primaryDate,
        RecurringFrequency $frequency,
        int $count,
        callable $availability,
        array $existingAdditionalDates = [],
    ): RecurringDateResult {
        if ($count < 1 || $count > $this->maximumAdditionalBookings) {
            throw new InvalidArgumentException(
                "Recurring date count must be between 1 and {$this->maximumAdditionalBookings}."
            );
        }

        $existing = array_fill_keys(
            array_map(fn (DateTimeImmutable $date): string => $date->format('Y-m-d'), $existingAdditionalDates),
            true,
        );
        $accepted = [];
        $rejected = [];

        for ($occurrence = 1; $occurrence <= $count; $occurrence++) {
            $date = $this->dateForOccurrence($primaryDate, $frequency, $occurrence);
            $dateKey = $date->format('Y-m-d');

            if (isset($existing[$dateKey])) {
                $rejected[] = new RejectedRecurringDate($date, 'duplicate');

                continue;
            }

            $state = $availability($date);

            if (! in_array($state, [AvailabilityState::Available, AvailabilityState::Limited], true)) {
                $rejected[] = new RejectedRecurringDate($date, $state->value);

                continue;
            }

            $accepted[] = $date;
            $existing[$dateKey] = true;
        }

        return new RecurringDateResult($accepted, $rejected);
    }

    private function dateForOccurrence(
        DateTimeImmutable $primaryDate,
        RecurringFrequency $frequency,
        int $occurrence,
    ): DateTimeImmutable {
        return match ($frequency) {
            RecurringFrequency::Weekly => $primaryDate->modify("+{$occurrence} weeks"),
            RecurringFrequency::Biweekly => $primaryDate->modify('+'.($occurrence * 2).' weeks'),
            RecurringFrequency::Monthly => $this->addMonthsClamped($primaryDate, $occurrence),
        };
    }

    private function addMonthsClamped(DateTimeImmutable $date, int $months): DateTimeImmutable
    {
        $targetMonth = $date->modify('first day of this month')->modify("+{$months} months");
        $day = min((int) $date->format('j'), (int) $targetMonth->format('t'));

        return $targetMonth->setDate(
            (int) $targetMonth->format('Y'),
            (int) $targetMonth->format('n'),
            $day,
        );
    }
}