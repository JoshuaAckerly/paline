<?php

namespace App\Console\Commands;

use App\Models\BookingAllowedEmail;
use App\Services\MagicLinkService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\URL;

/**
 * Local/preview convenience only — prints a working magic sign-in link without
 * needing real email delivery. Refuses to run in production.
 */
class IssueMagicLink extends Command
{
    protected $signature = 'booking:magic-link {email} {--allow : Also add the email to the booking allowlist} {--base-url= : Override the host the link is generated for (defaults to APP_URL and a direct 127.0.0.1:8091 copy)}';

    protected $description = 'Issue a magic sign-in link for the given email without sending an email (local/preview only)';

    public function handle(MagicLinkService $magicLinks): int
    {
        if ($this->getLaravel()->environment('production')) {
            $this->error('This command is disabled in production — use the real email flow.');

            return self::FAILURE;
        }

        $email = $this->argument('email');

        if ($this->option('allow')) {
            BookingAllowedEmail::firstOrCreate(['email' => $email], ['note' => 'Added via booking:magic-link']);
            $this->info("Added {$email} to the booking allowlist.");
        }

        $this->info("Sign-in link for {$email}:");

        if ($baseUrl = $this->option('base-url')) {
            URL::forceRootUrl($baseUrl);
            [, $url] = $magicLinks->issue($email);
            $this->line($url);

            return self::SUCCESS;
        }

        // No explicit host: print both the configured APP_URL link and a direct
        // 127.0.0.1 copy, since APP_URL (ngrok) may not match how you're actually
        // reaching this box (e.g. straight to the preview port on this machine).
        [, $configuredUrl] = $magicLinks->issue($email);
        $this->line("  (APP_URL) {$configuredUrl}");

        URL::forceRootUrl('http://127.0.0.1:8091');
        URL::forceScheme('http');
        [, $localUrl] = $magicLinks->issue($email);
        $this->line("  (direct)  {$localUrl}");

        return self::SUCCESS;
    }
}
