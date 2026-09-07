<?php

namespace Tests\Feature\Admin;

use App\Models\LegalDocument;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LegalDocumentsTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_admin_can_create_a_new_active_version(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);

        $this->actingAs($admin)->post('/admin/legal', [
            'document_key' => 'agreement',
            'version' => '2026.09-v1',
            'title' => 'Performance Agreement',
            'effective_date' => '2026-09-07',
            'content' => '<p>Terms.</p>',
        ])->assertRedirect();

        $document = LegalDocument::where('document_key', 'agreement')->sole();
        $this->assertTrue($document->is_active);
        $this->assertSame(hash('sha256', '<p>Terms.</p>'), $document->content_hash);
    }

    public function test_creating_a_new_version_deactivates_the_previous_active_version(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);
        $original = LegalDocument::create([
            'document_key' => 'nda', 'version' => 'v1', 'title' => 'NDA',
            'content' => 'old', 'content_hash' => hash('sha256', 'old'), 'is_active' => true,
        ]);

        $this->actingAs($admin)->post('/admin/legal', [
            'document_key' => 'nda',
            'version' => 'v2',
            'title' => 'NDA',
            'content' => 'new',
        ])->assertRedirect();

        $this->assertFalse($original->fresh()->is_active);
        $this->assertTrue(LegalDocument::where('version', 'v2')->sole()->is_active);
    }

    public function test_an_older_version_can_be_reactivated(): void
    {
        $admin = User::factory()->create(['email' => config('app.admin_emails')[0]]);
        $v1 = LegalDocument::create([
            'document_key' => 'stage', 'version' => 'v1', 'title' => 'Stage Plot',
            'content' => 'old', 'content_hash' => hash('sha256', 'old'), 'is_active' => false,
        ]);
        LegalDocument::create([
            'document_key' => 'stage', 'version' => 'v2', 'title' => 'Stage Plot',
            'content' => 'new', 'content_hash' => hash('sha256', 'new'), 'is_active' => true,
        ]);

        $this->actingAs($admin)->post("/admin/legal/{$v1->id}/activate")->assertRedirect();

        $this->assertTrue($v1->fresh()->is_active);
        $this->assertFalse(LegalDocument::where('version', 'v2')->sole()->is_active);
    }

    public function test_a_guest_cannot_manage_legal_documents(): void
    {
        $this->post('/admin/legal', [
            'document_key' => 'agreement', 'version' => 'v1', 'title' => 'x', 'content' => 'x',
        ])->assertRedirect('/admin/login');
    }
}
