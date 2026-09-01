<?php

namespace App\Services;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\Coordinates;
use App\Domain\Booking\RouteEstimate;
use App\Exceptions\RoutingUnavailableException;

class UnavailableRoutingProvider implements RoutingProvider
{
    public function calculate(Coordinates $origin, Coordinates $destination): RouteEstimate
    {
        throw new RoutingUnavailableException('Routing verification is pending provider configuration.');
    }
}