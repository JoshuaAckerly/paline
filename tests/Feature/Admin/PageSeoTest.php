<?php

namespace Tests\Feature\Admin;

use App\Models\PageSeo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class PageSeoTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migration_seeds_a_row_per_existing_page(): void
    {
        $this->assertSame(6, PageSeo::count());
        $this->assertDatabaseHas('page_seos', ['page_key' => 'home', 'page_url' => '/']);
    }

    public function test_page_seo_forpath_normalizes_the_path(): void
    {
        $this->assertSame('home', PageSeo::forPath('/')->page_key);
        $this->assertSame('music', PageSeo::forPath('music')->page_key);
        $this->assertSame('music', PageSeo::forPath('/music/')->page_key);
        $this->assertNull(PageSeo::forPath('/does-not-exist'));
    }

    public function test_an_admin_edited_title_is_shared_with_the_public_page(): void
    {
        PageSeo::where('page_key', 'home')->update(['title' => 'Custom Home Title', 'meta_description' => 'Custom description.']);

        $this->get('/')->assertInertia(fn (Assert $page) => $page
            ->where('pageSeo.title', 'Custom Home Title')
            ->where('pageSeo.meta_description', 'Custom description.'));
    }

    public function test_an_admin_can_update_a_pages_seo_settings(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->get('/admin/seo')->assertOk();
        $this->actingAs($admin)->get('/admin/seo/home/edit')->assertOk();

        $this->actingAs($admin)->put('/admin/seo/home', [
            'title' => 'PA Line — Home',
            'meta_description' => 'Updated description.',
            'canonical_url' => null,
            'robots' => 'index,follow',
            'og_title' => null,
            'og_description' => null,
            'og_image' => null,
            'og_type' => 'website',
            'twitter_card' => 'summary_large_image',
            'twitter_title' => null,
            'twitter_description' => null,
            'twitter_image' => null,
            'schema_json' => null,
            'sitemap_priority' => 1,
            'sitemap_change_freq' => 'monthly',
        ])->assertRedirect();

        $this->assertSame('PA Line — Home', PageSeo::where('page_key', 'home')->sole()->title);
    }
}
