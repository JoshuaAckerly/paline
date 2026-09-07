<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Booking\LegalDocumentVersion;
use App\Http\Controllers\Controller;
use App\Models\LegalDocument;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use InvalidArgumentException;

class LegalDocumentController extends Controller
{
    /** @var array<string, string> */
    public const DOCUMENT_LABELS = [
        'agreement' => 'Performance Agreement',
        'nda' => 'Confidential Pricing & Booking Terms Agreement',
        'stage' => 'Stage Plot',
        'tech' => 'Technical Rider',
        'hospitality' => 'Personal / Hospitality Rider',
    ];

    public function index(): Response
    {
        $documents = LegalDocument::query()
            ->orderByDesc('created_at')
            ->get()
            ->groupBy('document_key');

        $rows = collect(self::DOCUMENT_LABELS)->map(fn (string $label, string $key) => [
            'document_key' => $key,
            'label' => $label,
            'active' => optional($documents->get($key, collect())->firstWhere('is_active', true))
                ->only(['id', 'version', 'title', 'effective_date']),
            'versions' => $documents->get($key, collect())->map->only([
                'id', 'version', 'title', 'effective_date', 'is_active', 'created_at',
            ])->values(),
        ])->values();

        return Inertia::render('admin/legal/index', ['documents' => $rows]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'document_key' => ['required', Rule::in(array_keys(self::DOCUMENT_LABELS))],
            'version' => ['required', 'string', 'max:64'],
            'title' => ['required', 'string', 'max:255'],
            'effective_date' => ['nullable', 'date'],
            'content' => ['required', 'string'],
        ]);

        // Content is admin-trusted input. A future public-facing Review & Sign
        // renderer must sanitize or safely format this before display to bookers.
        $hash = hash('sha256', $validated['content']);

        try {
            new LegalDocumentVersion(
                (string) Str::ulid(),
                $validated['document_key'],
                $validated['version'],
                $hash,
            );
        } catch (InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['version' => $exception->getMessage()]);
        }

        DB::transaction(function () use ($validated, $hash): void {
            LegalDocument::where('document_key', $validated['document_key'])
                ->where('is_active', true)
                ->update(['is_active' => false]);

            LegalDocument::create([
                ...$validated,
                'content_hash' => $hash,
                'is_active' => true,
            ]);
        });

        return redirect()->route('admin.legal.index')->with('success', self::DOCUMENT_LABELS[$validated['document_key']].' updated.');
    }

    public function activate(LegalDocument $legalDocument): RedirectResponse
    {
        DB::transaction(function () use ($legalDocument): void {
            LegalDocument::where('document_key', $legalDocument->document_key)
                ->where('is_active', true)
                ->update(['is_active' => false]);

            $legalDocument->update(['is_active' => true]);
        });

        return redirect()->route('admin.legal.index')->with('success', $legalDocument->title.' '.$legalDocument->version.' is now active.');
    }
}
