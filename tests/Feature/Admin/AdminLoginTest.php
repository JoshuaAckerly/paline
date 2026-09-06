<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_configured_admin_can_sign_in_with_the_right_password(): void
    {
        User::factory()->create([
            'email' => config('app.admin_emails')[0],
            'password' => Hash::make('correct-password'),
        ]);

        $this->post('/admin/login', [
            'email' => config('app.admin_emails')[0],
            'password' => 'correct-password',
        ])->assertRedirect('/admin');

        $this->assertAuthenticated();
    }

    public function test_the_wrong_password_is_rejected(): void
    {
        User::factory()->create([
            'email' => config('app.admin_emails')[0],
            'password' => Hash::make('correct-password'),
        ]);

        $this->post('/admin/login', [
            'email' => config('app.admin_emails')[0],
            'password' => 'wrong-password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_a_valid_password_for_a_non_admin_email_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'someone-else@example.com',
            'password' => Hash::make('correct-password'),
        ]);

        $this->post('/admin/login', [
            'email' => 'someone-else@example.com',
            'password' => 'correct-password',
        ])->assertSessionHasErrors('email');

        $this->assertGuest();
    }

    public function test_login_returns_to_the_originally_requested_admin_page(): void
    {
        User::factory()->create([
            'email' => config('app.admin_emails')[0],
            'password' => Hash::make('correct-password'),
        ]);

        $this->get('/admin/messages')->assertRedirect('/admin/login');

        $this->post('/admin/login', [
            'email' => config('app.admin_emails')[0],
            'password' => 'correct-password',
        ])->assertRedirect('/admin/messages');
    }

    public function test_magic_link_mode_shows_the_email_only_form_and_disables_password_login(): void
    {
        config(['app.admin_auth_method' => 'magic-link']);

        $this->get('/admin/login')->assertInertia(fn ($page) => $page
            ->component('admin/login')
            ->where('authMethod', 'magic-link'));

        $this->post('/admin/login', [
            'email' => config('app.admin_emails')[0],
            'password' => 'anything',
        ])->assertNotFound();
    }

    public function test_password_mode_is_the_default_and_shares_it_with_the_page(): void
    {
        $this->get('/admin/login')->assertInertia(fn ($page) => $page
            ->component('admin/login')
            ->where('authMethod', 'password'));
    }
}
