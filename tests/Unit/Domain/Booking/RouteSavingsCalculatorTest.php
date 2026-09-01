<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\RouteSavingsCalculator;
use App\Domain\Booking\RouteSavingsSource;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class RouteSavingsCalculatorTest extends TestCase
{
    private RouteSavingsCalculator $calculator;

    protected function setUp(): void
    {
        parent::setUp();

        $this->calculator = new RouteSavingsCalculator;
    }

    public function test_it_grants_only_incremental_savings_against_the_remaining_ceiling(): void
    {
        $result = $this->calculator->calculate(620, 100, 380);

        $this->assertSame(520, $result->protectedCurrentTravelCharge);
        $this->assertSame(380, $result->adjustedTravelCharge);
        $this->assertSame(140, $result->newSavings);
        $this->assertSame(240, $result->totalSavingsAfter);
        $this->assertFalse($result->mayIncrease);
    }

    public function test_a_worse_route_never_increases_the_protected_charge(): void
    {
        $result = $this->calculator->calculate(620, 100, 900);

        $this->assertSame(520, $result->adjustedTravelCharge);
        $this->assertSame(0, $result->newSavings);
        $this->assertSame(100, $result->totalSavingsAfter);
        $this->assertFalse($result->mayIncrease);
    }

    public function test_savings_already_granted_are_capped_at_the_original_ceiling(): void
    {
        $result = $this->calculator->calculate(620, 800, 100);

        $this->assertSame(620, $result->savingsAlreadyGranted);
        $this->assertSame(0, $result->protectedCurrentTravelCharge);
        $this->assertSame(0, $result->newSavings);
    }

    public function test_it_creates_a_reoptimization_event_only_for_new_savings(): void
    {
        $event = $this->calculator->createEvent($this->calculator->calculate(620, 0, 380));

        $this->assertNotNull($event);
        $this->assertSame(240, $event->savings);
        $this->assertSame(RouteSavingsSource::RouteReoptimization, $event->source);
        $this->assertNull($this->calculator->createEvent($this->calculator->calculate(620, 0, 700)));
    }

    public function test_referral_attribution_creates_a_route_builder_event(): void
    {
        $event = $this->calculator->createEvent($this->calculator->calculate(620, 0, 380), true);

        $this->assertSame(RouteSavingsSource::RouteBuilderReferral, $event?->source);
    }

    public function test_the_default_election_returns_all_savings_to_the_customer(): void
    {
        $allocation = $this->calculator->allocate(240);

        $this->assertSame(240, $allocation->returnAmount);
        $this->assertSame(0, $allocation->creditAmount);
        $this->assertSame(0, $allocation->reinvestAmount);
    }

    public function test_custom_allocation_reconciles_rounding_drift(): void
    {
        $allocation = $this->calculator->allocate(241, 50, 0, 50);

        $this->assertSame(241, $allocation->total());
        $this->assertSame(120, $allocation->returnAmount);
        $this->assertSame(121, $allocation->reinvestAmount);
    }

    #[DataProvider('neighborProvider')]
    public function test_only_immediate_schedule_neighbors_are_affected(
        int $count,
        int $newIndex,
        array $expected,
    ): void {
        $this->assertSame($expected, $this->calculator->affectedNeighborIndexes($count, $newIndex));
    }

    public static function neighborProvider(): array
    {
        return [
            'only show' => [1, 0, []],
            'first show' => [3, 0, [1]],
            'middle show' => [3, 1, [0, 2]],
            'last show' => [3, 2, [1]],
        ];
    }

    #[DataProvider('invalidAllocationProvider')]
    public function test_it_rejects_invalid_elections(int $return, int $credit, int $reinvest): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->calculator->allocate(240, $return, $credit, $reinvest);
    }

    public static function invalidAllocationProvider(): array
    {
        return [
            'under allocated' => [40, 40, 0],
            'over allocated' => [60, 60, 0],
            'negative percentage' => [-1, 51, 50],
            'percentage over 100' => [101, 0, 0],
        ];
    }
}