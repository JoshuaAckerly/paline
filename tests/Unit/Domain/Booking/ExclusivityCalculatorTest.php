<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\ExclusivityCalculator;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

class ExclusivityCalculatorTest extends TestCase
{
    private ExclusivityCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calculator = new ExclusivityCalculator();
    }

    public function test_base_radius_and_window_charge_only_the_minimum_fee(): void
    {
        $this->assertSame(100, $this->calculator->calculateFee(25, 7, 7));
    }

    public function test_wider_radius_and_window_increase_the_fee_and_round_to_nearest_twenty_five(): void
    {
        $this->assertSame(525, $this->calculator->calculateFee(100, 30, 30));
    }

    public function test_radius_only_component(): void
    {
        // (75-25)*2 = 100, window stays at base (14 days), rounds to 100.
        $this->assertSame(100, $this->calculator->calculateFee(75, 7, 7));
    }

    public function test_window_only_component(): void
    {
        // (60-14)*8 = 368, radius stays at base (25mi); 368/25 = 14.72 -> 15*25 = 375.
        $this->assertSame(375, $this->calculator->calculateFee(25, 30, 30));
    }

    public function test_fee_never_drops_below_the_one_hundred_dollar_minimum(): void
    {
        $this->assertSame(100, $this->calculator->calculateFee(0, 0, 0));
    }

    public function test_negative_inputs_are_rejected(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->calculator->calculateFee(-1, 0, 0);
    }
}
