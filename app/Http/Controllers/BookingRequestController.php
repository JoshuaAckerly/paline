<?php

namespace App\Http\Controllers;

use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\BookingSourcePath;
use App\Models\BookingRequest;
use App\Services\BookingCalendar;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class BookingRequestController extends Controller
{
    public function store(Request $request, BookingCalendar $calendar): JsonResponse
    {
        $validated = $request->validate([
            'source_path' => ['required', Rule::enum(BookingSourcePath::class)],
            'primary_date' => ['required_if:source_path,exact', 'nullable', 'date_format:Y-m-d'],
            'city' => ['required_if:source_path,flexible', 'nullable', 'string', 'max:255'],
            'state' => ['required_if:source_path,flexible', 'nullable', 'string', 'max:64'],
            'window_starts_on' => ['required_if:source_path,flexible', 'nullable', 'date_format:Y-m-d'],
            'window_ends_on' => ['required_if:source_path,flexible', 'nullable', 'date_format:Y-m-d'],
        ]);

        $sourcePath = BookingSourcePath::from($validated['source_path']);

        if ($sourcePath === BookingSourcePath::Flexible) {
            $from = CarbonImmutable::createFromFormat('!Y-m-d', $validated['window_starts_on']);
            $to = CarbonImmutable::createFromFormat('!Y-m-d', $validated['window_ends_on']);

            if ($to->lt($from)) {
                throw ValidationException::withMessages(['window_ends_on' => 'The window end must be after or equal to the start.']);
            }

            if ($from->diffInDays($to) > 93) {
                throw ValidationException::withMessages(['window_ends_on' => 'Flexible booking windows cannot exceed 93 days.']);
            }
        }

        $draftToken = Str::random(64);

        $booking = DB::transaction(function () use ($calendar, $draftToken, $sourcePath, $validated) {
            $booking = BookingRequest::create([
                'anonymous_token_hash' => hash('sha256', $draftToken),
                'source_path' => $sourcePath,
                'primary_date' => $validated['primary_date'] ?? null,
                'preferred_city' => $validated['city'] ?? null,
                'preferred_state' => $validated['state'] ?? null,
                'window_starts_on' => $validated['window_starts_on'] ?? null,
                'window_ends_on' => $validated['window_ends_on'] ?? null,
            ]);

            if ($sourcePath === BookingSourcePath::Exact) {
                $date = CarbonImmutable::createFromFormat('!Y-m-d', $validated['primary_date']);
                $availability = $calendar->stateFor($date);

                if (! in_array($availability, [AvailabilityState::Available, AvailabilityState::Limited], true)) {
                    throw ValidationException::withMessages([
                        'primary_date' => 'This date is no longer available to request. Please check another date.',
                    ]);
                }

                $booking->dates()->create([
                    'date' => $date,
                    'availability_status' => $availability,
                ]);

                return $booking;
            }

            $from = CarbonImmutable::createFromFormat('!Y-m-d', $validated['window_starts_on']);
            $to = CarbonImmutable::createFromFormat('!Y-m-d', $validated['window_ends_on']);
            $candidates = array_values(array_filter(
                $calendar->range($from, $to),
                fn (array $date) => in_array($date['state'], [AvailabilityState::Available->value, AvailabilityState::Limited->value], true),
            ));

            usort($candidates, fn (array $left, array $right) => [
                $left['state'] === AvailabilityState::Available->value ? 0 : 1,
                $left['date'],
            ] <=> [
                $right['state'] === AvailabilityState::Available->value ? 0 : 1,
                $right['date'],
            ]);

            foreach (array_slice($candidates, 0, 5) as $candidate) {
                $booking->dates()->create([
                    'date' => $candidate['date'],
                    'availability_status' => $candidate['state'],
                ]);
            }

            return $booking;
        });

        return response()->json([
            'id' => $booking->id,
            'draft_token' => $draftToken,
            'source_path' => $sourcePath->value,
            'routing_status' => $sourcePath === BookingSourcePath::Flexible ? 'verification_pending' : null,
            'dates' => $booking->dates()->get()->map(fn ($date) => [
                'id' => $date->id,
                'date' => $date->date->toDateString(),
                'state' => $date->availability_status->value,
            ])->all(),
        ], 201);
    }
}