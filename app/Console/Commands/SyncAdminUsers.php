<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class SyncAdminUsers extends Command
{
    protected $signature = 'admin:sync-users';

    protected $description = 'Create a User record for each configured admin email that does not already have one';

    public function handle(): int
    {
        $defaultPassword = config('app.admin_default_password');

        foreach (config('app.admin_emails', []) as $email) {
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => Str::headline(Str::before($email, '@')),
                    'password' => Hash::make($defaultPassword),
                    'email_verified_at' => now(),
                ],
            );

            $this->info($user->wasRecentlyCreated ? "Created admin user: {$email}" : "Already exists: {$email}");
        }

        return self::SUCCESS;
    }
}
