<?php

namespace App\Models;

use App\Domain\Booking\EngagementStatus;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Engagement extends Model
{
    use HasUlids;

    protected $attributes = ['status' => 'confirmed'];

    protected $fillable = [
        'booking_request_id', 'booking_date_id', 'venue_id', 'title', 'performance_date',
        'start_time', 'end_time', 'status', 'private_notes',
    ];

    protected function casts(): array
    {
        return ['performance_date' => 'date', 'status' => EngagementStatus::class];
    }

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }

    public function bookingDate(): BelongsTo
    {
        return $this->belongsTo(BookingDate::class);
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }
}