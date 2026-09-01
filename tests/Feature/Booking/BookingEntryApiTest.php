<?php

namespace Tests\Feature\Booking;

use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\BookingSourcePath;
use App\Models\BookingRequest;
use App\Models\CalendarBlock;
use App\Models\DemandSignal;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingEntryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_exact_date_creates_an_anonymous_draft_with_server_availability(): void
    {
        $response = $this->postJson('/booking-requests', [
            'source_path' => 'exact',
            'primary_date' => '2026-10-10',
        ]);

        $response->assertCreated()
            ->assertJsonPath('source_path', 'exact')
            ->assertJsonPath('dates.0.date', '2026-10-10')
            ->assertJsonPath('dates.0.state', AvailabilityState::Available->value)
            ->assertJsonStructure(['id', 'draft_token']);

        $booking = BookingRequest::firstOrFail();
        $this->assertSame(BookingSourcePath::Exact, $booking->source_path);
        $this->assertSame(hash('sha256', $response->json('draft_token')), $booking->anonymous_token_hash);
        $this->assertCount(1, $booking->dates);
    }

    public function test_a_flexible_window_preserves_preferences_and_returns_safe_candidates(): void
    {
        CalendarBlock::create([
            'starts_on' => '2026-10-11',
            'ends_on' => '2026-10-11',
            'reason' => 'Private block',
        ]);

        $response = $this->postJson('/booking-requests', [
            'source_path' => 'flexible',
            'city' => 'Buffalo',
            'state' => 'NY',
            'window_starts_on' => '2026-10-10',
            'window_ends_on' => '2026-10-13',
        ]);

        $response->assertCreated()
            ->assertJsonPath('routing_status', 'verification_pending')
            ->assertJsonCount(3, 'dates');

        $booking = BookingRequest::firstOrFail();
        $this->assertSame('Buffalo', $booking->preferred_city);
        $this->assertSame('NY', $booking->preferred_state);
        $this->assertFalse($booking->dates->contains(fn ($date) => $date->date->toDateString() === '2026-10-11'));
    }

    public function test_an_exact_draft_is_rejected_if_the_date_is_no_longer_requestable(): void
    {
        CalendarBlock::create([
            'starts_on' => '2026-10-10',
            'ends_on' => '2026-10-10',
            'reason' => 'Private block',
        ]);

        $this->postJson('/booking-requests', [
            'source_path' => 'exact',
            'primary_date' => '2026-10-10',
        ])->assertUnprocessable()->assertJsonValidationErrors('primary_date');

        $this->assertDatabaseCount('booking_requests', 0);
    }

    public function test_a_demand_signal_records_contact_consent_and_momentum(): void
    {
        $response = $this->postJson('/demand', [
            'city' => 'Buffalo',
            'state' => 'NY',
            'preferred_venue' => 'Town Ballroom',
            'estimated_attendees' => 8,
            'local_role' => 'connector',
            'name' => 'Jamie Fan',
            'email' => 'jamie@example.com',
            'consent_to_updates' => true,
            'update_preference' => 'email',
            'momentum_actions' => ['share_social', 'contact_venue'],
        ]);

        $response->assertCreated()
            ->assertJsonPath('status', 'recorded')
            ->assertJsonPath('city', 'Buffalo');

        $signal = DemandSignal::firstOrFail();
        $this->assertTrue($signal->consent_to_updates);
        $this->assertSame(['share_social', 'contact_venue'], $signal->momentum_actions);
        $this->assertSame('Jamie Fan', $signal->name);
        $this->assertNotSame('jamie@example.com', $signal->getRawOriginal('email'));
    }
}