<?php

namespace App\Http\Controllers;

use App\Domain\Booking\RouteSavingsCalculator;
use App\Models\RouteSavingsElection;
use App\Models\RouteSavingsEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RouteSavingsController extends Controller
{
    public function show(Request $request, RouteSavingsEvent $routeSavingsEvent): Response
    {
        $this->authorizeAccess($request, $routeSavingsEvent);

        $routeSavingsEvent->load('election');

        return Inertia::render('route-savings', [
            'event' => [
                'id' => $routeSavingsEvent->id,
                'savings' => $routeSavingsEvent->savings,
                'status' => $routeSavingsEvent->status,
                'election' => $routeSavingsEvent->election?->only([
                    'preset', 'return_percent', 'credit_percent', 'reinvest_percent',
                    'return_amount', 'credit_amount', 'reinvest_amount', 'elected_at',
                ]),
            ],
        ]);
    }

    public function elect(Request $request, RouteSavingsEvent $routeSavingsEvent, RouteSavingsCalculator $calculator): JsonResponse
    {
        $this->authorizeAccess($request, $routeSavingsEvent);

        if ($routeSavingsEvent->status !== 'pending') {
            throw ValidationException::withMessages(['event' => 'This Route Savings event has already been elected.']);
        }

        $validated = $request->validate([
            'preset' => ['required', 'in:return,credit,buzz,half,custom'],
            'return_percent' => ['required_if:preset,custom', 'nullable', 'integer', 'min:0', 'max:100'],
            'credit_percent' => ['required_if:preset,custom', 'nullable', 'integer', 'min:0', 'max:100'],
            'reinvest_percent' => ['required_if:preset,custom', 'nullable', 'integer', 'min:0', 'max:100'],
        ]);

        $presets = [
            'return' => [100, 0, 0],
            'credit' => [0, 100, 0],
            'buzz' => [0, 0, 100],
            'half' => [50, 0, 50],
        ];

        [$returnPercent, $creditPercent, $reinvestPercent] = $validated['preset'] === 'custom'
            ? [$validated['return_percent'], $validated['credit_percent'], $validated['reinvest_percent']]
            : $presets[$validated['preset']];

        try {
            $allocation = $calculator->allocate($routeSavingsEvent->savings, $returnPercent, $creditPercent, $reinvestPercent);
        } catch (\InvalidArgumentException $exception) {
            throw ValidationException::withMessages(['percentages' => $exception->getMessage()]);
        }

        $election = RouteSavingsElection::create([
            'route_savings_event_id' => $routeSavingsEvent->id,
            'preset' => $validated['preset'],
            'return_percent' => $returnPercent,
            'credit_percent' => $creditPercent,
            'reinvest_percent' => $reinvestPercent,
            'return_amount' => $allocation->returnAmount,
            'credit_amount' => $allocation->creditAmount,
            'reinvest_amount' => $allocation->reinvestAmount,
            'elected_at' => now(),
        ]);

        $routeSavingsEvent->update(['status' => 'elected']);

        return response()->json([
            'status' => 'elected',
            'return_amount' => $election->return_amount,
            'credit_amount' => $election->credit_amount,
            'reinvest_amount' => $election->reinvest_amount,
        ]);
    }

    private function authorizeAccess(Request $request, RouteSavingsEvent $routeSavingsEvent): void
    {
        $user = $request->user();
        $owner = $routeSavingsEvent->bookingRequest?->requester_user_id;

        if ($user === null || $owner === null || $owner !== $user->getAuthIdentifier()) {
            abort(403, 'You do not have access to this Route Savings event.');
        }
    }
}
