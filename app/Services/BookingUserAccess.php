<?php

namespace App\Services;

use App\Models\BookingRequest;
use Illuminate\Validation\ValidationException;
use Illuminate\Contracts\Auth\Authenticatable;

class BookingUserAccess
{
    public function authorize(BookingRequest $bookingRequest, ?Authenticatable $user): BookingRequest
    {
        if ($user === null || $bookingRequest->requester_user_id !== $user->getAuthIdentifier()) {
            throw ValidationException::withMessages(['booking' => 'You do not have access to this booking.']);
        }

        return $bookingRequest;
    }
}
