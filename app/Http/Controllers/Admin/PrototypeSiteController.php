<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PrototypeSiteVersion;
use App\Services\PrototypeSitePatcher;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PrototypeSiteController extends Controller
{
    private const STORAGE_DIR = 'prototype-site-versions';

    public function edit(): Response
    {
        return Inertia::render('admin/prototype-site/edit', [
            'versions' => PrototypeSiteVersion::query()
                ->latest()
                ->get(['id', 'original_filename', 'uploaded_by_email', 'notes', 'status', 'published_at', 'created_at']),
        ]);
    }

    public function store(Request $request, PrototypeSitePatcher $patcher): RedirectResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'mimes:html,htm', 'max:20480'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ]);

        $raw = file_get_contents($validated['file']->getRealPath());

        try {
            $patched = $patcher->patch($raw);
        } catch (\RuntimeException $exception) {
            throw ValidationException::withMessages(['file' => $exception->getMessage()]);
        }

        $storagePath = self::STORAGE_DIR.'/'.Str::ulid().'.html';
        Storage::disk('local')->put($storagePath, $patched);

        PrototypeSiteVersion::create([
            'original_filename' => $validated['file']->getClientOriginalName(),
            'storage_path' => $storagePath,
            'content_hash' => hash('sha256', $patched),
            'uploaded_by_email' => $request->user()->email,
            'notes' => $validated['notes'] ?? null,
            'status' => 'staged',
        ]);

        return redirect()->route('admin.prototype-site.edit')->with('success', 'Uploaded and staged for preview.');
    }

    public function preview(PrototypeSiteVersion $prototypeSiteVersion): HttpResponse
    {
        return response($prototypeSiteVersion->html(), 200, ['Content-Type' => 'text/html']);
    }

    public function publish(PrototypeSiteVersion $prototypeSiteVersion): RedirectResponse
    {
        $html = $prototypeSiteVersion->html();

        foreach (config('prototype_site.live_paths') as $livePath) {
            $tempPath = $livePath.'.'.Str::random(8).'.tmp';
            file_put_contents($tempPath, $html);
            rename($tempPath, $livePath);
        }

        DB::transaction(function () use ($prototypeSiteVersion): void {
            PrototypeSiteVersion::where('status', 'published')->update(['status' => 'archived']);

            $prototypeSiteVersion->update(['status' => 'published', 'published_at' => now()]);
        });

        return redirect()->route('admin.prototype-site.edit')->with('success', 'Published live.');
    }
}
