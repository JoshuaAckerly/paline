<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('page_seos', function (Blueprint $table) {
            $table->id();
            $table->string('page_key')->unique();
            $table->string('page_label');
            $table->string('page_url');

            $table->string('title')->nullable();
            $table->string('meta_description', 500)->nullable();
            $table->string('canonical_url')->nullable();
            $table->string('robots')->default('index,follow');

            $table->string('og_title')->nullable();
            $table->string('og_description', 500)->nullable();
            $table->string('og_image')->nullable();
            $table->string('og_type')->default('website');

            $table->string('twitter_card')->default('summary_large_image');
            $table->string('twitter_title')->nullable();
            $table->string('twitter_description', 500)->nullable();
            $table->string('twitter_image')->nullable();

            $table->json('schema_json')->nullable();

            $table->decimal('sitemap_priority', 3, 2)->default(0.50);
            $table->string('sitemap_change_freq')->default('monthly');

            $table->timestamps();
            $table->index('page_url');
        });

        $pages = [
            ['page_key' => 'home', 'page_label' => 'Home', 'page_url' => '/', 'sitemap_priority' => 1.00],
            ['page_key' => 'music', 'page_label' => 'Music', 'page_url' => '/music', 'sitemap_priority' => 0.80],
            ['page_key' => 'shows', 'page_label' => 'Shows', 'page_url' => '/shows', 'sitemap_priority' => 0.80, 'sitemap_change_freq' => 'weekly'],
            ['page_key' => 'about', 'page_label' => 'About', 'page_url' => '/about', 'sitemap_priority' => 0.60],
            ['page_key' => 'contact', 'page_label' => 'Contact', 'page_url' => '/contact', 'sitemap_priority' => 0.60],
            ['page_key' => 'booking', 'page_label' => 'Booking', 'page_url' => '/booking', 'sitemap_priority' => 0.90],
        ];

        foreach ($pages as $page) {
            DB::table('page_seos')->insert([
                ...$page,
                'robots' => 'index,follow',
                'og_type' => 'website',
                'twitter_card' => 'summary_large_image',
                'sitemap_priority' => $page['sitemap_priority'],
                'sitemap_change_freq' => $page['sitemap_change_freq'] ?? 'monthly',
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('page_seos');
    }
};
