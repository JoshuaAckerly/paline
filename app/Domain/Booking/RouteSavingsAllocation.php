<?php

namespace App\Domain\Booking;

final readonly class RouteSavingsAllocation
{
    public function __construct(
        public int $returnAmount,
        public int $creditAmount,
        public int $reinvestAmount,
    ) {}

    public function total(): int
    {
        return $this->returnAmount + $this->creditAmount + $this->reinvestAmount;
    }
}