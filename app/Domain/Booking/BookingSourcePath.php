<?php

namespace App\Domain\Booking;

enum BookingSourcePath: string
{
    case Exact = 'exact';
    case Flexible = 'flexible';
    case Returning = 'returning';
}