<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class LegalDocument extends Model
{
    use HasUlids;

    protected $attributes = ['is_active' => false];

    protected $fillable = [
        'document_key', 'version', 'title', 'effective_date', 'content', 'content_hash', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'effective_date' => 'date',
            'is_active' => 'boolean',
        ];
    }
}
