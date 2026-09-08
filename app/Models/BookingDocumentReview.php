<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookingDocumentReview extends Model
{
    use HasUlids;

    protected $fillable = [
        'booking_request_id', 'document_key', 'document_version_id', 'document_hash',
        'opened_at', 'reached_end_at',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'reached_end_at' => 'datetime',
        ];
    }

    public function bookingRequest(): BelongsTo
    {
        return $this->belongsTo(BookingRequest::class);
    }
}
