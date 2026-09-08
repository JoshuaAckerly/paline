<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class RouteSavingsEvent extends Model
{
    use HasUlids;

    protected $fillable = [
        'booking_request_id', 'triggering_booking_request_id',
        'protected_travel_ceiling', 'recalculated_travel_charge', 'savings',
        'source', 'status',
    ];

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }

    public function triggeringBookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class, 'triggering_booking_request_id');
    }

    public function election(): HasOne
    {
        return $this->hasOne(RouteSavingsElection::class);
    }
}
