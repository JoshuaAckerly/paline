<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RouteSavingsElection extends Model
{
    use HasUlids;

    protected $fillable = [
        'route_savings_event_id', 'preset', 'return_percent', 'credit_percent', 'reinvest_percent',
        'return_amount', 'credit_amount', 'reinvest_amount', 'elected_at',
    ];

    protected function casts(): array
    {
        return ['elected_at' => 'datetime'];
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(RouteSavingsEvent::class, 'route_savings_event_id');
    }
}
