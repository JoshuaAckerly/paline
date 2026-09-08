<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class PrototypeInquiry extends Model
{
    use HasUlids;

    protected $fillable = [
        'type', 'source_key', 'contact_name', 'contact_email', 'contact_phone', 'payload', 'is_read',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'is_read' => 'boolean',
        ];
    }
}
