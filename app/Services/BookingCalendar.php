<?php

namespace App\Services;

use App\Domain\Booking\AvailabilityService;
use App\Domain\Booking\AvailabilityState;
use App\Domain\Booking\EngagementStatus;
use App\Domain\Booking\HoldStatus;
use App\Models\BookingHold;
use App\Models\CalendarBlock;
use App\Models\Engagement;
use Carbon\CarbonImmutable;
use DateTimeInterface;

class BookingCalendar
{
    public function __construct(private readonly AvailabilityService $availability) {}

    public function stateFor(DateTimeInterface $date, ?DateTimeInterface $today = null): AvailabilityState
    {
        $day = CarbonImmutable::instance($date)->startOfDay();
        $blocked = CalendarBlock::query()
            ->whereDate('starts_on', '<=', $day)
            ->whereDate('ends_on', '>=', $day)
            ->exists();
        $held = BookingHold::query()
            ->whereDate('date', $day)
            ->where('status', HoldStatus::Active)
            ->where(fn ($query) => $query->whereNull('expires_at')->orWhere('expires_at', '>', now()))
            ->exists();
        $confirmed = Engagement::query()
            ->whereDate('performance_date', $day)
            ->where('status', EngagementStatus::Confirmed)
            ->exists();

        return $this->availability->stateFor($day, $confirmed, $held, $blocked, $today);
    }

    /** @return list<array{date: string, state: string}> */
    public function range(CarbonImmutable $from, CarbonImmutable $to): array
    {
        $states = [];

        for ($date = $from->startOfDay(); $date->lte($to); $date = $date->addDay()) {
            $states[] = ['date' => $date->toDateString(), 'state' => $this->stateFor($date)->value];
        }

        return $states;
    }
}