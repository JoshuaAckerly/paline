<?php

namespace Tests\Feature;

use App\Models\PrototypeInquiry;
use App\Notifications\NewPrototypeInquiry;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PrototypeInquiryApiTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'type' => 'booking',
            'source_key' => 'public-booking:lead_123',
            'contact' => ['name' => 'Jamie Buyer', 'email' => 'jamie@example.com', 'phone' => '716-555-0100'],
            'lead' => ['title' => 'Town Ballroom booking request', 'value' => 1200],
            'record' => ['subject' => 'Public booking request', 'body' => 'Full PA LINE · 2027-04-10'],
            'notification' => ['title' => 'New public booking request'],
        ], $overrides);
    }

    public function test_it_stores_a_booking_inquiry_and_notifies_the_admin(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/prototype-inquiries', $this->payload());

        $response->assertCreated()->assertJsonPath('status', 'received');
        $this->assertDatabaseHas('prototype_inquiries', [
            'type' => 'booking',
            'contact_name' => 'Jamie Buyer',
            'contact_email' => 'jamie@example.com',
        ]);

        Notification::assertSentOnDemand(NewPrototypeInquiry::class);
    }

    public function test_it_stores_a_demand_inquiry(): void
    {
        Notification::fake();

        $this->postJson('/api/prototype-inquiries', $this->payload(['type' => 'demand', 'source_key' => 'public-demand:lead_456']))
            ->assertCreated();

        $this->assertDatabaseHas('prototype_inquiries', ['type' => 'demand']);
    }

    public function test_it_requires_a_valid_contact_email(): void
    {
        $this->postJson('/api/prototype-inquiries', $this->payload(['contact' => ['name' => 'Jamie', 'email' => 'not-an-email']]))
            ->assertUnprocessable()
            ->assertJsonValidationErrors('contact.email');

        $this->assertDatabaseCount('prototype_inquiries', 0);
    }

    public function test_admin_can_view_and_delete_inquiries(): void
    {
        $inquiry = PrototypeInquiry::create([
            'type' => 'booking',
            'contact_name' => 'Jamie Buyer',
            'contact_email' => 'jamie@example.com',
            'payload' => $this->payload(),
        ]);

        $admin = \App\Models\User::factory()->create(['email' => config('app.admin_emails')[0]]);
        $this->actingAs($admin);

        $this->get('/admin/prototype-inquiries')->assertOk();
        $this->get('/admin/prototype-inquiries/'.$inquiry->id)->assertOk();
        $this->assertTrue($inquiry->fresh()->is_read);

        $this->delete('/admin/prototype-inquiries/'.$inquiry->id)->assertRedirect('/admin/prototype-inquiries');
        $this->assertDatabaseMissing('prototype_inquiries', ['id' => $inquiry->id]);
    }
}
