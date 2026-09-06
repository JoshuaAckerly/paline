<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_guest_is_redirected_to_admin_login_and_back_after_signing_in(): void
    {
        $this->get('/admin')->assertRedirect('/admin/login');

        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);
        $this->actingAs($admin);

        $this->get('/admin')->assertOk();
    }

    public function test_a_non_admin_user_is_forbidden(): void
    {
        $user = User::factory()->create(['email' => 'someone-else@example.com']);

        $this->actingAs($user)->get('/admin')->assertForbidden();
    }

    public function test_every_configured_admin_email_is_granted_access(): void
    {
        $secondAdmin = User::factory()->create(['email' => config('app.admin_emails')[1]]);

        $this->actingAs($secondAdmin)->get('/admin')->assertOk();
    }

    public function test_the_admin_email_is_shared_via_inertia(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->get('/admin')
            ->assertInertia(fn ($page) => $page->component('admin/dashboard')->where('auth.isAdmin', true));
    }
}
