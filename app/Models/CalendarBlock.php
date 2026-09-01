<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;

class CalendarBlock extends Model
{
    use HasUlids;

    protected $fillable = ['starts_on', 'ends_on', 'reason'];

    protected function casts(): array
    {
        return ['starts_on' => 'date', 'ends_on' => 'date'];
    }
}