<?php

namespace App\Http\Controllers;

use App\Services\BookingCalendar;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class AvailabilityController extends Controller
{
    public function index(Request $request, BookingCalendar $calendar): JsonResponse
    {
        $validated = $request->validate([
            'from' => ['required', 'date_format:Y-m-d'],
            'to' => ['required', 'date_format:Y-m-d'],
        ]);
        $from = CarbonImmutable::createFromFormat('!Y-m-d', $validated['from']);
        $to = CarbonImmutable::createFromFormat('!Y-m-d', $validated['to']);

        if ($to->lt($from)) {
            throw ValidationException::withMessages(['to' => 'The to date must be after or equal to the from date.']);
        }

        if ($from->diffInDays($to) > 93) {
            return response()->json(['message' => 'Availability ranges cannot exceed 93 days.'], 422);
        }

        return response()->json(['dates' => $calendar->range($from, $to)]);
    }

    public function check(Request $request, BookingCalendar $calendar): JsonResponse
    {
        $validated = $request->validate(['date' => ['required', 'date_format:Y-m-d']]);

        return response()->json([
            'date' => $validated['date'],
            'state' => $calendar->stateFor(
                CarbonImmutable::createFromFormat('!Y-m-d', $validated['date'])
            )->value,
        ]);
    }
}