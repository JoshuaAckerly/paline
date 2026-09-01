<?php

namespace Tests\Feature\Auth;

use App\Domain\Booking\BookingSourcePath;
use App\Models\BookingRequest;
use App\Models\MagicLoginToken;
use App\Models\User;
use App\Notifications\MagicLoginLink;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MagicLinkAuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_magic_link_is_sent_without_storing_the_plain_secret(): void
    {
        Notification::fake();

        $this->postJson(route('auth.magic.store'), [
            'email' => 'buyer@example.com',
            'name' => 'Jamie Buyer',
        ])->assertAccepted()->assertExactJson([
            'message' => 'If the address can receive email, a secure sign-in link has been sent.',
        ]);

        $token = MagicLoginToken::sole();
        $this->assertSame('buyer@example.com', $token->email);
        $this->assertSame(64, strlen($token->token_hash));
        $this->assertFalse(str_contains($token->token_hash, 'buyer'));
        Notification::assertSentOnDemand(MagicLoginLink::class);
    }

    public function test_a_valid_link_verifies_and_authenticates_the_user_once(): void
    {
        Notification::fake();
        $this->postJson(route('auth.magic.store'), ['email' => 'buyer@example.com'])->assertAccepted();
        $url = $this->sentMagicLinkUrl();

        $this->get($url)->assertRedirect('/booking/');

        $user = User::where('email', 'buyer@example.com')->sole();
        $this->assertAuthenticatedAs($user);
        $this->assertNotNull($user->email_verified_at);
        $this->assertNotNull(MagicLoginToken::sole()->consumed_at);

        $this->post(route('auth.logout'))->assertNoContent();
        $this->get($url)->assertSessionHasErrors('token');
        $this->assertGuest();
    }

    public function test_a_tampered_signed_link_is_rejected(): void
    {
        Notification::fake();
        $this->postJson(route('auth.magic.store'), ['email' => 'buyer@example.com'])->assertAccepted();
        $url = $this->sentMagicLinkUrl().'tampered';

        $this->get($url)->assertForbidden();
        $this->assertGuest();
    }

    public function test_a_verified_anonymous_draft_is_claimed_on_login(): void
    {
        Notification::fake();
        $plainDraftToken = 'draft-secret';
        $draft = BookingRequest::create([
            'source_path' => BookingSourcePath::Exact,
            'anonymous_token_hash' => hash('sha256', $plainDraftToken),
        ]);

        $this->postJson(route('auth.magic.store'), [
            'email' => 'buyer@example.com',
            'draft_id' => $draft->id,
            'draft_token' => $plainDraftToken,
        ])->assertAccepted();

        $this->get($this->sentMagicLinkUrl())->assertRedirect('/booking/');

        $draft->refresh();
        $this->assertSame(User::where('email', 'buyer@example.com')->sole()->id, $draft->requester_user_id);
        $this->assertNull($draft->anonymous_token_hash);
    }

    public function test_an_invalid_draft_recovery_token_is_rejected(): void
    {
        Notification::fake();
        $draft = BookingRequest::create([
            'source_path' => BookingSourcePath::Exact,
            'anonymous_token_hash' => hash('sha256', 'correct-secret'),
        ]);

        $this->postJson(route('auth.magic.store'), [
            'email' => 'buyer@example.com',
            'draft_id' => $draft->id,
            'draft_token' => 'wrong-secret',
        ])->assertUnprocessable()->assertJsonValidationErrors('draft');

        Notification::assertNothingSent();
    }

    private function sentMagicLinkUrl(): string
    {
        $url = null;
        Notification::assertSentOnDemand(
            MagicLoginLink::class,
            function (MagicLoginLink $notification) use (&$url): bool {
                $url = $notification->toMail((object) [])->actionUrl;

                return true;
            },
        );

        return $url;
    }
}