<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\Concerns\ActsAsAllowedBookingUser;
use Tests\TestCase;

class BookingPageTest extends TestCase
{
    use ActsAsAllowedBookingUser;
    use RefreshDatabase;

    public function test_the_booking_route_redirects_to_the_exact_copy_site(): void
    {
        $this->get('/booking')->assertRedirect('https://demo.palineofficial.com');
    }

    public function test_an_inertia_xhr_visit_gets_a_client_side_location_response_not_a_blocked_xhr_redirect(): void
    {
        $version = hash_file('xxh128', public_path('build/manifest.json'));

        $this->get('/booking', ['X-Inertia' => 'true', 'X-Inertia-Version' => $version])
            ->assertStatus(409)
            ->assertHeader('X-Inertia-Location', 'https://demo.palineofficial.com');
    }

    public function test_the_v50_prototype_remains_available_as_a_reference(): void
    {
        $this->assertFileExists(public_path('booking-prototype/index.html'));

        $this->assertStringContainsString(
            '<title>Book PA LINE</title>',
            file_get_contents(public_path('booking-prototype/index.html'))
        );
    }
}