<?php

namespace Tests\Feature\Domain\Booking;

use App\Domain\Booking\AvailabilityService;
use App\Domain\Booking\BudgetFitEvaluator;
use App\Domain\Booking\LegalAcknowledgmentService;
use App\Domain\Booking\PricingCalculator;
use App\Domain\Booking\RecurringDateGenerator;
use App\Domain\Booking\RouteSavingsCalculator;
use Tests\TestCase;

class PricingCalculatorBindingTest extends TestCase
{
    public function test_the_pricing_calculator_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(PricingCalculator::class, app(PricingCalculator::class));
        $this->assertSame(app(PricingCalculator::class), app(PricingCalculator::class));
    }

    public function test_the_availability_service_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(AvailabilityService::class, app(AvailabilityService::class));
        $this->assertSame(app(AvailabilityService::class), app(AvailabilityService::class));
    }

    public function test_the_recurring_date_generator_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(RecurringDateGenerator::class, app(RecurringDateGenerator::class));
        $this->assertSame(app(RecurringDateGenerator::class), app(RecurringDateGenerator::class));
    }

    public function test_the_budget_fit_evaluator_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(BudgetFitEvaluator::class, app(BudgetFitEvaluator::class));
        $this->assertSame(app(BudgetFitEvaluator::class), app(BudgetFitEvaluator::class));
    }

    public function test_the_route_savings_calculator_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(RouteSavingsCalculator::class, app(RouteSavingsCalculator::class));
        $this->assertSame(app(RouteSavingsCalculator::class), app(RouteSavingsCalculator::class));
    }

    public function test_the_legal_acknowledgment_service_is_available_from_the_container(): void
    {
        $this->assertInstanceOf(LegalAcknowledgmentService::class, app(LegalAcknowledgmentService::class));
        $this->assertSame(app(LegalAcknowledgmentService::class), app(LegalAcknowledgmentService::class));
    }
}
