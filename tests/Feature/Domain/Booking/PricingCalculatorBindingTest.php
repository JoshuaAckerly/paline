<?php

namespace Tests\Feature\Domain\Booking;

use App\Domain\Booking\PricingCalculator;
use Tests\TestCase;

class PricingCalculatorBindingTest extends TestCase
{
    public function test_the_pricing_calculator_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(PricingCalculator::class, app(PricingCalculator::class));
        $this->assertSame(app(PricingCalculator::class), app(PricingCalculator::class));
    }
}
