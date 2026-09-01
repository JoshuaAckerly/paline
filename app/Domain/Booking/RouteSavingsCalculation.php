<?php

namespace App\Domain\Booking;

final readonly class RouteSavingsCalculation
{
    public function __construct(
        public int $confirmedTravelCeiling,
        public int $savingsAlreadyGranted,
        public int $protectedCurrentTravelCharge,
        public int $recalculatedTravelCharge,
        public int $adjustedTravelCharge,
        public int $newSavings,
        public int $totalSavingsAfter,
        public bool $mayIncrease = false,
    ) {}
}