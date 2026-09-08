<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingLegalAcknowledgment extends Model
{
    use HasUlids;

    protected $fillable = [
        'booking_request_id', 'document_key', 'document_version_id', 'document_hash', 'user_id',
        'opened_at', 'reached_end_at', 'acknowledged_at', 'signature_timestamp',
        'signature_name', 'signature_role', 'ip_address', 'user_agent',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'reached_end_at' => 'datetime',
            'acknowledged_at' => 'datetime',
            'signature_timestamp' => 'datetime',
        ];
    }

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
