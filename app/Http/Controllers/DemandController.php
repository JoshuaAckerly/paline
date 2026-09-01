<?php

namespace App\Http\Controllers;

use App\Models\DemandSignal;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class DemandController extends Controller
{
    private const MOMENTUM_ACTIONS = [
        'street_team', 'share_social', 'follow_subscribe', 'invite_friends',
        'contact_venue', 'promote_locally',
    ];

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'city' => ['required', 'string', 'max:255'],
            'state' => ['required', 'string', 'max:64'],
            'postal_code' => ['nullable', 'string', 'max:20'],
            'preferred_venue' => ['nullable', 'string', 'max:255'],
            'alternate_venue' => ['nullable', 'string', 'max:255'],
            'estimated_attendees' => ['required', 'integer', Rule::in([1, 2, 4, 8, 15, 25])],
            'local_role' => ['required', Rule::in(['fan', 'connector', 'venue'])],
            'notes' => ['nullable', 'string', 'max:2000'],
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:40'],
            'consent_to_updates' => ['required', 'boolean'],
            'update_preference' => ['nullable', Rule::requiredIf(fn () => $request->boolean('consent_to_updates')), Rule::in(['email', 'text', 'email_text'])],
            'momentum_actions' => ['sometimes', 'array', 'max:6'],
            'momentum_actions.*' => [Rule::in(self::MOMENTUM_ACTIONS)],
        ]);

        if (! $request->boolean('consent_to_updates')) {
            $validated['update_preference'] = null;
        }

        $signal = DemandSignal::create($validated);

        return response()->json([
            'id' => $signal->id,
            'city' => $signal->city,
            'state' => $signal->state,
            'status' => 'recorded',
        ], 201);
    }
}