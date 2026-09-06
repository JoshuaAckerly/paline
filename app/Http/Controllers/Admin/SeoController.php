<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\PageSeo;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class SeoController extends Controller
{
    public function index(): Response
    {
        $pages = PageSeo::query()->orderBy('page_label')->get();

        return Inertia::render('admin/seo/index', [
            'pages' => $pages,
            'complete' => $pages->filter(fn (PageSeo $page) => $page->title && $page->meta_description)->count(),
            'total' => $pages->count(),
        ]);
    }

    public function edit(string $pageKey): Response
    {
        $page = PageSeo::where('page_key', $pageKey)->firstOrFail();

        return Inertia::render('admin/seo/edit', ['page' => $page]);
    }

    public function update(Request $request, string $pageKey): RedirectResponse
    {
        $page = PageSeo::where('page_key', $pageKey)->firstOrFail();

        $validated = $request->validate([
            'title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string', 'max:500'],
            'canonical_url' => ['nullable', 'url', 'max:500'],
            'robots' => ['required', Rule::in(['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'])],
            'og_title' => ['nullable', 'string', 'max:255'],
            'og_description' => ['nullable', 'string', 'max:500'],
            'og_image' => ['nullable', 'url', 'max:500'],
            'og_type' => ['nullable', 'string', 'max:255'],
            'twitter_card' => ['nullable', 'in:summary,summary_large_image'],
            'twitter_title' => ['nullable', 'string', 'max:255'],
            'twitter_description' => ['nullable', 'string', 'max:500'],
            'twitter_image' => ['nullable', 'url', 'max:500'],
            'schema_json' => ['nullable', 'string'],
            'sitemap_priority' => ['required', 'numeric', 'min:0', 'max:1'],
            'sitemap_change_freq' => ['required', 'in:always,hourly,daily,weekly,monthly,yearly,never'],
        ]);

        $validated['schema_json'] = $validated['schema_json'] ? json_decode($validated['schema_json'], true) : null;

        $page->update($validated);

        return redirect()->route('admin.seo.index')->with('success', 'SEO settings updated.');
    }
}
