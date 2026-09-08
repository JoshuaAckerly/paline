<?php

namespace Tests\Unit\Services;

use App\Contracts\GeocodingProvider;
use App\Contracts\RoutingProvider;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\PerformanceFormat;
use App\Domain\Booking\PricingCalculator;
use App\Domain\Booking\RouteEstimate;
use App\Models\BookingRequest;
use App\Models\Venue;
use App\Services\PreliminaryQuoteEstimator;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PreliminaryQuoteEstimatorItemizeTest extends TestCase
{
    use RefreshDatabase;

    private function estimator(): PreliminaryQuoteEstimator
    {
        $pricing = new PricingCalculator(config('booking.pricing'));

        $geocoding = new class implements GeocodingProvider
        {
            public function geocode(string $city, string $state, ?string $postalCode = null): Coordinates
            {
                return new Coordinates(42.8864, -78.8784);
            }
        };

        $routing = new class implements RoutingProvider
        {
            public function calculate(Coordinates $origin, Coordinates $destination): RouteEstimate
            {
                return new RouteEstimate(50.0, 60, 'fake');
            }
        };

        return new PreliminaryQuoteEstimator($pricing, $geocoding, $routing, new Coordinates(42.9034, -78.6986));
    }

    public function test_it_returns_a_priced_itemized_breakdown(): void
    {
        $venue = Venue::create(['name' => 'Town Ballroom', 'city' => 'Buffalo', 'state' => 'NY']);
        $booking = BookingRequest::create([
            'source_path' => 'exact',
            'venue_id' => $venue->id,
            'primary_date' => '2026-06-15',
            'performance_format' => PerformanceFormat::Duo,
            'sound_provided' => false,
        ]);

        $result = $this->estimator()->itemize($booking);

        $this->assertTrue($result['priced']);
        $this->assertSame('duo', $result['format']);
        $this->assertSame(100.0, $result['mileage']);
        $this->assertGreaterThan(0, $result['total']);
    }

    public function test_true_potential_bookings_are_never_priced(): void
    {
        $booking = BookingRequest::create([
            'source_path' => 'exact',
            'primary_date' => '2026-06-15',
            'performance_format' => PerformanceFormat::Solo,
            'true_potential_requested' => true,
        ]);

        $result = $this->estimator()->itemize($booking);

        $this->assertFalse($result['priced']);
        $this->assertSame('true_potential', $result['reason']);
    }

    public function test_manual_review_budget_bookings_are_never_priced(): void
    {
        $booking = BookingRequest::create([
            'source_path' => 'exact',
            'primary_date' => '2026-06-15',
            'performance_format' => PerformanceFormat::Solo,
            'budget_status' => 'manual_review',
        ]);

        $result = $this->estimator()->itemize($booking);

        $this->assertFalse($result['priced']);
        $this->assertSame('manual_review', $result['reason']);
    }
}
