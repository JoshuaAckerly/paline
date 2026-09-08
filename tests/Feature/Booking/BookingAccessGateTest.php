<?php

namespace Tests\Feature\Booking;

use App\Models\BookingAllowedEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingAccessGateTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_is_redirected_to_the_access_gate_and_back_after_signing_in(): void
    {
        $this->get('/booking')->assertRedirect(route('booking.access'));
        $this->assertTrue(str_ends_with((string) session('url.intended'), '/booking'));
    }

    public function test_an_authenticated_but_unapproved_email_is_bounced_with_a_denied_message(): void
    {
        $user = User::factory()->create(['email' => 'stranger@example.com']);

        $this->actingAs($user)->get('/booking')->assertRedirect(route('booking.access'));
        $this->assertTrue(session('booking_access_denied'));
    }

    public function test_an_approved_email_can_reach_the_booking_page(): void
    {
        $user = User::factory()->create(['email' => 'approved@example.com']);
        BookingAllowedEmail::create(['email' => 'Approved@Example.com']);

        $this->actingAs($user)->get('/booking')->assertRedirect('https://demo.palineofficial.com');
    }

    public function test_an_unauthenticated_json_request_is_rejected_without_a_redirect(): void
    {
        $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => '2026-10-10'])
            ->assertUnauthorized();
    }

    public function test_the_access_gate_page_itself_is_public(): void
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
