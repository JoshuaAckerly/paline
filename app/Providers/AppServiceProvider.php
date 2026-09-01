<?php

namespace App\Providers;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\AvailabilityService;
use App\Domain\Booking\BudgetFitEvaluator;
use App\Domain\Booking\LegalAcknowledgmentService;
use App\Domain\Booking\PricingCalculator;
use App\Domain\Booking\RecurringDateGenerator;
use App\Domain\Booking\RouteSavingsCalculator;
use App\Services\BookingCalendar;
use App\Services\MapboxRoutingProvider;
use App\Services\UnavailableRoutingProvider;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->singleton(RoutingProvider::class, function (): RoutingProvider {
            $accessToken = config('services.mapbox.access_token');

            return is_string($accessToken) && $accessToken !== ''
                ? new MapboxRoutingProvider($accessToken, config('services.mapbox.base_url'))
                : new UnavailableRoutingProvider;
        });

        $this->app->singleton(
            AvailabilityService::class,
            fn () => new AvailabilityService(config('booking.scheduling'))
        );

        $this->app->singleton(
            RecurringDateGenerator::class,
            fn () => new RecurringDateGenerator(config('booking.scheduling.max_additional_bookings'))
        );

        $this->app->singleton(BudgetFitEvaluator::class);
        $this->app->singleton(LegalAcknowledgmentService::class);
        $this->app->singleton(RouteSavingsCalculator::class);
        $this->app->singleton(BookingCalendar::class);

        $this->app->singleton(
            PricingCalculator::class,
            fn () => new PricingCalculator(config('booking.pricing'))
        );
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
