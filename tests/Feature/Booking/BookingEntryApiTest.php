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

    public function test_an_anonymous_draft_can_store_venue_event_and_contact_details(): void
    {
        $draft = $this->postJson('/booking-requests', [
            'source_path' => 'exact',
            'primary_date' => '2026-10-10',
        ]);

        $response = $this->patchJson('/booking-requests/'.$draft->json('id'), [
            'draft_token' => $draft->json('draft_token'),
            'venue' => [
                'name' => 'Town Ballroom',
                'street_address' => '681 Main Street',
                'city' => 'Buffalo',
                'state' => 'NY',
                'postal_code' => '14203',
            ],
            'event' => [
                'name' => 'PA LINE at Town Ballroom',
                'type' => 'public_performance',
                'setting' => 'indoor',
                'start' => '19:00',
                'end' => '22:00',
                'estimated_attendance' => 500,
            ],
            'contact' => [
                'name' => 'Jamie Buyer',
                'email' => 'jamie@example.com',
                'phone' => '716-555-0100',
            ],
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'details_saved')
            ->assertJsonPath('venue.name', 'Town Ballroom')
            ->assertJsonMissingPath('contact.email');

        $booking = BookingRequest::with(['venue', 'contact'])->findOrFail($draft->json('id'));
        $this->assertSame('PA LINE at Town Ballroom', $booking->event_name);
        $this->assertSame('Town Ballroom', $booking->venue->name);
        $this->assertSame($booking->venue_id, $booking->contact->venue_id);
    }

    public function test_resaving_details_updates_existing_venue_and_contact_without_orphans(): void
    {
        $draft = $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => '2026-10-10']);
        $payload = [
            'draft_token' => $draft->json('draft_token'),
            'selected_date' => '2026-10-10',
            'venue' => ['name' => 'Town Ballroom', 'street_address' => '681 Main Street', 'city' => 'Buffalo', 'state' => 'NY', 'postal_code' => '14203'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ];

        $this->patchJson('/booking-requests/'.$draft->json('id'), $payload)->assertOk();
        $payload['venue']['name'] = 'Updated Ballroom';
        $payload['contact']['name'] = 'Updated Buyer';
        $this->patchJson('/booking-requests/'.$draft->json('id'), $payload)->assertOk();

        $this->assertDatabaseCount('venues', 1);
        $this->assertDatabaseCount('contacts', 1);
        $this->assertDatabaseHas('venues', ['name' => 'Updated Ballroom']);
        $this->assertDatabaseHas('contacts', ['name' => 'Updated Buyer']);
    }

    public function test_booking_details_require_the_matching_anonymous_draft_token(): void
    {
        $booking = BookingRequest::create([
            'source_path' => BookingSourcePath::Exact,
            'anonymous_token_hash' => hash('sha256', 'correct-token'),
        ]);

        $this->patchJson('/booking-requests/'.$booking->id, [
            'draft_token' => 'wrong-token',
        ])->assertUnprocessable()->assertJsonValidationErrors('draft');

        $this->assertDatabaseCount('venues', 0);
        $this->assertDatabaseCount('contacts', 0);
    }

    public function test_flexible_details_must_choose_a_date_from_the_draft_options(): void
    {
        $draft = $this->postJson('/booking-requests', [
            'source_path' => 'flexible',
            'city' => 'Buffalo',
            'state' => 'NY',
            'window_starts_on' => '2026-10-10',
            'window_ends_on' => '2026-10-13',
        ]);

        $payload = [
            'draft_token' => $draft->json('draft_token'),
            'selected_date' => '2026-11-01',
            'venue' => ['name' => 'Town Ballroom', 'street_address' => '681 Main Street', 'city' => 'Buffalo', 'state' => 'NY', 'postal_code' => '14203'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ];

        $this->patchJson('/booking-requests/'.$draft->json('id'), $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('selected_date');

        $this->assertDatabaseCount('venues', 0);
    }

    public function test_details_recheck_a_candidate_that_becomes_blocked(): void
    {
        $draft = $this->postJson('/booking-requests', [
            'source_path' => 'flexible', 'city' => 'Buffalo', 'state' => 'NY',
            'window_starts_on' => '2026-10-10', 'window_ends_on' => '2026-10-13',
        ]);
        $selectedDate = $draft->json('dates.0.date');
        CalendarBlock::create(['starts_on' => $selectedDate, 'ends_on' => $selectedDate, 'reason' => 'New block']);

        $this->patchJson('/booking-requests/'.$draft->json('id'), [
            'draft_token' => $draft->json('draft_token'),
            'selected_date' => $selectedDate,
            'venue' => ['name' => 'Town Ballroom', 'street_address' => '681 Main Street', 'city' => 'Buffalo', 'state' => 'NY', 'postal_code' => '14203'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ])->assertUnprocessable()->assertJsonValidationErrors('selected_date');

        $this->assertDatabaseCount('venues', 0);
    }
}