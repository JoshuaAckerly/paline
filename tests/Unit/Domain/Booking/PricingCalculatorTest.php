<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\PerformanceFormat;
use App\Domain\Booking\PricingCalculator;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class PricingCalculatorTest extends TestCase
{
    private PricingCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $config = require __DIR__.'/../../../../config/booking.php';
        $this->calculator = new PricingCalculator($config['pricing']);
    }

    #[DataProvider('baselineProvider')]
    public function test_it_uses_the_day_and_format_baseline(
        PerformanceFormat $format,
        string $date,
        int $expected
    ): void {
        $this->assertSame(
            $expected,
            $this->calculator->performanceBaseline($format, new DateTimeImmutable($date))
        );
    }

    public static function baselineProvider(): array
    {
        return [
            'solo Sunday' => [PerformanceFormat::Solo, '2026-09-06', 200],
            'solo Friday' => [PerformanceFormat::Solo, '2026-09-04', 300],
            'duo Thursday' => [PerformanceFormat::Duo, '2026-09-03', 450],
            'full PA LINE Saturday' => [PerformanceFormat::FullPaLine, '2026-09-05', 1000],
        ];
    }

    #[DataProvider('seasonProvider')]
    public function test_it_applies_and_rounds_seasonal_pricing(string $date, int $expected): void
    {
        $this->assertSame(
            $expected,
            $this->calculator->seasonAdjustedBase(
                PerformanceFormat::Duo,
                new DateTimeImmutable($date)
            )
        );
    }

    public static function seasonProvider(): array
    {
        return [
            'winter' => ['2026-12-04', 413],
            'baseline' => ['2026-10-02', 550],
            'shoulder' => ['2026-09-04', 688],
            'peak' => ['2026-07-03', 770],
        ];
    }

    public function test_it_prices_mileage_at_eighty_cents_per_mile(): void
    {
        $this->assertSame(99, $this->calculator->mileageCost(123.4));
    }

    #[DataProvider('travelAllowanceProvider')]
    public function test_it_applies_the_v50_extended_travel_allowance(
        float $combinedDriveHours,
        int $expected
    ): void {
        $this->assertSame(
            $expected,
            $this->calculator->extendedTravelAllowance(688, $combinedDriveHours)
        );
    }

    public static function travelAllowanceProvider(): array
    {
        return [
            'short route' => [2.0, 0],
            'just under threshold' => [7.99, 0],
            'exactly eight hours' => [8.0, 0],
            'over eight hours' => [8.01, 688],
            'much longer route still adds one allowance' => [20.0, 688],
        ];
    }

    public function test_the_hourly_drive_charge_remains_zero_under_v50(): void
    {
        $this->assertSame(0, $this->calculator->driveTimeCost(20));
    }

    public function test_it_only_adds_the_format_sound_fee_when_pa_line_supplies_sound(): void
    {
        $this->assertSame(0, $this->calculator->soundFee(PerformanceFormat::FullPaLine, true));
        $this->assertSame(250, $this->calculator->soundFee(PerformanceFormat::FullPaLine, false));
    }

    public function test_it_prices_a_needed_sound_technician_and_their_mileage(): void
    {
        $this->assertSame(230, $this->calculator->soundTechnicianCost(100, true));
        $this->assertSame(0, $this->calculator->soundTechnicianCost(100, false));
    }

    public function test_it_rejects_negative_mileage(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->calculator->mileageCost(-1);
    }

    public function test_it_rejects_negative_drive_hours(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->calculator->extendedTravelAllowance(550, -1);
    }
}
