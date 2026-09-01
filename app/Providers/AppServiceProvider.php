<?php

namespace App\Providers;

use App\Domain\Booking\PricingCalculator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
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
