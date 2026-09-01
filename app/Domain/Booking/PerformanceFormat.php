<?php

namespace App\Domain\Booking;

enum PerformanceFormat: string
{
    case Solo = 'solo';
    case Duo = 'duo';
    case FullPaLine = 'full_pa_line';
}
