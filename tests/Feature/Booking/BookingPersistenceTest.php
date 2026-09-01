<?php

namespace Tests\Feature\Booking;

use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\BookingSourcePath;
use App\Domain\Booking\BookingStatus;
use App\Domain\Booking\EngagementStatus;
use App\Domain\Booking\HoldStatus;
use App\Domain\Booking\OrganizationRole;
use App\Domain\Booking\OrganizationType;
use App\Domain\Booking\PerformanceFormat;
use App\Models\BookingRequest;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingPersistenceTest extends TestCase
{
    use RefreshDatabase;

    public function test_organizations_link_authorized_users_venues_and_contacts(): void
    {
        $user = User::factory()->create();
        $organization = Organization::create([
            'name' => 'Example Productions',
            'type' => OrganizationType::Promoter,
        ]);
        $organization->users()->attach($user, ['role' => OrganizationRole::BookingContact->value]);
        $venue = $organization->venues()->create([
            'name' => 'Example Hall',
            'city' => 'Buffalo',
            'state' => 'NY',
        ]);
        $contact = $organization->contacts()->create([
            'venue_id' => $venue->id,
            'name' => 'Jamie Buyer',
            'email' => 'jamie@example.com',
        ]);

        $this->assertTrue($user->organizations->contains($organization));
        $this->assertSame(OrganizationRole::BookingContact->value, $user->organizations->first()->pivot->role);
        $this->assertTrue($organization->venues->contains($venue));
        $this->assertTrue($venue->contacts->contains($contact));
        $this->assertSame(OrganizationType::Promoter, $organization->type);
    }

    public function test_an_anonymous_booking_draft_can_be_persisted_and_claimed_later(): void
    {
        $draft = BookingRequest::create([
            'anonymous_token_hash' => hash('sha256', 'secret-recovery-token'),
            'source_path' => BookingSourcePath::Exact,
        ]);

        $this->assertNull($draft->requester);
        $this->assertSame(BookingStatus::Draft, $draft->status);
        $this->assertSame(BookingSourcePath::Exact, $draft->source_path);
        $this->assertNull($draft->primary_date);
    }

    public function test_booking_dates_engagements_and_holds_preserve_lifecycle_state(): void
    {
        $booking = BookingRequest::create([
            'source_path' => BookingSourcePath::Flexible,
            'primary_date' => '2026-10-10',
            'performance_format' => PerformanceFormat::FullPaLine,
        ]);
        $date = $booking->dates()->create([
            'date' => '2026-10-10',
            'start_time' => '19:00',
            'end_time' => '21:00',
            'availability_status' => AvailabilityState::Limited,
        ]);
        $engagement = $booking->engagements()->create([
            'booking_date_id' => $date->id,
            'performance_date' => '2026-10-10',
            'start_time' => '19:00',
            'end_time' => '21:00',
        ]);
        $hold = $booking->holds()->create([
            'date' => '2026-10-10',
            'status' => HoldStatus::Active,
            'expires_at' => now()->addDay(),
        ]);

        $this->assertSame(PerformanceFormat::FullPaLine, $booking->performance_format);
        $this->assertSame(AvailabilityState::Limited, $date->availability_status);
        $this->assertSame(EngagementStatus::Confirmed, $engagement->status);
        $this->assertSame(HoldStatus::Active, $hold->status);
        $this->assertTrue($booking->dates->contains($date));
        $this->assertTrue($booking->engagements->contains($engagement));
        $this->assertTrue($booking->holds->contains($hold));
    }
}