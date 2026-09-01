<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class StartWindow
{
    public function __construct(
        public int $earliestStartMinute,
        public int $latestStartMinute,
    ) {
        if ($earliestStartMinute > $latestStartMinute) {
            throw new InvalidArgumentException('The start window cannot end before it begins.');
        }
    }

    public function contains(int $startMinute): bool
    {
        return $startMinute >= $this->earliestStartMinute
            && $startMinute <= $this->latestStartMinute;
    }
}