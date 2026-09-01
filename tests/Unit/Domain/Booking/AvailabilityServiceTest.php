<?php

namespace Tests\Unit\Domain\Booking;

use App\Domain\Booking\AvailabilityService;
use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\ScheduledEngagement;
use DateTimeImmutable;
use InvalidArgumentException;
use PHPUnit\Framework\Attributes\DataProvider;
use PHPUnit\Framework\TestCase;

class AvailabilityServiceTest extends TestCase
{
    private AvailabilityService $service;

    protected function setUp(): void
    {
        parent::setUp();

        $config = require __DIR__.'/../../../../config/booking.php';
        $this->service = new AvailabilityService($config['scheduling']);
    }

    #[DataProvider('stateProvider')]
    public function test_it_classifies_public_date_states(
        string $date,
        bool $hasEngagement,
        bool $hasHold,
        bool $isBlocked,
        AvailabilityState $expected,
    ): void {
        $this->assertSame($expected, $this->service->stateFor(
            new DateTimeImmutable($date),
            $hasEngagement,
            $hasHold,
            $isBlocked,
            new DateTimeImmutable('2026-09-01'),
        ));
    }

    public static function stateProvider(): array
    {
        return [
            'open date' => ['2026-09-01', false, false, false, AvailabilityState::Available],
            'confirmed engagement' => ['2026-09-01', true, false, false, AvailabilityState::Limited],
            'private hold' => ['2026-09-01', false, true, false, AvailabilityState::Held],
            'explicit block' => ['2026-09-01', false, false, true, AvailabilityState::Blocked],
            'past date' => ['2026-08-31', false, false, false, AvailabilityState::Blocked],
            'horizon boundary' => ['2028-09-01', false, false, false, AvailabilityState::Available],
            'past horizon' => ['2028-09-02', false, false, false, AvailabilityState::Blocked],
        ];
    }

    public function test_an_empty_day_allows_every_valid_start_time_boundary(): void
    {
        $result = $this->service->sameDayWindows([]);

        $this->assertTrue($result->allowsStart(10 * 60));
        $this->assertTrue($result->allowsStart(23 * 60));
        $this->assertFalse($result->allowsStart((10 * 60) - 1));
        $this->assertFalse($result->allowsStart((23 * 60) + 1));
    }

    public function test_it_reserves_two_hours_on_each_side_of_both_performances(): void
    {
        $result = $this->service->sameDayWindows([
            new ScheduledEngagement(19 * 60, 21 * 60),
        ]);

        $this->assertTrue($result->preliminary);
        $this->assertCount(1, $result->windows);
        $this->assertSame(10 * 60, $result->windows[0]->earliestStartMinute);
        $this->assertSame((13 * 60) + 30, $result->windows[0]->latestStartMinute);
    }

    public function test_directional_travel_reduces_windows_before_and_after_an_engagement(): void
    {
        $travel = fn (string $from, string $to): int => match ("{$from}:{$to}") {
            'candidate:existing' => 45,
            'existing:candidate' => 30,
        };

        $result = $this->service->sameDayWindows(
            [new ScheduledEngagement(17 * 60, 18 * 60, 'existing')],
            90,
            'candidate',
            $travel,
        );

        $this->assertFalse($result->preliminary);
        $this->assertSame((10 * 60) + 45, $result->windows[0]->latestStartMinute);
        $this->assertSame((22 * 60) + 30, $result->windows[1]->earliestStartMinute);
    }

    public function test_it_finds_a_start_window_between_existing_engagements(): void
    {
        $result = $this->service->sameDayWindows([
            new ScheduledEngagement(10 * 60, 11 * 60),
            new ScheduledEngagement(22 * 60, 23 * 60),
        ]);

        $this->assertCount(1, $result->windows);
        $this->assertSame(15 * 60, $result->windows[0]->earliestStartMinute);
        $this->assertSame((16 * 60) + 30, $result->windows[0]->latestStartMinute);
    }

    public function test_insufficient_travel_can_remove_every_start_window(): void
    {
        $result = $this->service->sameDayWindows(
            [new ScheduledEngagement(15 * 60, 20 * 60, 'existing')],
            90,
            'candidate',
            fn (string $from, string $to): int => 120,
        );

        $this->assertFalse($result->hasAvailableStart());
    }

    public function test_an_existing_engagement_crossing_midnight_is_normalized(): void
    {
        $result = $this->service->sameDayWindows([
            new ScheduledEngagement(22 * 60, 60),
        ]);

        $this->assertCount(1, $result->windows);
        $this->assertSame((16 * 60) + 30, $result->windows[0]->latestStartMinute);
    }

    public function test_final_validation_requires_all_locations(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service->sameDayWindows(
            [new ScheduledEngagement(19 * 60, 20 * 60)],
            90,
            'candidate',
            fn (string $from, string $to): int => 30,
        );
    }

    public function test_it_rejects_negative_travel_time(): void
    {
        $this->expectException(InvalidArgumentException::class);

        $this->service->sameDayWindows(
            [new ScheduledEngagement(19 * 60, 20 * 60, 'existing')],
            90,
            'candidate',
            fn (string $from, string $to): int => -1,
        );
    }
}