<?php

namespace App\Domain\Booking;

enum OrganizationType: string
{
    case VenueOperator = 'venue_operator';
    case Promoter = 'promoter';
    case Festival = 'festival';
    case PrivateBuyer = 'private_buyer';
    case Other = 'other';
}