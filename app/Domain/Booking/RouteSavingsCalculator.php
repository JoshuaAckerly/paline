<?php

namespace App\Domain\Booking;

use InvalidArgumentException;

final readonly class RouteSavingsCalculator
{
    public function calculate(
        int $confirmedTravelCeiling,
        int $savingsAlreadyGranted,
        int $recalculatedTravelCharge,
    ): RouteSavingsCalculation {
        $this->ensureNonNegative($confirmedTravelCeiling, 'Confirmed travel ceiling');
        $this->ensureNonNegative($savingsAlreadyGranted, 'Savings already granted');
        $this->ensureNonNegative($recalculatedTravelCharge, 'Recalculated travel charge');

        $alreadyGranted = min($confirmedTravelCeiling, $savingsAlreadyGranted);
        $protectedCurrent = $confirmedTravelCeiling - $alreadyGranted;
        $adjusted = min($protectedCurrent, $recalculatedTravelCharge);
        $newSavings = $protectedCurrent - $adjusted;

        return new RouteSavingsCalculation(
            $confirmedTravelCeiling,
            $alreadyGranted,
            $protectedCurrent,
            $recalculatedTravelCharge,
            $adjusted,
            $newSavings,
            $alreadyGranted + $newSavings,
        );
    }

    public function createEvent(
        RouteSavingsCalculation $calculation,
        bool $referralAttributed = false,
    ): ?RouteSavingsEvent {
        if ($calculation->newSavings === 0) {
            return null;
        }

        return new RouteSavingsEvent(
            $calculation->protectedCurrentTravelCharge,
            $calculation->adjustedTravelCharge,
            $calculation->newSavings,
            $referralAttributed
                ? RouteSavingsSource::RouteBuilderReferral
                : RouteSavingsSource::RouteReoptimization,
        );
    }

    public function allocate(
        int $savings,
        int $returnPercent = 100,
        int $creditPercent = 0,
        int $reinvestPercent = 0,
    ): RouteSavingsAllocation {
        $this->ensureNonNegative($savings, 'Savings');

        foreach ([$returnPercent, $creditPercent, $reinvestPercent] as $percentage) {
            if ($percentage < 0 || $percentage > 100) {
                throw new InvalidArgumentException('Each allocation percentage must be between 0 and 100.');
            }
        }

        if ($returnPercent + $creditPercent + $reinvestPercent !== 100) {
            throw new InvalidArgumentException('Route Savings allocations must total 100 percent.');
        }

        $returnAmount = (int) round($savings * $returnPercent / 100);
        $creditAmount = (int) round($savings * $creditPercent / 100);
        $reinvestAmount = (int) round($savings * $reinvestPercent / 100);
        $roundingDrift = $savings - ($returnAmount + $creditAmount + $reinvestAmount);

        return new RouteSavingsAllocation(
            $returnAmount + $roundingDrift,
            $creditAmount,
            $reinvestAmount,
        );
    }

    /** @return list<int> */
    public function affectedNeighborIndexes(int $confirmedShowCount, int $newShowIndex): array
    {
        if ($confirmedShowCount < 1 || $newShowIndex < 0 || $newShowIndex >= $confirmedShowCount) {
            throw new InvalidArgumentException('The new show index must exist in the confirmed schedule.');
        }

        $affected = [];

        if ($newShowIndex > 0) {
            $affected[] = $newShowIndex - 1;
        }

        if ($newShowIndex < $confirmedShowCount - 1) {
            $affected[] = $newShowIndex + 1;
        }

        return $affected;
    }

    private function ensureNonNegative(int $amount, string $label): void
    {
        if ($amount < 0) {
            throw new InvalidArgumentException("{$label} cannot be negative.");
        }
    }
}