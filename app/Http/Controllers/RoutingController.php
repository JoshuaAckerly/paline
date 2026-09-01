<?php

namespace App\Http\Controllers;

use App\Contracts\RoutingProvider;
use App\Domain\Booking\Coordinates;
use App\Exceptions\RoutingUnavailableException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RoutingController extends Controller
{
    public function calculate(Request $request, RoutingProvider $routing): JsonResponse
    {
        $validated = $request->validate([
            'origin.latitude' => ['required', 'numeric', 'between:-90,90'],
            'origin.longitude' => ['required', 'numeric', 'between:-180,180'],
            'destination.latitude' => ['required', 'numeric', 'between:-90,90'],
            'destination.longitude' => ['required', 'numeric', 'between:-180,180'],
        ]);

        try {
            $estimate = $routing->calculate(
                new Coordinates($validated['origin']['latitude'], $validated['origin']['longitude']),
                new Coordinates($validated['destination']['latitude'], $validated['destination']['longitude']),
            );
        } catch (RoutingUnavailableException) {
            return response()->json([
                'status' => 'routing_verification_pending',
                'message' => 'Routing could not be verified. The booking draft can still be saved.',
            ], 503);
        }

        return response()->json([
            'status' => 'verified',
            'miles' => $estimate->miles,
            'drive_minutes' => $estimate->driveMinutes,
            'provider' => $estimate->provider,
        ]);
    }
}