<?php

namespace App\Domain\Booking;

enum BudgetFitStatus: string
{
    case Workable = 'workable';
    case AdjustmentNeeded = 'adjustment_needed';
    case ManualReview = 'manual_review';
}