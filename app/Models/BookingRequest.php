<?php

namespace App\Models;

use App\Domain\Booking\BookingSourcePath;
use App\Domain\Booking\BookingStatus;
use App\Domain\Booking\PerformanceFormat;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class BookingRequest extends Model
{
    use HasUlids;

    protected $attributes = [
        'status' => 'draft',
        'true_potential_requested' => false,
    ];

    protected $fillable = [
        'requester_user_id', 'venue_id', 'contact_id', 'anonymous_token_hash', 'source_path', 'status',
        'event_name', 'primary_date', 'preferred_city', 'preferred_state', 'window_starts_on',
        'window_ends_on', 'event_start', 'event_end', 'event_type', 'setting',
        'estimated_attendance', 'performance_format', 'performance_length_minutes',
        'sound_provided', 'house_engineer_provided', 'true_potential_requested',
    ];

    protected function casts(): array
    {
        return [
            'source_path' => BookingSourcePath::class,
            'status' => BookingStatus::class,
            'primary_date' => 'date',
            'window_starts_on' => 'date',
            'window_ends_on' => 'date',
            'sound_provided' => 'boolean',
            'house_engineer_provided' => 'boolean',
            'true_potential_requested' => 'boolean',
            'performance_format' => PerformanceFormat::class,
        ];
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_user_id');
    }

    public function venue(): BelongsTo
    {
        return $this->belongsTo(Venue::class);
    }

    public function contact(): BelongsTo
    {
        return $this->belongsTo(Contact::class);
    }

    public function dates(): HasMany
    {
        return $this->hasMany(BookingDate::class);
    }

    public function engagements(): HasMany
    {
        return $this->hasMany(Engagement::class);
    }

    public function holds(): HasMany
    {
        return $this->hasMany(BookingHold::class);
    }
}