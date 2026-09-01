<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Venue;

class VenuePolicy
{
    public function view(User $user, Venue $venue): bool
    {
        return $user->canAccessVenue($venue);
    }
}