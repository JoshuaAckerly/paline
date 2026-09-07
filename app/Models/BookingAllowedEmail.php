<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class BookingAllowedEmail extends Model
{
    protected $fillable = ['email', 'note'];

    public static function allows(?string $email): bool
    {
        if (! $email) {
            return false;
        }

        return static::query()->where('email', Str::lower($email))->exists();
    }

    protected function setEmailAttribute(string $value): void
    {
        $this->attributes['email'] = Str::lower($value);
    }
}
