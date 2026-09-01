<?php

namespace App\Domain\Booking;

final readonly class RouteSavingsEvent
{
    public function __construct(
        public int $protectedTravelCharge,
        public int $recalculatedTravelCharge,
        public int $savings,
        public RouteSavingsSource $source,
    ) {}
}