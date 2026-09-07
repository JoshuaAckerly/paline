<?php

namespace App\Contracts;

use App\Domain\Booking\Coordinates;

interface GeocodingProvider
{
    public function geocode(string $city, string $state, ?string $postalCode = null): Coordinates;
}
