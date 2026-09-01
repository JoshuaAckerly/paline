<?php

namespace Tests\Feature\Booking;

use App\Contracts\RoutingProvider;
use App\Services\MapboxRoutingProvider;
use App\Services\UnavailableRoutingProvider;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class RoutingApiTest extends TestCase
{
    private array $payload = [
        'origin' => ['latitude' => 42.9039, 'longitude' => -78.6923],
        'destination' => ['latitude' => 42.8864, 'longitude' => -78.8784],
    ];

    public function test_it_returns_real_provider_distance_and_duration(): void
    {
        Http::fake([
            'api.mapbox.com/*' => Http::response([
                'routes' => [['distance' => 16093.44, 'duration' => 1800]],
            ]),
        ]);
        $this->app->instance(
            RoutingProvider::class,
            new MapboxRoutingProvider('test-token', 'https://api.mapbox.com'),
        );

        $this->postJson(route('routing.calculate'), $this->payload)
            ->assertOk()
            ->assertExactJson([
                'status' => 'verified',
                'miles' => 10.0,
                'drive_minutes' => 30,
                'provider' => 'mapbox',
            ]);

        Http::assertSent(fn ($request): bool => str_contains($request->url(), '/directions/v5/mapbox/driving/'));
    }

    public function test_provider_failure_never_returns_fabricated_route_values(): void
    {
        Http::fake(['api.mapbox.com/*' => Http::response([], 503)]);
        $this->app->instance(
            RoutingProvider::class,
            new MapboxRoutingProvider('test-token', 'https://api.mapbox.com'),
        );

        $this->postJson(route('routing.calculate'), $this->payload)
            ->assertServiceUnavailable()
            ->assertExactJson([
                'status' => 'routing_verification_pending',
                'message' => 'Routing could not be verified. The booking draft can still be saved.',
            ])
            ->assertJsonMissingPath('miles')
            ->assertJsonMissingPath('drive_minutes');
    }

    public function test_missing_provider_configuration_uses_the_safe_fallback(): void
    {
        $this->app->instance(RoutingProvider::class, new UnavailableRoutingProvider);

        $this->postJson(route('routing.calculate'), $this->payload)
            ->assertServiceUnavailable()
            ->assertJsonPath('status', 'routing_verification_pending');
    }

    public function test_invalid_coordinates_are_rejected_before_calling_the_provider(): void
    {
        Http::fake();
        $payload = $this->payload;
        $payload['origin']['latitude'] = 91;

        $this->postJson(route('routing.calculate'), $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors('origin.latitude');

        Http::assertNothingSent();
    }
}