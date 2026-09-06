<?php

namespace Tests\Feature\Admin;

use App\Models\SocialLink;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocialLinksTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_migration_seeds_the_existing_footer_links(): void
    {
        $this->assertSame(7, SocialLink::count());
        $this->assertDatabaseHas('social_links', ['platform' => 'Facebook']);
    }

    public function test_active_social_links_are_shared_with_every_page(): void
    {
        $this->get('/')->assertInertia(fn ($page) => $page->has('socialLinks', 7));
    }

    public function test_an_admin_can_add_update_and_remove_a_link(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->post('/admin/socials', [
            'platform' => 'TikTok',
            'url' => 'https://www.tiktok.com/@palineofficial',
        ])->assertRedirect();

        $link = SocialLink::where('platform', 'TikTok')->sole();
        $this->assertSame(7, $link->display_order);

        $this->actingAs($admin)->put("/admin/socials/{$link->id}", [
            'platform' => 'TikTok',
            'url' => 'https://www.tiktok.com/@palineofficial',
            'display_order' => 0,
            'is_active' => false,
        ])->assertRedirect();

        $this->assertFalse($link->fresh()->is_active);

        $this->actingAs($admin)->delete("/admin/socials/{$link->id}")->assertRedirect();
        $this->assertDatabaseMissing('social_links', ['id' => $link->id]);
    }
}
