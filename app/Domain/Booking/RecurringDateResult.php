<?php

namespace App\Domain\Booking;

use DateTimeImmutable;

final readonly class RecurringDateResult
{
    /**
     * @param list<DateTimeImmutable> $acceptedDates
     * @param list<RejectedRecurringDate> $rejectedDates
     */
    public function __construct(
        public array $acceptedDates,
        public array $rejectedDates,
    ) {}
}