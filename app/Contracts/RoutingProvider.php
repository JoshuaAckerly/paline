<?php

namespace App\Contracts;

use App\Domain\Booking\Coordinates;
use App\Domain\Booking\RouteEstimate;

interface RoutingProvider
{
    public function calculate(Coordinates $origin, Coordinates $destination): RouteEstimate;
}