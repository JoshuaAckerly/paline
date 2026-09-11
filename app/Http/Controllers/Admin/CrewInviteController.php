<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;
use Inertia\Response;

class CrewInviteController extends Controller
{
    private string $nodeBase = 'http://127.0.0.1:5174';

    public function index(): Response
    {
        $members = [];
        $invites = [];
        $nodeError = null;

        try {
            $res = Http::timeout(5)
                ->withHeaders(['Host' => '127.0.0.1:5174'])
                ->get("{$this->nodeBase}/api/auth/members");

            if ($res->successful()) {
                $data = $res->json();
                $members = $data['members'] ?? [];
                $invites = $data['invites'] ?? [];
            } else {
                $nodeError = 'Could not reach the PA LINE crew server.';
            }
        } catch (\Throwable) {
            $nodeError = 'Could not reach the PA LINE crew server.';
        }

        return Inertia::render('admin/crew-invites/index', compact('members', 'invites', 'nodeError'));
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'string', 'max:64', 'regex:/^[a-z0-9_\-]+$/'],
            'role'      => ['required', 'in:member,crew_admin'],
        ]);

        try {
            $res = Http::timeout(5)
                ->withHeaders(['Host' => '127.0.0.1:5174'])
                ->post("{$this->nodeBase}/api/auth/invite", [
                    'memberId'   => $validated['member_id'],
                    'authorized' => true,
                    'role'       => $validated['role'],
                    '_adminBypass' => config('app.crew_admin_bypass_secret'),
                ]);

            if (! $res->successful()) {
                return back()->withErrors(['member_id' => $res->json('error') ?? 'The crew server rejected this request.']);
            }
        } catch (\Throwable) {
            return back()->withErrors(['member_id' => 'Could not reach the PA LINE crew server.']);
        }

        return redirect()->route('admin.crew-invites.index')->with('success', "Access granted for {$validated['member_id']}.");
    }

    public function destroy(string $memberId): RedirectResponse
    {
        try {
            Http::timeout(5)
                ->withHeaders(['Host' => '127.0.0.1:5174'])
                ->post("{$this->nodeBase}/api/auth/invite", [
                    'memberId'   => $memberId,
                    'authorized' => false,
                    'role'       => 'member',
                    '_adminBypass' => config('app.crew_admin_bypass_secret'),
                ]);
        } catch (\Throwable) {
            // best-effort revoke
        }

        return redirect()->route('admin.crew-invites.index')->with('success', "Access revoked for {$memberId}.");
    }
}
