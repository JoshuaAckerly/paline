<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'page_key', 'page_label', 'page_url',
    'title', 'meta_description', 'canonical_url', 'robots',
    'og_title', 'og_description', 'og_image', 'og_type',
    'twitter_card', 'twitter_title', 'twitter_description', 'twitter_image',
    'schema_json', 'sitemap_priority', 'sitemap_change_freq',
])]
class PageSeo extends Model
{
    protected function casts(): array
    {
        return [
            'schema_json' => 'array',
            'sitemap_priority' => 'decimal:2',
        ];
    }

    public static function forPath(string $path): ?self
    {
        $normalized = '/'.trim($path, '/');

        return static::query()->where('page_url', $normalized)->first();
    }
}
