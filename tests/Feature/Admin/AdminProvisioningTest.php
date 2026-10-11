<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AdminProvisioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_sync_creates_admin_with_a_random_password_instead_of_a_shared_default(): void
    {
        config([
            'app.admin_emails' => ['new-admin@example.com'],
            'app.prototype_admin_emails' => [],
        ]);

        $this->assertSame(0, Artisan::call('admin:sync-users'));

        $user = User::where('email', 'new-admin@example.com')->sole();
        $this->assertNotNull($user->email_verified_at);
        $this->assertFalse(Hash::check('00000000', $user->password));
    }
}
