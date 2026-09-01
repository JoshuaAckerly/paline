<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class BookingPageTest extends TestCase
{
    public function test_the_booking_route_opens_the_production_inertia_page(): void
    {
        $this->get('/booking')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('booking'));
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