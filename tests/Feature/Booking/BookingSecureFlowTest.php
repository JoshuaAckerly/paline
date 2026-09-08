<?php

namespace Tests\Feature\Booking;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\BookingStatus;
use App\Domain\Booking\PerformanceFormat;
use App\Domain\Booking\RouteEstimate;
use App\Models\BookingRequest;
use App\Models\LegalDocument;
use App\Models\Organization;
use App\Models\RouteSavingsElection;
use App\Models\RouteSavingsEvent;
use App\Models\User;
use App\Services\RouteSavingsTriggerService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\Concerns\ActsAsAllowedBookingUser;
use Tests\TestCase;

class BookingSecureFlowTest extends TestCase
{
    use ActsAsAllowedBookingUser;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(\Illuminate\Routing\Middleware\ThrottleRequests::class);

        foreach (['agreement', 'nda', 'stage', 'tech', 'hospitality'] as $key) {
            LegalDocument::create([
                'document_key' => $key,
                'version' => '1.0',
                'title' => ucfirst($key),
                'content' => '<p>Terms for '.$key.'. '.str_repeat('More text. ', 20).'</p>',
                'content_hash' => hash('sha256', $key.'-content'),
                'is_active' => true,
            ]);
        }
    }

    public function test_secure_access_claims_the_draft_for_the_authenticated_user(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $response = $this->postJson('/booking-requests/'.$draft['id'].'/secure-access', [
            'draft_token' => $draft['token'],
            'name' => 'Jamie Buyer',
            'organization' => 'Town Ballroom Presents',
        ]);

        $response->assertOk()->assertJsonPath('status', 'secured');

        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame(User::where('email', 'booking-tester@example.com')->sole()->id, $booking->requester_user_id);
        $this->assertSame(BookingStatus::ConfidentialityRequired, $booking->status);
        $this->assertDatabaseHas('organizations', ['name' => 'Town Ballroom Presents']);
    }

    public function test_a_draft_can_no_longer_be_claimed_with_the_wrong_token(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $this->postJson('/booking-requests/'.$draft['id'].'/secure-access', [
            'draft_token' => 'wrong-token',
            'name' => 'Jamie Buyer',
            'organization' => 'Town Ballroom Presents',
        ])->assertUnprocessable()->assertJsonValidationErrors('draft');
    }

    public function test_exclusivity_fee_is_computed_and_stored(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $response = $this->patchJson('/booking-requests/'.$booking->id.'/exclusivity', [
            'requested' => true,
            'radius_miles' => 100,
            'days_before' => 30,
            'days_after' => 30,
            'applies_to' => 'public_performances',
            'exceptions' => 'none',
        ]);

        $response->assertOk()->assertJsonPath('exclusivity_fee', 525);
        $this->assertSame(525, $booking->fresh()->exclusivity_fee);
    }

    public function test_declining_exclusivity_clears_the_fee(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $this->patchJson('/booking-requests/'.$booking->id.'/exclusivity', ['requested' => false])
            ->assertOk()->assertJsonPath('exclusivity_fee', null);

        $this->assertNull($booking->fresh()->exclusivity_fee);
    }

    public function test_technical_rider_requires_an_issue_note_when_discussion_is_needed(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $this->patchJson('/booking-requests/'.$booking->id.'/technical-rider', [
            'can_accommodate' => false,
            'acknowledged' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('issue');

        $this->patchJson('/booking-requests/'.$booking->id.'/technical-rider', [
            'can_accommodate' => false,
            'issue' => 'No load-in access before 4pm.',
            'acknowledged' => true,
        ])->assertOk();

        $this->assertSame('needs_discussion', $booking->fresh()->tech_rider_status);
    }

    public function test_budget_fit_format_switch_updates_performance_format_only(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $response = $this->patchJson('/booking-requests/'.$draft['id'].'/format', [
            'draft_token' => $draft['token'],
            'format' => 'duo',
        ]);

        $response->assertOk()->assertJsonPath('performance_format', 'duo');
        $this->assertSame(PerformanceFormat::Duo, BookingRequest::findOrFail($draft['id'])->performance_format);
    }

    public function test_checkout_saves_contact_preference_and_notes(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $response = $this->patchJson('/booking-requests/'.$booking->id.'/checkout', [
            'name' => 'Jamie Buyer',
            'email' => 'jamie@example.com',
            'phone' => '716-555-0100',
            'organization' => 'Town Ballroom Presents',
            'preference' => 'text',
            'notes' => 'Please call after 5pm.',
        ]);

        $response->assertOk()->assertJsonPath('status', 'checkout_saved');
        $booking->refresh();
        $this->assertSame('text', $booking->contact_preference);
        $this->assertSame('Please call after 5pm.', $booking->contact_notes);
        $this->assertSame('716-555-0100', $booking->contact->phone);
    }

    public function test_true_potential_can_store_budget_range_and_notes(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $response = $this->patchJson('/booking-requests/'.$draft['id'].'/production', [
            'draft_token' => $draft['token'],
            'performance_format' => 'full_pa_line',
            'performance_length_minutes' => 120,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => true,
            'true_potential_budget_range' => '5000_10000',
            'true_potential_notes' => 'Would love string section.',
        ]);

        $response->assertOk();
        $booking = BookingRequest::findOrFail($draft['id']);
        $this->assertSame('5000_10000', $booking->true_potential_budget_range);
        $this->assertSame('Would love string section.', $booking->true_potential_notes);
    }

    public function test_returning_profile_self_reports_prior_qualified_shows(): void
    {
        $draft = $this->createProductionDraft('2027-04-10');

        $response = $this->patchJson('/booking-requests/'.$draft['id'].'/returning-profile', [
            'draft_token' => $draft['token'],
            'prior_qualified_shows' => 4,
        ]);

        $response->assertOk()->assertJsonPath('repeat_eligible', true);
    }

    public function test_confidentiality_requires_the_nda_to_be_scrolled_to_the_end_first(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $this->postJson('/booking-requests/'.$booking->id.'/confidentiality', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'confidentiality_ack' => true,
            'electronic_signature_consent' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('nda');

        $this->getJson('/booking-requests/'.$booking->id.'/documents/nda')->assertOk();
        $this->postJson('/booking-requests/'.$booking->id.'/documents/nda/reviewed')->assertOk();

        $this->postJson('/booking-requests/'.$booking->id.'/confidentiality', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'confidentiality_ack' => true,
            'electronic_signature_consent' => true,
        ])->assertOk()->assertJsonPath('status', 'confidentiality_accepted');

        $this->assertSame(BookingStatus::QuoteGenerated, $booking->fresh()->status);
    }

    public function test_quote_is_hidden_until_confidentiality_is_accepted_then_returns_a_priced_breakdown(): void
    {
        $booking = $this->claimedBooking('2027-04-10');

        $this->getJson('/booking-requests/'.$booking->id.'/quote')
            ->assertUnprocessable()->assertJsonValidationErrors('nda');

        $this->acceptConfidentiality($booking);

        $response = $this->getJson('/booking-requests/'.$booking->id.'/quote');
        $response->assertOk()->assertJsonPath('priced', true);
        $this->assertGreaterThan(0, $response->json('total'));
    }

    public function test_document_gate_requires_all_four_documents_reviewed_and_a_matching_signature(): void
    {
        $booking = $this->claimedBooking('2027-04-10');
        $this->acceptConfidentiality($booking);

        $this->postJson('/booking-requests/'.$booking->id.'/documents/sign', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'signature' => 'Jamie Buyer',
            'signed_date' => '2026-09-07',
            'electronic_signature_consent' => true,
            'final_acknowledgment' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('documents');

        foreach (['agreement', 'stage', 'tech', 'hospitality'] as $key) {
            $this->getJson('/booking-requests/'.$booking->id.'/documents/'.$key)->assertOk();
            $this->postJson('/booking-requests/'.$booking->id.'/documents/'.$key.'/reviewed')->assertOk();
        }

        $this->postJson('/booking-requests/'.$booking->id.'/documents/sign', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'signature' => 'someone else',
            'signed_date' => '2026-09-07',
            'electronic_signature_consent' => true,
            'final_acknowledgment' => true,
        ])->assertUnprocessable()->assertJsonValidationErrors('signature');

        $response = $this->postJson('/booking-requests/'.$booking->id.'/documents/sign', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'signature' => 'Jamie Buyer',
            'signed_date' => '2026-09-07',
            'electronic_signature_consent' => true,
            'final_acknowledgment' => true,
        ]);

        $response->assertOk()->assertJsonPath('status', 'submitted');
        $this->assertSame(BookingStatus::Submitted, $booking->fresh()->status);
        // 1 (nda, from acceptConfidentiality) + 4 (agreement/stage/tech/hospitality)
        $this->assertDatabaseCount('booking_legal_acknowledgments', 5);
    }

    public function test_admin_confirm_creates_a_route_savings_event_for_a_cheaper_neighbor(): void
    {
        Notification::fake();
        $this->app->instance(RoutingProvider::class, new class implements RoutingProvider
        {
            public function calculate($origin, $destination): RouteEstimate
            {
                // Home-base legs are the long way round; venue-to-venue is the short adjacent leg.
                $touchesHomeBase = abs($origin->latitude - 42.9034) < 0.01 || abs($destination->latitude - 42.9034) < 0.01;

                return $touchesHomeBase ? new RouteEstimate(60.0, 70, 'fake') : new RouteEstimate(20.0, 25, 'fake');
            }
        });

        $near = $this->claimedBookingWithVenue('2027-04-10', 'Buffalo', 'NY');
        $this->acceptConfidentiality($near);
        $this->signAllDocuments($near);
        app(RouteSavingsTriggerService::class)->confirm($near->fresh());
        $this->assertSame(BookingStatus::Confirmed, $near->fresh()->status);

        $newlyConfirmed = $this->claimedBookingWithVenue('2027-04-17', 'Rochester', 'NY');
        $this->acceptConfidentiality($newlyConfirmed);
        $this->signAllDocuments($newlyConfirmed);

        app(RouteSavingsTriggerService::class)->confirm($newlyConfirmed->fresh());

        $this->assertDatabaseHas('route_savings_events', [
            'booking_request_id' => $near->id,
            'triggering_booking_request_id' => $newlyConfirmed->id,
        ]);
    }

    public function test_route_savings_election_percentages_must_total_one_hundred(): void
    {
        $booking = $this->claimedBooking('2027-04-10');
        $event = RouteSavingsEvent::create([
            'booking_request_id' => $booking->id,
            'protected_travel_ceiling' => 400,
            'recalculated_travel_charge' => 160,
            'savings' => 240,
            'source' => 'route_reoptimization',
            'status' => 'pending',
        ]);

        $this->postJson('/route-savings/'.$event->id.'/elect', [
            'preset' => 'custom',
            'return_percent' => 60,
            'credit_percent' => 60,
            'reinvest_percent' => 0,
        ])->assertUnprocessable()->assertJsonValidationErrors('percentages');

        $response = $this->postJson('/route-savings/'.$event->id.'/elect', ['preset' => 'half']);

        $response->assertOk()->assertJsonPath('return_amount', 120)->assertJsonPath('reinvest_amount', 120);
        $this->assertDatabaseCount('route_savings_elections', 1);
        $this->assertSame('elected', $event->fresh()->status);
    }

    private function acceptConfidentiality(BookingRequest $booking): void
    {
        $this->getJson('/booking-requests/'.$booking->id.'/documents/nda')->assertOk();
        $this->postJson('/booking-requests/'.$booking->id.'/documents/nda/reviewed')->assertOk();
        $this->postJson('/booking-requests/'.$booking->id.'/confidentiality', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'confidentiality_ack' => true,
            'electronic_signature_consent' => true,
        ])->assertOk();
    }

    private function signAllDocuments(BookingRequest $booking): void
    {
        foreach (['agreement', 'stage', 'tech', 'hospitality'] as $key) {
            $this->getJson('/booking-requests/'.$booking->id.'/documents/'.$key)->assertOk();
            $this->postJson('/booking-requests/'.$booking->id.'/documents/'.$key.'/reviewed')->assertOk();
        }

        $this->postJson('/booking-requests/'.$booking->id.'/documents/sign', [
            'signer_name' => 'Jamie Buyer',
            'signer_title' => 'Owner',
            'signature' => 'Jamie Buyer',
            'signed_date' => '2026-09-07',
            'electronic_signature_consent' => true,
            'final_acknowledgment' => true,
        ])->assertOk();
    }

    /** @return array{id: string, token: string} */
    private function createProductionDraft(string $date): array
    {
        $draft = $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => $date]);

        $this->patchJson('/booking-requests/'.$draft->json('id'), [
            'draft_token' => $draft->json('draft_token'),
            'selected_date' => $date,
            'venue' => ['name' => 'Town Ballroom', 'street_address' => '681 Main Street', 'city' => 'Buffalo', 'state' => 'NY', 'postal_code' => '14203'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ])->assertOk();

        $this->patchJson('/booking-requests/'.$draft->json('id').'/production', [
            'draft_token' => $draft->json('draft_token'),
            'performance_format' => 'duo',
            'performance_length_minutes' => 90,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => false,
        ])->assertOk();

        return ['id' => $draft->json('id'), 'token' => $draft->json('draft_token')];
    }

    private function claimedBooking(string $date): BookingRequest
    {
        $draft = $this->createProductionDraft($date);

        $this->postJson('/booking-requests/'.$draft['id'].'/secure-access', [
            'draft_token' => $draft['token'],
            'name' => 'Jamie Buyer',
            'organization' => 'Town Ballroom Presents',
        ])->assertOk();

        return BookingRequest::findOrFail($draft['id']);
    }

    private function claimedBookingWithVenue(string $date, string $city, string $state): BookingRequest
    {
        $draft = $this->postJson('/booking-requests', ['source_path' => 'exact', 'primary_date' => $date]);

        $this->patchJson('/booking-requests/'.$draft->json('id'), [
            'draft_token' => $draft->json('draft_token'),
            'selected_date' => $date,
            'venue' => ['name' => $city.' Hall', 'street_address' => '1 Main Street', 'city' => $city, 'state' => $state, 'postal_code' => '14201'],
            'event' => ['name' => 'PA LINE Live', 'type' => 'public_performance', 'setting' => 'indoor', 'start' => '19:00', 'end' => '22:00', 'estimated_attendance' => 500],
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com'],
        ])->assertOk();

        $this->patchJson('/booking-requests/'.$draft->json('id').'/production', [
            'draft_token' => $draft->json('draft_token'),
            'performance_format' => 'duo',
            'performance_length_minutes' => 90,
            'sound_provided' => false,
            'house_engineer_provided' => null,
            'true_potential_requested' => false,
        ])->assertOk();

        $this->postJson('/booking-requests/'.$draft->json('id').'/secure-access', [
            'draft_token' => $draft->json('draft_token'),
            'name' => 'Jamie Buyer',
            'organization' => $city.' Presents',
        ])->assertOk();

        // Give the venue coordinates directly so the test doesn't depend on live geocoding.
        $booking = BookingRequest::findOrFail($draft->json('id'));
        $booking->venue->update([
            'latitude' => $city === 'Buffalo' ? 42.8864 : 43.1566,
            'longitude' => $city === 'Buffalo' ? -78.8784 : -77.6088,
        ]);

        return $booking->fresh();
    }
}
