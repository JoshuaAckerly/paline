<?php

namespace Tests\Feature\Admin;

use App\Models\PrototypeSiteVersion;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PrototypeSiteControllerTest extends TestCase
{
    use RefreshDatabase;

    private function validFixtureHtml(): string
    {
        return <<<'HTML'
<!DOCTYPE html><html><body><script>
function timeLogPublicBookingRequest(){
  try{const outbox=JSON.parse(localStorage.getItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY)||"[]");const safe=Array.isArray(outbox)?outbox:[];safe.push(packet);localStorage.setItem(PA_LINE_PUBLIC_INQUIRY_OUTBOX_KEY,JSON.stringify(safe))}catch(e){}
}
</script></body></html>
HTML;
    }

    private function livePaths(): array
    {
        return [
            storage_path('framework/testing/prototype-live-index.html'),
            storage_path('framework/testing/prototype-live-alias.html'),
        ];
    }

    protected function setUp(): void
    {
        parent::setUp();

        Storage::fake('local');
        config(['prototype_site.live_paths' => $this->livePaths()]);
    }

    protected function tearDown(): void
    {
        foreach ($this->livePaths() as $path) {
            @unlink($path);
        }

        parent::tearDown();
    }

    public function test_a_full_admin_can_view_the_page(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->get('/admin/prototype-site')
            ->assertInertia(fn ($page) => $page->component('admin/prototype-site/edit'));
    }

    public function test_a_scoped_prototype_admin_can_view_the_page_but_not_the_rest_of_admin(): void
    {
        $trevor = User::factory()->create(['email' => config('app.prototype_admin_emails')[0]]);

        $this->actingAs($trevor)->get('/admin/prototype-site')->assertOk();
        $this->actingAs($trevor)->get('/admin/messages')->assertForbidden();
    }

    public function test_a_user_in_neither_list_is_forbidden(): void
    {
        $stranger = User::factory()->create(['email' => 'nobody@example.com']);

        $this->actingAs($stranger)->get('/admin/prototype-site')->assertForbidden();
    }

    public function test_uploading_a_valid_file_stages_a_patched_version(): void
    {
        $trevor = User::factory()->create(['email' => config('app.prototype_admin_emails')[0]]);
        $file = UploadedFile::fake()->createWithContent('prototype.html', $this->validFixtureHtml());

        $this->actingAs($trevor)
            ->post('/admin/prototype-site', ['file' => $file, 'notes' => 'New checkout step'])
            ->assertRedirect('/admin/prototype-site');

        $version = PrototypeSiteVersion::sole();
        $this->assertSame('staged', $version->status);
        $this->assertSame('New checkout step', $version->notes);
        $this->assertStringContainsString('deliverPrototypeInquiry(packet);', $version->html());
    }

    public function test_uploading_a_file_missing_the_expected_anchors_fails_validation(): void
    {
        $trevor = User::factory()->create(['email' => config('app.prototype_admin_emails')[0]]);
        $file = UploadedFile::fake()->createWithContent('prototype.html', '<!DOCTYPE html><html><body>nothing recognizable</body></html>');

        $this->actingAs($trevor)
            ->post('/admin/prototype-site', ['file' => $file])
            ->assertSessionHasErrors('file');

        $this->assertSame(0, PrototypeSiteVersion::count());
    }

    public function test_preview_streams_the_stored_html_for_a_staged_version(): void
    {
        $trevor = User::factory()->create(['email' => config('app.prototype_admin_emails')[0]]);
        $file = UploadedFile::fake()->createWithContent('prototype.html', $this->validFixtureHtml());
        $this->actingAs($trevor)->post('/admin/prototype-site', ['file' => $file]);
        $version = PrototypeSiteVersion::sole();

        $response = $this->actingAs($trevor)->get("/admin/prototype-site/{$version->id}/preview");

        $response->assertOk();
        $response->assertHeader('Content-Type', 'text/html; charset=UTF-8');
        $this->assertStringContainsString('deliverPrototypeInquiry(packet);', $response->getContent());
    }

    public function test_publishing_writes_the_live_files_and_archives_the_previous_version(): void
    {
        $trevor = User::factory()->create(['email' => config('app.prototype_admin_emails')[0]]);

        $first = UploadedFile::fake()->createWithContent('v1.html', $this->validFixtureHtml());
        $this->actingAs($trevor)->post('/admin/prototype-site', ['file' => $first]);
        $firstVersion = PrototypeSiteVersion::sole();
        $this->actingAs($trevor)->post("/admin/prototype-site/{$firstVersion->id}/publish")
            ->assertRedirect('/admin/prototype-site');

        $firstVersion->refresh();
        $this->assertSame('published', $firstVersion->status);
        foreach ($this->livePaths() as $path) {
            $this->assertStringContainsString('deliverPrototypeInquiry(packet);', file_get_contents($path));
        }

        $second = UploadedFile::fake()->createWithContent('v2.html', $this->validFixtureHtml());
        $this->actingAs($trevor)->post('/admin/prototype-site', ['file' => $second]);
        $secondVersion = PrototypeSiteVersion::orderByDesc('id')->first();
        $this->actingAs($trevor)->post("/admin/prototype-site/{$secondVersion->id}/publish");

        $firstVersion->refresh();
        $secondVersion->refresh();
        $this->assertSame('archived', $firstVersion->status);
        $this->assertSame('published', $secondVersion->status);

        // Publishing the archived first version again is the rollback path.
        $this->actingAs($trevor)->post("/admin/prototype-site/{$firstVersion->id}/publish");
        $firstVersion->refresh();
        $secondVersion->refresh();
        $this->assertSame('published', $firstVersion->status);
        $this->assertSame('archived', $secondVersion->status);
    }
}
