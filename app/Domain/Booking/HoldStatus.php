<?php

namespace App\Domain\Booking;

enum HoldStatus: string
{
    case Active = 'active';
    case Released = 'released';
    case Expired = 'expired';
    case Converted = 'converted';
}