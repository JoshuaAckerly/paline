<?php

namespace App\Domain\Booking;

final readonly class RouteEstimate
{
    public function __construct(
        public float $miles,
        public int $driveMinutes,
        public string $provider,
    ) {}
}