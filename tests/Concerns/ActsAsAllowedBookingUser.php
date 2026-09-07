<?php

namespace Tests\Concerns;

use App\Models\BookingAllowedEmail;
use App\Models\User;

trait ActsAsAllowedBookingUser
{
    protected function setUpActsAsAllowedBookingUser(): void
    {
        $user = User::factory()->create(['email' => 'booking-tester@example.com']);
        BookingAllowedEmail::create(['email' => $user->email]);

        $this->actingAs($user);
    }
}
