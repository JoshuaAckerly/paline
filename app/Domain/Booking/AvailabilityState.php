<?php

namespace App\Domain\Booking;

enum AvailabilityState: string
{
    case Available = 'available';
    case Limited = 'limited';
    case Held = 'held';
    case Blocked = 'blocked';
}