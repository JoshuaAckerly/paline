<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class BudgetFitEvaluator
{
    public function evaluate(
        int $workingBudget,
        int $requiredInternalAmount,
        bool $requiresCustomQuote = false,
    ): BudgetFitOutcome {
        $this->validateAmounts($workingBudget, $requiredInternalAmount);

        if ($requiresCustomQuote) {
            return new BudgetFitOutcome(
                BudgetFitStatus::ManualReview,
                $workingBudget,
                true,
                false,
            );
        }

        if ($workingBudget >= $requiredInternalAmount) {
            return new BudgetFitOutcome(
                BudgetFitStatus::Workable,
                $workingBudget,
                true,
                true,
            );
        }

        return new BudgetFitOutcome(
            BudgetFitStatus::AdjustmentNeeded,
            $workingBudget,
            false,
            false,
        );
    }

    public function requestManualReview(int $workingBudget): BudgetFitOutcome
    {
        if ($workingBudget <= 0) {
            throw new InvalidArgumentException('Working budget must be greater than zero.');
        }

        return new BudgetFitOutcome(
            BudgetFitStatus::ManualReview,
            $workingBudget,
            true,
            false,
        );
    }

    private function validateAmounts(int $workingBudget, int $requiredInternalAmount): void
    {
        if ($workingBudget <= 0) {
            throw new InvalidArgumentException('Working budget must be greater than zero.');
        }

        if ($requiredInternalAmount < 0) {
            throw new InvalidArgumentException('Required internal amount cannot be negative.');
        }
    }
}