<?php

namespace App\Domain\Booking;

final readonly class SameDayAvailability
{
    /** @param list<StartWindow> $windows */
    public function __construct(
        public array $windows,
        public bool $preliminary,
    ) {}

    public function hasAvailableStart(): bool
    {
        return $this->windows !== [];
    }

    public function allowsStart(int $startMinute): bool
    {
        foreach ($this->windows as $window) {
            if ($window->contains($startMinute)) {
                return true;
            }
        }

        return false;
    }
}