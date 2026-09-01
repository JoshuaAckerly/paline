<?php

namespace App\Http\Controllers;

use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\BookingSourcePath;
use App\Domain\Booking\PerformanceFormat;
use App\Domain\Booking\RecurringDateGenerator;
use App\Domain\Booking\RecurringFrequency;
use App\Models\BookingDate;
use App\Models\BookingRequest;
use App\Models\Contact;
use App\Models\Venue;
use App\Services\BookingDraftAccess;
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

    public function update(
        Request $request,
        BookingRequest $bookingRequest,
        BookingDraftAccess $draftAccess,
        BookingCalendar $calendar,
    ): JsonResponse {
        $credentials = $request->validate([
            'draft_token' => ['required', 'string', 'max:255'],
        ]);
        $draftAccess->authorize($bookingRequest, $credentials['draft_token']);

        $validated = $request->validate([
            'venue.name' => ['required', 'string', 'max:255'],
            'venue.street_address' => ['required', 'string', 'max:255'],
            'venue.city' => ['required', 'string', 'max:255'],
            'venue.state' => ['required', 'string', 'max:64'],
            'venue.postal_code' => ['required', 'string', 'max:20'],
            'event.name' => ['required', 'string', 'max:255'],
            'event.type' => ['required', Rule::in(['public_performance', 'festival', 'private_event', 'corporate_event', 'wedding', 'fundraiser', 'other'])],
            'event.setting' => ['required', Rule::in(['indoor', 'outdoor', 'indoor_outdoor', 'unsure'])],
            'event.start' => ['required', 'date_format:H:i'],
            'event.end' => ['required', 'date_format:H:i'],
            'event.estimated_attendance' => ['required', 'integer', 'min:1', 'max:1000000'],
            'contact.name' => ['required', 'string', 'max:255'],
            'contact.email' => ['required', 'email:rfc', 'max:255'],
            'contact.phone' => ['nullable', 'string', 'max:40'],
            'selected_date' => ['nullable', 'date_format:Y-m-d'],
        ]);

        if ($bookingRequest->source_path === BookingSourcePath::Flexible) {
            $selectedDate = $validated['selected_date'] ?? null;

            if ($selectedDate === null
                || ! $bookingRequest->dates()->whereDate('date', $selectedDate)->exists()) {
                throw ValidationException::withMessages(['selected_date' => 'Choose a date from this draft’s current options.']);
            }
        }

        $selectedDate = CarbonImmutable::createFromFormat(
            '!Y-m-d',
            $validated['selected_date'] ?? $bookingRequest->primary_date?->toDateString(),
        );
        $availability = $calendar->stateFor($selectedDate);

        if (! in_array($availability, [AvailabilityState::Available, AvailabilityState::Limited], true)) {
            throw ValidationException::withMessages([
                'selected_date' => 'This date is no longer available to request. Please choose another date.',
            ]);
        }

        if ($validated['event']['end'] <= $validated['event']['start']) {
            throw ValidationException::withMessages(['event.end' => 'The event end time must be after its start time.']);
        }

        DB::transaction(function () use ($bookingRequest, $validated): void {
            $venue = $bookingRequest->venue ?? new Venue;
            $venue->fill($validated['venue'])->save();

            $contact = $bookingRequest->contact ?? new Contact;
            $contact->fill([
                ...$validated['contact'],
                'venue_id' => $venue->id,
            ])->save();

            $bookingRequest->update([
                'venue_id' => $venue->id,
                'contact_id' => $contact->id,
                'event_name' => $validated['event']['name'],
                'event_type' => $validated['event']['type'],
                'setting' => $validated['event']['setting'],
                'event_start' => $validated['event']['start'],
                'event_end' => $validated['event']['end'],
                'estimated_attendance' => $validated['event']['estimated_attendance'],
                'primary_date' => $validated['selected_date'] ?? $bookingRequest->primary_date,
                'preferred_city' => $validated['venue']['city'],
                'preferred_state' => $validated['venue']['state'],
            ]);

            $bookingRequest->dates()->whereDate('date', $bookingRequest->primary_date)->update([
                'start_time' => $validated['event']['start'],
                'end_time' => $validated['event']['end'],
            ]);

            if ($bookingRequest->source_path === BookingSourcePath::Flexible) {
                $bookingRequest->dates()->whereDate('date', '!=', $validated['selected_date'])->delete();
            }
        });

        return response()->json([
            'id' => $bookingRequest->id,
            'status' => 'details_saved',
            'venue' => $bookingRequest->venue()->firstOrFail()->only(['id', 'name', 'city', 'state']),
            'contact_id' => $bookingRequest->contact_id,
        ]);
    }

    public function updateProduction(
        Request $request,
        BookingRequest $bookingRequest,
        BookingDraftAccess $draftAccess,
    ): JsonResponse {
        $credentials = $request->validate([
            'draft_token' => ['required', 'string', 'max:255'],
        ]);
        $draftAccess->authorize($bookingRequest, $credentials['draft_token']);

        if ($bookingRequest->venue_id === null || $bookingRequest->contact_id === null || $bookingRequest->primary_date === null) {
            throw ValidationException::withMessages([
                'draft' => 'Complete the venue, event, and contact details before production options.',
            ]);
        }

        $validated = $request->validate([
            'performance_format' => ['required', Rule::enum(PerformanceFormat::class)],
            'performance_length_minutes' => ['required', 'integer', Rule::in([60, 90, 120, 180])],
            'sound_provided' => ['required', 'boolean'],
            'house_engineer_provided' => ['nullable', 'boolean'],
            'true_potential_requested' => ['required', 'boolean'],
        ]);

        if ($validated['sound_provided'] && ($validated['house_engineer_provided'] ?? null) === null) {
            throw ValidationException::withMessages([
                'house_engineer_provided' => 'Confirm whether a qualified house engineer is included.',
            ]);
        }

        if ($validated['true_potential_requested']
            && $bookingRequest->primary_date->lt(CarbonImmutable::today()->addMonthsNoOverflow(6))) {
            throw ValidationException::withMessages([
                'true_potential_requested' => 'TRUE POTENTIAL requires a booking date at least six months away.',
            ]);
        }

        $bookingRequest->update([
            ...$validated,
            'house_engineer_provided' => $validated['sound_provided']
                ? ($validated['house_engineer_provided'] ?? null)
                : null,
        ]);

        return response()->json([
            'id' => $bookingRequest->id,
            'status' => 'production_saved',
            'performance_format' => $bookingRequest->performance_format->value,
            'performance_length_minutes' => $bookingRequest->performance_length_minutes,
            'sound_provided' => $bookingRequest->sound_provided,
            'house_engineer_provided' => $bookingRequest->house_engineer_provided,
            'true_potential_requested' => $bookingRequest->true_potential_requested,
        ]);
    }

    public function storeDates(
        Request $request,
        BookingRequest $bookingRequest,
        BookingDraftAccess $draftAccess,
        BookingCalendar $calendar,
        RecurringDateGenerator $recurringDates,
    ): JsonResponse {
        $credentials = $request->validate(['draft_token' => ['required', 'string', 'max:255']]);
        $draftAccess->authorize($bookingRequest, $credentials['draft_token']);

        if ($bookingRequest->performance_format === null || $bookingRequest->primary_date === null) {
            throw ValidationException::withMessages(['draft' => 'Complete production options before adding dates.']);
        }

        $validated = $request->validate([
            'booking_type' => ['required', Rule::in(['repeat', 'series', 'continuous'])],
            'mode' => ['required', Rule::in(['specific', 'recurring'])],
            'dates' => ['required_if:mode,specific', 'array', 'min:1', 'max:24'],
            'dates.*' => ['date_format:Y-m-d', 'distinct'],
            'frequency' => ['required_if:mode,recurring', 'nullable', Rule::enum(RecurringFrequency::class)],
            'count' => ['required_if:mode,recurring', 'nullable', 'integer', 'min:1', 'max:24'],
        ]);

        $rejected = DB::transaction(function () use ($bookingRequest, $calendar, $credentials, $draftAccess, $recurringDates, $validated): array {
            $lockedBooking = BookingRequest::query()->lockForUpdate()->findOrFail($bookingRequest->id);
            $draftAccess->authorize($lockedBooking, $credentials['draft_token']);
            $existingDates = $lockedBooking->dates()
                ->whereDate('date', '!=', $lockedBooking->primary_date)
                ->get();
            $remaining = 24 - $existingDates->count();

            if ($remaining < 1) {
                throw ValidationException::withMessages(['dates' => 'This booking already has the maximum of 24 additional dates.']);
            }

            $accepted = [];
            $rejected = [];

            if ($validated['mode'] === 'recurring') {
                if ($validated['count'] > $remaining) {
                    throw ValidationException::withMessages(['count' => "Only {$remaining} additional dates remain available for this booking."]);
                }

                $result = $recurringDates->generate(
                    $lockedBooking->primary_date->toDateTimeImmutable(),
                    RecurringFrequency::from($validated['frequency']),
                    $validated['count'],
                    fn (\DateTimeImmutable $date) => $calendar->stateFor($date),
                    $existingDates->map(fn (BookingDate $date) => $date->date->toDateTimeImmutable())->all(),
                );
                $accepted = array_map(fn (\DateTimeImmutable $date) => $date->format('Y-m-d'), $result->acceptedDates);
                $rejected = array_map(fn ($date) => [
                    'date' => $date->date->format('Y-m-d'),
                    'reason' => $date->reason,
                ], $result->rejectedDates);
            } else {
                if (count($validated['dates']) > $remaining) {
                    throw ValidationException::withMessages(['dates' => "Only {$remaining} additional dates remain available for this booking."]);
                }

                $existingKeys = $existingDates->pluck('date')->map->toDateString()->flip();
                foreach ($validated['dates'] as $dateString) {
                    $date = CarbonImmutable::createFromFormat('!Y-m-d', $dateString);
                    $reason = null;

                    if ($date->lt(CarbonImmutable::today())) {
                        $reason = 'past';
                    } elseif ($date->isSameDay($lockedBooking->primary_date)) {
                        $reason = 'primary';
                    } elseif ($existingKeys->has($dateString)) {
                        $reason = 'duplicate';
                    } else {
                        $state = $calendar->stateFor($date);
                        if (! in_array($state, [AvailabilityState::Available, AvailabilityState::Limited], true)) {
                            $reason = $state->value;
                        }
                    }

                    if ($reason !== null) {
                        $rejected[] = ['date' => $dateString, 'reason' => $reason];
                    } else {
                        $accepted[] = $dateString;
                        $existingKeys->put($dateString, true);
                    }
                }
            }

            $lockedBooking->update([
                'booking_type' => $validated['booking_type'],
                'recurrence_frequency' => $validated['mode'] === 'recurring' ? $validated['frequency'] : null,
            ]);

            foreach ($accepted as $dateString) {
                $date = CarbonImmutable::createFromFormat('!Y-m-d', $dateString);
                $state = $calendar->stateFor($date);

                if (! in_array($state, [AvailabilityState::Available, AvailabilityState::Limited], true)) {
                    $rejected[] = ['date' => $dateString, 'reason' => $state->value];

                    continue;
                }

                $lockedBooking->dates()->create([
                    'date' => $date,
                    'start_time' => $lockedBooking->event_start,
                    'end_time' => $lockedBooking->event_end,
                    'availability_status' => $state,
                ]);
            }

            return $rejected;
        });

        $bookingRequest->refresh();

        return response()->json([
            'status' => 'dates_reviewed',
            'accepted' => $bookingRequest->dates()->orderBy('date')->get()->map(fn (BookingDate $date) => [
                'id' => $date->id,
                'date' => $date->date->toDateString(),
                'state' => $date->availability_status->value,
                'primary' => $date->date->isSameDay($bookingRequest->primary_date),
            ])->all(),
            'rejected' => $rejected,
        ]);
    }

    public function destroyDate(
        Request $request,
        BookingRequest $bookingRequest,
        BookingDate $bookingDate,
        BookingDraftAccess $draftAccess,
    ): JsonResponse {
        $credentials = $request->validate(['draft_token' => ['required', 'string', 'max:255']]);
        $draftAccess->authorize($bookingRequest, $credentials['draft_token']);

        if ($bookingDate->booking_request_id !== $bookingRequest->id) {
            abort(404);
        }

        if ($bookingDate->date->isSameDay($bookingRequest->primary_date)) {
            throw ValidationException::withMessages(['date' => 'The primary booking date cannot be removed.']);
        }

        $bookingDate->delete();

        return response()->json(status: 204);
    }
}