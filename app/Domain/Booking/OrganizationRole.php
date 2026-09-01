<?php

namespace App\Domain\Booking;

enum OrganizationRole: string
{
    case Owner = 'owner';
    case Administrator = 'administrator';
    case BookingContact = 'booking_contact';
    case ProductionContact = 'production_contact';
    case AccountingContact = 'accounting_contact';
    case Viewer = 'viewer';
}