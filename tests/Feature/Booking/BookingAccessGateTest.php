<?php

namespace Tests\Feature\Booking;

use App\Domain\Booking\AvailabilityState;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingAccessGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_can_reach_the_booking_page_without_signing_in(): void
    {
        // Booking is fully public: no account or sign-in required.
        $this->get('/booking')->assertRedirect(url('/exact-copy-site/booking/index.html'));
    }

    public function test_an_authenticated_user_can_also_reach_the_booking_page(): void
    {
        $user = User::factory()->create(['email' => 'anyone@example.com']);

        $this->actingAs($user)->get('/booking')->assertRedirect(url('/exact-copy-site/booking/index.html'));
    }

    public function test_an_anonymous_json_request_can_start_a_booking_draft(): void
    {
        // No auth: the flow issues an anonymous draft token instead.
        $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => '2026-10-10'])
            ->assertCreated()
            ->assertJsonPath('source_path', 'exact')
            ->assertJsonPath('dates.0.state', AvailabilityState::Available->value)
            ->assertJsonStructure(['id', 'draft_token']);
    }

    public function test_the_legacy_access_page_is_still_reachable(): void
    {
        $this->get('/booking/access')->assertOk();
    }

    public function test_the_demand_endpoint_stays_public(): void
    {
        $this->postJson('/demand', [
            'city' => 'Buffalo',
            'state' => 'NY',
            'estimated_attendees' => 1,
            'local_role' => 'fan',
            'name' => 'Jamie Fan',
            'email' => 'jamie@example.com',
            'consent_to_updates' => false,
        ])->assertCreated();
    }
}
