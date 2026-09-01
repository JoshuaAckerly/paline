<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class ScheduledEngagement
{
    public function __construct(
        public int $startMinute,
        public int $endMinute,
        public ?string $location = null,
    ) {
        if ($startMinute < 0 || $startMinute >= 1440 || $endMinute < 0 || $endMinute >= 1440) {
            throw new InvalidArgumentException('Engagement times must be minutes within a calendar day.');
        }
    }

    public function normalizedEndMinute(): int
    {
        return $this->endMinute <= $this->startMinute
            ? $this->endMinute + 1440
            : $this->endMinute;
    }
}