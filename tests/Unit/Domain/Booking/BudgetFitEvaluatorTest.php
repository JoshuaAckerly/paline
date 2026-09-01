<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\BudgetFitEvaluator;
use App\Domain\Booking\BudgetFitStatus;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class BudgetFitEvaluatorTest extends TestCase
{
    private BudgetFitEvaluator $evaluator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->evaluator = new BudgetFitEvaluator;
    }

    public function test_a_budget_at_the_internal_requirement_is_workable(): void
    {
        $outcome = $this->evaluator->evaluate(1000, 1000);

        $this->assertSame(BudgetFitStatus::Workable, $outcome->status);
        $this->assertTrue($outcome->canContinue);
        $this->assertTrue($outcome->pricedQuoteAllowed);
    }

    public function test_a_budget_below_the_internal_requirement_needs_an_adjustment(): void
    {
        $outcome = $this->evaluator->evaluate(999, 1000);

        $this->assertSame(BudgetFitStatus::AdjustmentNeeded, $outcome->status);
        $this->assertFalse($outcome->canContinue);
        $this->assertFalse($outcome->pricedQuoteAllowed);
    }

    public function test_true_potential_always_uses_an_unpriced_manual_review(): void
    {
        $outcome = $this->evaluator->evaluate(5000, 1000, true);

        $this->assertSame(BudgetFitStatus::ManualReview, $outcome->status);
        $this->assertTrue($outcome->canContinue);
        $this->assertFalse($outcome->pricedQuoteAllowed);
    }

    public function test_a_short_budget_can_be_sent_for_unpriced_manual_review(): void
    {
        $outcome = $this->evaluator->requestManualReview(750);

        $this->assertSame(BudgetFitStatus::ManualReview, $outcome->status);
        $this->assertSame(750, $outcome->workingBudget);
        $this->assertTrue($outcome->canContinue);
        $this->assertFalse($outcome->pricedQuoteAllowed);
    }

    public function test_the_outcome_does_not_retain_or_serialize_the_private_requirement(): void
    {
        $outcome = $this->evaluator->evaluate(1250, 900);
        $serialized = serialize($outcome);

        $this->assertObjectNotHasProperty('requiredInternalAmount', $outcome);
        $this->assertStringNotContainsString('900', $serialized);
    }

    #[DataProvider('invalidAmountProvider')]
    public function test_it_rejects_invalid_amounts(int $budget, int $required): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->evaluator->evaluate($budget, $required);
    }

    public static function invalidAmountProvider(): array
    {
        return [
            'zero budget' => [0, 1000],
            'negative budget' => [-1, 1000],
            'negative requirement' => [1000, -1],
        ];
    }
}