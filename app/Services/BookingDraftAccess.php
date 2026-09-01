<?php

namespace App\Services;

use App\Models\BookingRequest;
use Illuminate\Validation\ValidationException;

class BookingDraftAccess
{
    public function authorize(BookingRequest $bookingRequest, ?string $plainToken): BookingRequest
    {
        if ($bookingRequest->requester_user_id !== null
            || $plainToken === null
            || $bookingRequest->anonymous_token_hash === null
            || ! hash_equals($bookingRequest->anonymous_token_hash, hash('sha256', $plainToken))) {
            throw ValidationException::withMessages(['draft' => 'Draft credentials are invalid.']);
        }

        return $bookingRequest;
    }
}