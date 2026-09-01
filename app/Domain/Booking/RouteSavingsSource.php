<?php

namespace App\Domain\Booking;

enum RouteSavingsSource: string
{
    case RouteReoptimization = 'route_reoptimization';
    case RouteBuilderReferral = 'route_builder_referral';
}