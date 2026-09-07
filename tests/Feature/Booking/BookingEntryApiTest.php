<?php

namespace Tests\Feature\Booking;

use App\Contracts\GeocodingProvider;
use App\Contracts\RoutingProvider;
use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\BookingSourcePath;
use App\Domain\Booking\BookingStatus;
use App\Domain\Booking\BudgetFitStatus;
use App\Domain\Booking\PerformanceFormat;
use App\Models\BookingRequest;
use App\Models\CalendarBlock;
use App\Models\DemandSignal;
use App\Services\MapboxGeocodingProvider;
use App\Services\MapboxRoutingProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Http;
use Tests\Concerns\ActsAsAllowedBookingUser;
use Tests\TestCase;

class BookingEntryApiTest extends TestCase
{
    use ActsAsAllowedBookingUser;
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

    public function test_a_flexible_window_ranks_candidates_by_verified_routing_when_providers_are_configured(): void
    {
        Http::fake([
            '*/geocoding/v5/*' => Http::response(['features' => [['center' => [-78.8784, 42.8864]]]]),
            '*/directions/v5/*' => Http::response(['routes' => [['distance' => 16093.44, 'duration' => 1800]]]),
        ]);
        $this->app->instance(GeocodingProvider::class, new MapboxGeocodingProvider('test-token', 'https://api.mapbox.com'));
        $this->app->instance(RoutingProvider::class, new MapboxRoutingProvider('test-token', 'https://api.mapbox.com'));

        $response = $this->postJson('/booking-requests', [
            'source_path' => 'flexible',
            'city' => 'Buffalo',
            'state' => 'NY',
            'window_starts_on' => '2026-10-10',
            'window_ends_on' => '2026-10-13',
        ]);

        $response->assertCreated()
            ->assertJsonPath('routing_status', 'verified')
            ->assertJsonPath('dates.0.miles', 20);

        Http::assertSent(fn ($request): bool => str_contains($request->url(), '/geocoding/v5/mapbox.places/'));
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

    public function test_a_completed_draft_can_store_performance_and_sound_options(): void
    {
        $draft = $this->createDetailedDraft('2027-04-10');

        $this->patchJson('/booking-requests/'.$draft['id'].'/production', [
            'draft_token' => $draft['token'],
            'performance_format' => 'full_pa_line',
            'performance_length_minutes' => 120,
            'sound_provided' => true,
            'house_engineer_provided' => false,
            'true_potential_requested' => true,
        ])->assertOk()
            ->assertJsonPath('status', 'production_saved')
            ->assertJsonPath('performance_format', 'full_pa_line')
            ->assertJsonPath('house_engineer_provided', false);

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame(PerformanceFormat::FullPaLine, $booking->performance_format);
        $this->assertSame(120, $booking->performance_length_minutes);
        $this->assertTrue($booking->true_potential_requested);
    }

    public function test_true_potential_requires_six_months_lead_time(): void
    {
        Carbon::setTestNow('2026-09-01');
        $draft = $this->createDetailedDraft('2026-10-10');

        $this->patchJson('/booking-requests/'.$draft['id'].'/production', [
            'draft_token' => $draft['token'],
            'performance_format' => 'duo',
            'performance_length_minutes' => 90,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('true_potential_requested');

        $this->assertNull(BookingRequest::findOrFail($draft['id'])->performance_format);
    }

    public function test_production_options_require_completed_details_and_a_valid_token(): void
    {
        $booking = BookingRequest::create([
            'source_path' => BookingSourcePath::Exact,
            'anonymous_token_hash' => hash('sha256', 'correct-token'),
            'primary_date' => '2027-04-10',
        ]);

        $payload = [
            'draft_token' => 'wrong-token',
            'performance_format' => 'solo',
            'performance_length_minutes' => 60,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => false,
        ];

        $this->patchJson('/booking-requests/'.$booking->id.'/production', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('draft');

        $payload['draft_token'] = 'correct-token';
        $this->patchJson('/booking-requests/'.$booking->id.'/production', $payload)
            ->assertUnprocessable()->assertJsonValidationErrors('draft');
    }

    public function test_specific_additional_dates_are_checked_and_persisted_per_date(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');
        CalendarBlock::create(['starts_on' => '2027-04-12', 'ends_on' => '2027-04-12', 'reason' => 'Private block']);

        $response = $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'],
            'booking_type' => 'repeat',
            'mode' => 'specific',
            'dates' => ['2027-04-11', '2027-04-12', '2027-04-10'],
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'dates_reviewed')
            ->assertJsonCount(2, 'accepted')
            ->assertJsonFragment(['date' => '2027-04-12', 'reason' => 'blocked'])
            ->assertJsonFragment(['date' => '2027-04-10', 'reason' => 'primary']);

        $booking = BookingRequest::with('dates')->findOrFail($draft['id']);
        $this->assertSame('repeat', $booking->booking_type);
        $this->assertCount(2, $booking->dates);
        $additionalDate = $booking->dates->first(
            fn ($date) => $date->date->toDateString() === '2027-04-11',
        );
        $this->assertSame('19:00', $additionalDate?->start_time);
    }

    public function test_recurring_dates_use_the_domain_generator_and_month_end_clamping(): void
    {
        $draft = $this->createProductionDraft('2027-01-31');

        $response = $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'],
            'booking_type' => 'series',
            'mode' => 'recurring',
            'frequency' => 'monthly',
            'count' => 3,
        ]);

        $response->assertOk()
            ->assertJsonCount(4, 'accepted')
            ->assertJsonFragment(['date' => '2027-02-28', 'primary' => false])
            ->assertJsonFragment(['date' => '2027-03-31', 'primary' => false])
            ->assertJsonFragment(['date' => '2027-04-30', 'primary' => false]);

        $this->assertSame('monthly', BookingRequest::findOrFail($draft['id'])->recurrence_frequency);
    }

    public function test_an_additional_date_can_be_removed_but_the_primary_date_cannot(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');
        $dates = $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'], 'booking_type' => 'repeat',
            'mode' => 'specific', 'dates' => ['2027-04-11'],
        ])->json('accepted');
        $primary = collect($dates)->firstWhere('primary', true);
        $additional = collect($dates)->firstWhere('primary', false);

        $this->deleteJson('/booking-requests/'.$draft['id'].'/dates/'.$additional['id'], [
            'draft_token' => $draft['token'],
        ])->assertNoContent();
        $this->deleteJson('/booking-requests/'.$draft['id'].'/dates/'.$primary['id'], [
            'draft_token' => $draft['token'],
        ])->assertUnprocessable()->assertJsonValidationErrors('date');

        $this->assertDatabaseCount('booking_dates', 1);
    }

    public function test_selecting_a_flexible_candidate_discards_unselected_suggestions(): void
    {
        $draft = $this->postJson('/booking-requests', [
            'source_path' => 'flexible', 'city' => 'Buffalo', 'state' => 'NY',
            'window_starts_on' => '2027-04-10', 'window_ends_on' => '2027-04-13',
        ]);
        $selectedDate = $draft->json('dates.0.date');

        $this->saveDetails($draft->json('id'), $draft->json('draft_token'), $selectedDate)->assertOk();

        $booking = BookingRequest::with('dates')->findOrFail($draft->json('id'));
        $this->assertCount(1, $booking->dates);
        $this->assertSame($selectedDate, $booking->dates->sole()->date->toDateString());
    }

    public function test_additional_dates_cannot_exceed_twenty_four_across_requests(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');
        $dates = collect(range(1, 24))
            ->map(fn (int $days) => Carbon::parse('2027-01-01')->addDays($days)->toDateString())
            ->all();

        $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'], 'booking_type' => 'series',
            'mode' => 'specific', 'dates' => $dates,
        ])->assertOk();

        $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'], 'booking_type' => 'series',
            'mode' => 'specific', 'dates' => ['2027-02-01'],
        ])->assertUnprocessable()->assertJsonValidationErrors('dates');

        $this->assertSame(25, BookingRequest::findOrFail($draft['id'])->dates()->count());
    }

    public function test_a_workable_budget_is_stored_without_exposing_the_internal_amount(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');

        $response = $this->patchJson('/booking-requests/'.$draft['id'].'/budget', [
            'draft_token' => $draft['token'],
            'working_budget' => 100000,
        ]);

        $response->assertOk()
            ->assertJsonPath('status', 'workable')
            ->assertJsonPath('can_continue', true)
            ->assertJsonMissingPath('required_internal_amount');

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame(100000, $booking->working_budget);
        $this->assertSame(BudgetFitStatus::Workable, $booking->budget_status);
    }

    public function test_a_short_budget_requires_an_adjustment_before_continuing(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');

        $this->patchJson('/booking-requests/'.$draft['id'].'/budget', [
            'draft_token' => $draft['token'],
            'working_budget' => 1,
        ])->assertOk()
            ->assertJsonPath('status', 'adjustment_needed')
            ->assertJsonPath('can_continue', false);
    }

    public function test_true_potential_always_requires_manual_budget_review(): void
    {
        Carbon::setTestNow('2026-09-01');
        $draft = $this->createDetailedDraft('2027-04-10');
        $this->patchJson('/booking-requests/'.$draft['id'].'/production', [
            'draft_token' => $draft['token'],
            'performance_format' => 'full_pa_line',
            'performance_length_minutes' => 120,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => true,
        ])->assertOk();

        $this->patchJson('/booking-requests/'.$draft['id'].'/budget', [
            'draft_token' => $draft['token'],
            'working_budget' => 5000,
        ])->assertOk()
            ->assertJsonPath('status', 'manual_review')
            ->assertJsonPath('priced_quote_allowed', false);
    }

    public function test_skipping_the_budget_clears_any_prior_selection(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');
        $this->patchJson('/booking-requests/'.$draft['id'].'/budget', [
            'draft_token' => $draft['token'], 'working_budget' => 100000,
        ])->assertOk();

        $this->patchJson('/booking-requests/'.$draft['id'].'/budget', [
            'draft_token' => $draft['token'], 'working_budget' => null,
        ])->assertOk()->assertJsonPath('status', 'skipped');

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertNull($booking->working_budget);
        $this->assertNull($booking->budget_status);
    }

    public function test_a_merch_package_can_be_selected_and_totaled(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');

        $response = $this->patchJson('/booking-requests/'.$draft['id'].'/merch', [
            'draft_token' => $draft['token'],
            'merch_package' => 'dream',
            'quantity' => 10,
            'sizes' => 'assorted M-XL',
            'recipient' => 'Venue team',
        ]);

        $response->assertOk()
            ->assertJsonPath('merch_package', 'dream')
            ->assertJsonPath('merch_quantity', 10)
            ->assertJsonPath('merch_total', 200);

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame('Venue team', $booking->merch_recipient);
    }

    public function test_merch_requires_sizes_unless_declined(): void
    {
        $draft = $this->createProductionDraft('2027-01-01');

        $this->patchJson('/booking-requests/'.$draft['id'].'/merch', [
            'draft_token' => $draft['token'],
            'merch_package' => 'rep',
        ])->assertUnprocessable()->assertJsonValidationErrors('sizes');

        $this->patchJson('/booking-requests/'.$draft['id'].'/merch', [
            'draft_token' => $draft['token'],
            'merch_package' => 'none',
        ])->assertOk()->assertJsonPath('merch_total', 0);
    }

    public function test_a_booking_can_be_submitted_with_only_the_primary_date(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $response = $this->postJson('/booking-requests/'.$draft['id'].'/submit', [
            'draft_token' => $draft['token'],
        ]);

        $response->assertOk()->assertJsonPath('status', 'submitted');

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame(BookingStatus::Submitted, $booking->status);
        $this->assertNotNull($booking->submitted_at);
    }

    public function test_a_booking_can_be_submitted_after_adding_additional_dates(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');
        $this->postJson('/booking-requests/'.$draft['id'].'/dates', [
            'draft_token' => $draft['token'], 'booking_type' => 'repeat',
            'mode' => 'specific', 'dates' => ['2027-04-11'],
        ])->assertOk();

        $this->postJson('/booking-requests/'.$draft['id'].'/submit', [
            'draft_token' => $draft['token'],
        ])->assertOk()->assertJsonPath('status', 'submitted');

        $this->assertSame(BookingStatus::Submitted, BookingRequest::findOrFail($draft['id'])->status);
    }

    public function test_submitting_requires_production_details_to_be_completed(): void
    {
        $draft = $this->createDetailedDraft('2027-04-10');

        $this->postJson('/booking-requests/'.$draft['id'].'/submit', [
            'draft_token' => $draft['token'],
        ])->assertUnprocessable()->assertJsonValidationErrors('booking');
    }

    public function test_submitting_requires_a_valid_draft_token(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $this->postJson('/booking-requests/'.$draft['id'].'/submit', [
            'draft_token' => 'wrong-token',
        ])->assertUnprocessable()->assertJsonValidationErrors('draft');
    }

    public function test_resubmitting_an_already_submitted_booking_keeps_the_original_timestamp(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');
        $this->postJson('/booking-requests/'.$draft['id'].'/submit', ['draft_token' => $draft['token']])->assertOk();
        $firstSubmittedAt = BookingRequest::findOrFail($draft['id'])->submitted_at;

        $this->postJson('/booking-requests/'.$draft['id'].'/submit', ['draft_token' => $draft['token']])
            ->assertOk()->assertJsonPath('status', 'submitted');

        $this->assertTrue($firstSubmittedAt->equalTo(BookingRequest::findOrFail($draft['id'])->submitted_at));
    }

    /** @return array{id: string, token: string} */
    private function createDetailedDraft(string $date): array
    {
        $draft = $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => $date]);
        $this->saveDetails($draft->json('id'), $draft->json('draft_token'), $date)->assertOk();

        return ['id' => $draft->json('id'), 'token' => $draft->json('draft_token')];
    }

    /** @return array{id: string, token: string} */
    private function createProductionDraft(string $date): array
    {
        $draft = $this->createDetailedDraft($date);
        $this->patchJson('/booking-requests/'.$draft['id'].'/production', [
            'draft_token' => $draft['token'],
            'performance_format' => 'duo',
            'performance_length_minutes' => 90,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => false,
        ])->assertOk();

        return $draft;
    }

    private function saveDetails(string $id, string $token, string $date): \Illuminate\Testing\TestResponse
    {
        return $this->patchJson('/booking-requests/'.$id, [
            'draft_token' => $token,
            'selected_date' => $date,
            'venue' => ['name' => 'Town Ballroom', 'street_address' => '681 Main Street', 'city' => 'Buffalo', 'state' => 'NY', 'postal_code' => '14203'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ]);
    }
}