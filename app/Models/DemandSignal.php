<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class DemandSignal extends Model
{
    use HasUlids;

    protected $fillable = [
        'city', 'state', 'postal_code', 'preferred_venue', 'alternate_venue',
        'estimated_attendees', 'local_role', 'notes', 'name', 'email', 'phone',
        'update_preference', 'consent_to_updates', 'momentum_actions',
    ];

    protected function casts(): array
    {
        return [
            'name' => 'encrypted',
            'email' => 'encrypted',
            'phone' => 'encrypted',
            'consent_to_updates' => 'boolean',
            'momentum_actions' => 'array',
        ];
    }
}