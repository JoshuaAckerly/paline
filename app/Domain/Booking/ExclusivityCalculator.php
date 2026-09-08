<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class ExclusivityCalculator
{
    private const BASE_FEE = 100;

    private const BASE_RADIUS_MILES = 25;

    private const RADIUS_RATE_PER_MILE = 2;

    private const BASE_WINDOW_DAYS = 14;

    private const WINDOW_RATE_PER_DAY = 8;

    private const ROUNDING_INCREMENT = 25;

    public function calculateFee(int $radiusMiles, int $daysBefore, int $daysAfter): int
    {
        if ($radiusMiles < 0 || $daysBefore < 0 || $daysAfter < 0) {
            throw new InvalidArgumentException('Exclusivity radius and window days cannot be negative.');
        }

        $radiusComponent = max(0, $radiusMiles - self::BASE_RADIUS_MILES) * self::RADIUS_RATE_PER_MILE;
        $windowComponent = max(0, $daysBefore + $daysAfter - self::BASE_WINDOW_DAYS) * self::WINDOW_RATE_PER_DAY;

        $rounded = (int) round(($radiusComponent + $windowComponent) / self::ROUNDING_INCREMENT) * self::ROUNDING_INCREMENT;

        return max(self::BASE_FEE, $rounded);
    }
}
