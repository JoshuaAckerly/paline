<?php

namespace Tests\Feature\Admin;

use App\Models\ContactMessage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContactMessagesTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_contact_form_stores_a_message(): void
    {
        \Illuminate\Support\Facades\Mail::fake();

        $this->postJson('/contact', [
            'name' => 'Jamie Buyer',
            'email' => 'buyer@example.com',
            'subject' => 'Booking question',
            'message' => 'Are you available in October?',
        ])->assertOk();

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Jamie Buyer',
            'email' => 'buyer@example.com',
            'is_read' => false,
        ]);
    }

    public function test_an_admin_can_view_and_read_a_message(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);
        $message = ContactMessage::create([
            'name' => 'Jamie Buyer',
            'email' => 'buyer@example.com',
            'subject' => 'Booking question',
            'message' => 'Are you available in October?',
        ]);

        $this->actingAs($admin)->get('/admin/messages')->assertOk();
        $this->actingAs($admin)->get("/admin/messages/{$message->id}")->assertOk();

        $this->assertTrue($message->fresh()->is_read);
    }
}
