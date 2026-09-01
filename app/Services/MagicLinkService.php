<?php

namespace App\Services;

use App\Models\BookingRequest;
use App\Models\MagicLoginToken;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class MagicLinkService
{
    public function issue(
        string $email,
        ?string $displayName = null,
        ?string $draftId = null,
        ?string $draftToken = null,
    ): array {
        $draft = $this->verifiedAnonymousDraft($draftId, $draftToken);
        $plainToken = Str::random(64);
        $expiresAt = now()->addMinutes(config('booking.authentication.magic_link_expiration_minutes'));
        $loginToken = MagicLoginToken::create([
            'email' => Str::lower($email),
            'display_name' => $displayName,
            'token_hash' => hash('sha256', $plainToken),
            'booking_request_id' => $draft?->id,
            'expires_at' => $expiresAt,
        ]);

        return [
            $loginToken,
            URL::temporarySignedRoute(
                'auth.magic.consume',
                $expiresAt,
                ['magicLoginToken' => $loginToken->id, 'token' => $plainToken],
            ),
        ];
    }

    public function consume(MagicLoginToken $loginToken, string $plainToken): User
    {
        return DB::transaction(function () use ($loginToken, $plainToken): User {
            $lockedToken = MagicLoginToken::query()->lockForUpdate()->findOrFail($loginToken->id);

            if ($lockedToken->consumed_at !== null
                || $lockedToken->expires_at->isPast()
                || ! hash_equals($lockedToken->token_hash, hash('sha256', $plainToken))) {
                throw ValidationException::withMessages(['token' => 'This sign-in link is invalid or expired.']);
            }

            $user = User::firstOrCreate(
                ['email' => $lockedToken->email],
                [
                    'name' => $lockedToken->display_name ?: Str::before($lockedToken->email, '@'),
                    'password' => Hash::make(Str::random(64)),
                ],
            );

            if ($user->email_verified_at === null) {
                $user->forceFill(['email_verified_at' => now()])->save();
            }

            if ($lockedToken->booking_request_id !== null) {
                BookingRequest::query()
                    ->whereKey($lockedToken->booking_request_id)
                    ->whereNull('requester_user_id')
                    ->update([
                        'requester_user_id' => $user->id,
                        'anonymous_token_hash' => null,
                    ]);
            }

            $lockedToken->forceFill(['consumed_at' => now()])->save();

            return $user;
        });
    }

    private function verifiedAnonymousDraft(?string $draftId, ?string $draftToken): ?BookingRequest
    {
        if ($draftId === null && $draftToken === null) {
            return null;
        }

        if ($draftId === null || $draftToken === null) {
            throw ValidationException::withMessages(['draft' => 'Draft credentials are incomplete.']);
        }

        $draft = BookingRequest::query()
            ->whereKey($draftId)
            ->whereNull('requester_user_id')
            ->first();

        if ($draft === null
            || $draft->anonymous_token_hash === null
            || ! hash_equals($draft->anonymous_token_hash, hash('sha256', $draftToken))) {
            throw ValidationException::withMessages(['draft' => 'Draft credentials are invalid.']);
        }

        return $draft;
    }
}