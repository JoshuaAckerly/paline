<?php

namespace Tests\Feature\Booking;

use App\Domain\Booking\BookingSourcePath;
use App\Domain\Booking\HoldStatus;
use App\Models\BookingHold;
use App\Models\BookingRequest;
use App\Models\CalendarBlock;
use App\Models\Engagement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Tests\TestCase;

class AvailabilityApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Carbon::setTestNow('2026-09-01 12:00:00');
    }

    protected function tearDown(): void
    {
        Carbon::setTestNow();
        parent::tearDown();
    }

    public function test_the_public_calendar_exposes_states_without_private_details(): void
    {
        Engagement::create([
            'title' => 'Private Client Event',
            'performance_date' => '2026-09-02',
            'start_time' => '19:00',
            'end_time' => '21:00',
            'private_notes' => 'Confidential contract details',
        ]);
        BookingHold::create(['date' => '2026-09-03', 'status' => HoldStatus::Active]);
        CalendarBlock::create(['starts_on' => '2026-09-04', 'ends_on' => '2026-09-05', 'reason' => 'Private reason']);

        $response = $this->getJson(route('availability.index', [
            'from' => '2026-09-01',
            'to' => '2026-09-05',
        ]))->assertOk()->assertExactJson(['dates' => [
            ['date' => '2026-09-01', 'state' => 'available'],
            ['date' => '2026-09-02', 'state' => 'limited'],
            ['date' => '2026-09-03', 'state' => 'held'],
            ['date' => '2026-09-04', 'state' => 'blocked'],
            ['date' => '2026-09-05', 'state' => 'blocked'],
        ]]);

        $response->assertJsonMissing(['title' => 'Private Client Event']);
        $response->assertJsonMissing(['private_notes' => 'Confidential contract details']);
        $response->assertJsonMissing(['reason' => 'Private reason']);
    }

    public function test_expired_holds_do_not_block_a_date(): void
    {
        BookingHold::create([
            'date' => '2026-09-03',
            'status' => HoldStatus::Active,
            'expires_at' => now()->subMinute(),
        ]);

        $this->postJson(route('availability.check'), ['date' => '2026-09-03'])
            ->assertOk()
            ->assertExactJson(['date' => '2026-09-03', 'state' => 'available']);
    }

    public function test_released_holds_do_not_block_a_date(): void
    {
        BookingHold::create(['date' => '2026-09-03', 'status' => HoldStatus::Released]);

        $this->postJson(route('availability.check'), ['date' => '2026-09-03'])
            ->assertOk()
            ->assertJsonPath('state', 'available');
    }

    public function test_calendar_precedence_is_blocked_then_held_then_limited(): void
    {
        Engagement::create([
            'performance_date' => '2026-09-03',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);
        BookingHold::create(['date' => '2026-09-03']);
        CalendarBlock::create(['starts_on' => '2026-09-03', 'ends_on' => '2026-09-03']);

        $this->postJson(route('availability.check'), ['date' => '2026-09-03'])
            ->assertOk()
            ->assertJsonPath('state', 'blocked');
    }

    public function test_large_or_invalid_ranges_are_rejected(): void
    {
        $this->getJson(route('availability.index', ['from' => '2026-09-01', 'to' => '2027-01-01']))
            ->assertUnprocessable();
        $this->getJson(route('availability.index', ['from' => '2026-09-02', 'to' => '2026-09-01']))
            ->assertUnprocessable();
    }
}