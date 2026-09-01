<?php

namespace App\Models;

use App\Domain\Booking\AvailabilityState;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDate extends Model
{
    use HasUlids;

    protected $fillable = ['booking_request_id', 'date', 'start_time', 'end_time', 'availability_status'];

    protected function casts(): array
    {
        return ['date' => 'date', 'availability_status' => AvailabilityState::class];
    }

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }
}