<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SocialLink;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SocialLinkController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/socials/index', [
            'links' => SocialLink::orderBy('display_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:500'],
            'display_order' => ['nullable', 'integer', 'min:0'],
        ]);

        SocialLink::create([
            ...$validated,
            'display_order' => $validated['display_order'] ?? (SocialLink::max('display_order') + 1),
        ]);

        return redirect()->route('admin.socials.index');
    }

    public function update(Request $request, SocialLink $social): RedirectResponse
    {
        $validated = $request->validate([
            'platform' => ['required', 'string', 'max:255'],
            'url' => ['required', 'url', 'max:500'],
            'display_order' => ['required', 'integer', 'min:0'],
            'is_active' => ['required', 'boolean'],
        ]);

        $social->update($validated);

        return redirect()->route('admin.socials.index');
    }

    public function destroy(SocialLink $social): RedirectResponse
    {
        $social->delete();

        return redirect()->route('admin.socials.index');
    }
}
