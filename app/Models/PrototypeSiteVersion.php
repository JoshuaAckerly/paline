<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class PrototypeSiteVersion extends Model
{
    use HasUlids;

    protected $attributes = ['status' => 'staged'];

    protected $fillable = [
        'original_filename', 'storage_path', 'content_hash', 'uploaded_by_email',
        'notes', 'status', 'published_at',
    ];

    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function html(): string
    {
        return Storage::disk('local')->get($this->storage_path);
    }
}
