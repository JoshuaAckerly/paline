<?php

namespace App\Models;

use App\Domain\Booking\OrganizationType;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Organization extends Model
{
    use HasUlids;

    protected $fillable = ['name', 'type'];

    protected function casts(): array
    {
        return ['type' => OrganizationType::class];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)->withPivot('role')->withTimestamps();
    }

    public function venues(): HasMany
    {
        return $this->hasMany(Venue::class);
    }

    public function contacts(): HasMany
    {
        return $this->hasMany(Contact::class);
    }
}