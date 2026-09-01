<?php

namespace App\Domain\Booking;

enum EngagementStatus: string
{
    case Confirmed = 'confirmed';
    case Cancelled = 'cancelled';
    case Completed = 'completed';
}