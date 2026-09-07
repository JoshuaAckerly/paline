<?php

namespace Tests\Feature\Admin;

use App\Models\BookingAllowedEmail;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingAllowedEmailsTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_add_and_remove_an_allowed_email(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->post('/admin/booking-access', [
            'email' => 'Tester@Example.com',
            'note' => 'Early access tester',
        ])->assertRedirect();

        $allowed = BookingAllowedEmail::sole();
        $this->assertSame('tester@example.com', $allowed->email);
        $this->assertTrue(BookingAllowedEmail::allows('TESTER@example.com'));

        $this->actingAs($admin)->delete("/admin/booking-access/{$allowed->id}")->assertRedirect();
        $this->assertDatabaseMissing('booking_allowed_emails', ['id' => $allowed->id]);
    }

    public function test_duplicate_emails_are_rejected(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);
        BookingAllowedEmail::create(['email' => 'tester@example.com']);

        $this->actingAs($admin)->post('/admin/booking-access', [
            'email' => 'Tester@Example.com',
        ])->assertSessionHasErrors('email');
    }

    public function test_a_guest_cannot_manage_allowed_emails(): void
    {
        $this->post('/admin/booking-access', ['email' => 'someone@example.com'])
            ->assertRedirect('/admin/login');
    }
}
