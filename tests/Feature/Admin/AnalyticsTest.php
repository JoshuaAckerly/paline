<?php

namespace Tests\Feature\Admin;

use App\Models\SiteVisit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AnalyticsTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_page_visit_is_tracked(): void
    {
        $this->get('/');

        $this->assertDatabaseHas('site_visits', ['path' => '/']);
    }

    public function test_a_bot_user_agent_is_flagged(): void
    {
        $this->get('/', ['User-Agent' => 'Googlebot/2.1']);

        $visit = SiteVisit::sole();
        $this->assertTrue($visit->is_bot);
    }

    public function test_an_admin_can_view_the_analytics_dashboard(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->get('/admin/analytics')->assertOk();
    }
}
