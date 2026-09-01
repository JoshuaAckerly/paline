<?php

namespace Tests\Feature;

use Tests\TestCase;

class BookingPageTest extends TestCase
{
    public function test_the_booking_route_opens_the_published_v50_page(): void
    {
        $this->get('/booking')->assertRedirect('/booking/');

        $this->assertFileExists(public_path('booking/index.html'));
        $this->assertStringContainsString(
            '<title>Book PA LINE</title>',
            file_get_contents(public_path('booking/index.html'))
        );
    }
}