<?php

namespace App\Models;

use App\Domain\Booking\HoldStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingHold extends Model
{
    use HasUlids;

    protected $attributes = ['status' => 'active'];

    protected $fillable = [
        'booking_request_id', 'venue_id', 'date', 'start_time', 'end_time',
        'status', 'expires_at', 'released_at',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'status' => HoldStatus::class,
            'expires_at' => 'datetime',
            'released_at' => 'datetime',
        ];
    }

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}