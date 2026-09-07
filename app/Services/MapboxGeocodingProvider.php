<?php

namespace App\Services;

use App\Contracts\GeocodingProvider;
use App\Domain\Booking\Coordinates;
use App\Exceptions\GeocodingUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MapboxGeocodingProvider implements GeocodingProvider
{
    public function __construct(
        private readonly string $accessToken,
        private readonly string $baseUrl,
    ) {}

    public function geocode(string $city, string $state, ?string $postalCode = null): Coordinates
    {
        $query = trim($postalCode ? "{$city}, {$state} {$postalCode}" : "{$city}, {$state}");

        try {
            $response = Http::acceptJson()
                ->timeout(8)
                ->retry(2, 150)
                ->get(rtrim($this->baseUrl, '/').'/geocoding/v5/mapbox.places/'.rawurlencode($query).'.json', [
                    'access_token' => $this->accessToken,
                    'country' => 'US',
                    'limit' => 1,
                    'types' => 'place,postcode',
                ]);
        } catch (ConnectionException|RequestException $exception) {
            throw new GeocodingUnavailableException('The geocoding provider is unavailable.', previous: $exception);
        }

        $feature = $response->successful() ? $response->json('features.0') : null;
        $coordinates = $feature['center'] ?? null;

        if (! is_array($coordinates) || count($coordinates) !== 2 || ! is_numeric($coordinates[0]) || ! is_numeric($coordinates[1])) {
            throw new GeocodingUnavailableException('The geocoding provider returned no usable location.');
        }

        // Mapbox returns [longitude, latitude].
        return new Coordinates((float) $coordinates[1], (float) $coordinates[0]);
    }
}
