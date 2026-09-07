<?php

namespace App\Services;

use App\Contracts\GeocodingProvider;
use App\Domain\Booking\Coordinates;
use App\Exceptions\GeocodingUnavailableException;

class UnavailableGeocodingProvider implements GeocodingProvider
{
    public function geocode(string $city, string $state, ?string $postalCode = null): Coordinates
    {
        throw new GeocodingUnavailableException('Geocoding verification is pending provider configuration.');
    }
}
