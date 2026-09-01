<?php

namespace App\Domain\Booking;

use DateTimeInterface;
use InvalidArgumentException;

final readonly class PricingCalculator
{
    /**
     * @param  array{
     *     performance_baselines: array<string, list<int>>,
     *     season_multipliers: array<int, float>,
     *     mileage_rate: float,
     *     max_drive_hours_without_allowance: float,
     *     hourly_drive_rate: int,
     *     sound_fees: array<string, int>,
     *     sound_technician_base_fee: int,
     *     sound_technician_mileage_rate: float
     * }  $rules
     */
    public function __construct(private array $rules) {}

    public function performanceBaseline(PerformanceFormat $format, DateTimeInterface $date): int
    {
        $dayOfWeek = (int) $date->format('w');

        return $this->rules['performance_baselines'][$format->value][$dayOfWeek];
    }

    public function seasonMultiplier(DateTimeInterface $date): float
    {
        return $this->rules['season_multipliers'][(int) $date->format('n')];
    }

    public function seasonAdjustedBase(PerformanceFormat $format, DateTimeInterface $date): int
    {
        return (int) round(
            $this->performanceBaseline($format, $date) * $this->seasonMultiplier($date)
        );
    }

    public function mileageCost(float $routedMiles): int
    {
        $this->ensureNonNegative($routedMiles, 'Routed mileage');

        return (int) round($routedMiles * $this->rules['mileage_rate']);
    }

    public function driveTimeCost(float $combinedDriveHours): int
    {
        $this->ensureNonNegative($combinedDriveHours, 'Combined drive hours');

        return (int) round($combinedDriveHours * $this->rules['hourly_drive_rate']);
    }

    public function extendedTravelAllowance(int $seasonAdjustedBase, float $combinedDriveHours): int
    {
        $this->ensureNonNegative($seasonAdjustedBase, 'Season-adjusted base');
        $this->ensureNonNegative($combinedDriveHours, 'Combined drive hours');

        return $combinedDriveHours > $this->rules['max_drive_hours_without_allowance']
            ? $seasonAdjustedBase
            : 0;
    }

    public function soundFee(PerformanceFormat $format, bool $soundIsProvided): int
    {
        return $soundIsProvided ? 0 : $this->rules['sound_fees'][$format->value];
    }

    public function soundTechnicianCost(float $technicianMiles, bool $technicianIsNeeded): int
    {
        $this->ensureNonNegative($technicianMiles, 'Sound technician mileage');

        if (! $technicianIsNeeded) {
            return 0;
        }

        return $this->rules['sound_technician_base_fee']
            + (int) round($technicianMiles * $this->rules['sound_technician_mileage_rate']);
    }

    private function ensureNonNegative(float $value, string $label): void
    {
        if ($value < 0) {
            throw new InvalidArgumentException("{$label} cannot be negative.");
        }
    }
}
