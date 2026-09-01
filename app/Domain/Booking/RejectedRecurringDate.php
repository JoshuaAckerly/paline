<?php

namespace App\Domain\Booking;

use DateTimeImmutable;

final readonly class RejectedRecurringDate
{
    public function __construct(
        public DateTimeImmutable $date,
        public string $reason,
    ) {}
}