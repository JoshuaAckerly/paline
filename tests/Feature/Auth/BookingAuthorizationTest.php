<?php

namespace Tests\Feature\Auth;

use App\Domain\Booking\OrganizationRole;
use App\Domain\Booking\OrganizationType;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class BookingAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_members_can_view_their_organization_and_venues(): void
    {
        $user = User::factory()->create();
        $organization = Organization::create(['name' => 'Operator', 'type' => OrganizationType::VenueOperator]);
        $organization->users()->attach($user, ['role' => OrganizationRole::Viewer->value]);
        $venue = $organization->venues()->create(['name' => 'Hall', 'city' => 'Buffalo', 'state' => 'NY']);

        $this->assertTrue(Gate::forUser($user)->allows('view', $organization));
        $this->assertTrue(Gate::forUser($user)->allows('view', $venue));
    }

    public function test_venue_name_alone_never_grants_access(): void
    {
        $authorized = User::factory()->create();
        $unauthorized = User::factory()->create();
        $organization = Organization::create(['name' => 'Operator', 'type' => OrganizationType::VenueOperator]);
        $organization->users()->attach($authorized, ['role' => OrganizationRole::Owner->value]);
        $venue = $organization->venues()->create(['name' => $unauthorized->name, 'city' => 'Buffalo', 'state' => 'NY']);

        $this->assertFalse(Gate::forUser($unauthorized)->allows('view', $organization));
        $this->assertFalse(Gate::forUser($unauthorized)->allows('view', $venue));
    }
}