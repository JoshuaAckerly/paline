<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('social_links', function (Blueprint $table) {
            $table->id();
            $table->string('platform');
            $table->string('url');
            $table->unsignedInteger('display_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Seed the links previously hardcoded in MainLayout.tsx so the footer
        // keeps working immediately after this migration runs.
        $links = [
            ['platform' => 'Facebook', 'url' => 'https://www.facebook.com/PALineOfficial'],
            ['platform' => 'Instagram', 'url' => 'https://www.instagram.com/palineofficial/'],
            ['platform' => 'X', 'url' => 'https://x.com/PALineOfficial'],
            ['platform' => 'Spotify', 'url' => 'https://open.spotify.com/artist/2OArsWhucdqcTIh9FenCiO'],
            ['platform' => 'Apple Music', 'url' => 'https://music.apple.com/us/artist/pa-line/971265800'],
            ['platform' => 'YouTube', 'url' => 'https://www.youtube.com/@palineofficial'],
            ['platform' => 'Amazon', 'url' => 'https://music.amazon.com/artists/B01L1B73TC/pa-line'],
        ];

        foreach ($links as $order => $link) {
            DB::table('social_links')->insert([
                ...$link,
                'display_order' => $order,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('social_links');
    }
};
