<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\MagicLoginToken;
use App\Notifications\MagicLoginLink;
use App\Services\MagicLinkService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class MagicLinkController extends Controller
{
    public function store(Request $request, MagicLinkService $magicLinks): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255'],
            'name' => ['nullable', 'string', 'max:255'],
            'organization' => ['nullable', 'string', 'max:255'],
            'draft_id' => ['nullable', 'string', 'max:26'],
            'draft_token' => ['nullable', 'string', 'max:255'],
        ]);

        [, $url] = $magicLinks->issue(
            $validated['email'],
            $validated['name'] ?? null,
            $validated['draft_id'] ?? null,
            $validated['draft_token'] ?? null,
        );

        Notification::route('mail', $validated['email'])->notify(new MagicLoginLink($url));

        return response()->json([
            'message' => 'If the address can receive email, a secure sign-in link has been sent.',
        ], 202);
    }

    public function consume(
        Request $request,
        MagicLoginToken $magicLoginToken,
        MagicLinkService $magicLinks,
    ): RedirectResponse {
        $user = $magicLinks->consume($magicLoginToken, (string) $request->query('token'));

        Auth::login($user, true);
        $request->session()->regenerate();

        return redirect(config('booking.authentication.redirect_after_login'));
    }

    public function destroy(Request $request): JsonResponse
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(status: 204);
    }

    public function me(Request $request): JsonResponse
    {
        return response()->json(['user' => $request->user()?->only(['id', 'name', 'email'])]);
    }
}