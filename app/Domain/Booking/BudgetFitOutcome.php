<?php

namespace App\Domain\Booking;

final readonly class BudgetFitOutcome
{
    public function __construct(
        public BudgetFitStatus $status,
        public int $workingBudget,
        public bool $canContinue,
        public bool $pricedQuoteAllowed,
    ) {}
}