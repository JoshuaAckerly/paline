<?php

namespace App\Services;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\RouteEstimate;
use App\Exceptions\RoutingUnavailableException;
use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Facades\Http;

class MapboxRoutingProvider implements RoutingProvider
{
    public function __construct(
        private readonly string $accessToken,
        private readonly string $baseUrl,
    ) {}

    public function calculate(Coordinates $origin, Coordinates $destination): RouteEstimate
    {
        $coordinates = implode(';', [
            "{$origin->longitude},{$origin->latitude}",
            "{$destination->longitude},{$destination->latitude}",
        ]);

        try {
            $response = Http::acceptJson()
                ->timeout(8)
                ->retry(2, 150)
                ->get(rtrim($this->baseUrl, '/')."/directions/v5/mapbox/driving/{$coordinates}", [
                    'access_token' => $this->accessToken,
                    'overview' => 'false',
                ]);
        } catch (ConnectionException|RequestException $exception) {
            throw new RoutingUnavailableException('The routing provider is unavailable.', previous: $exception);
        }

        $route = $response->successful() ? $response->json('routes.0') : null;

        if (! is_array($route) || ! is_numeric($route['distance'] ?? null) || ! is_numeric($route['duration'] ?? null)) {
            throw new RoutingUnavailableException('The routing provider returned no usable route.');
        }

        return new RouteEstimate(
            round(((float) $route['distance']) / 1609.344, 1),
            (int) round(((float) $route['duration']) / 60),
            'mapbox',
        );
    }
}