<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteVisit;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AnalyticsController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();

        $totalVisits = SiteVisit::human()->count();
        $visitsLast30Days = SiteVisit::human()->where('created_at', '>=', $now->copy()->subDays(30))->count();
        $visitsLast7Days = SiteVisit::human()->where('created_at', '>=', $now->copy()->subDays(7))->count();
        $uniqueIpsLast30 = SiteVisit::human()->where('created_at', '>=', $now->copy()->subDays(30))->distinct()->count('ip_address');

        $dailyCounts = SiteVisit::human()
            ->where('created_at', '>=', $now->copy()->subDays(13)->startOfDay())
            ->selectRaw("date(created_at) as day, count(*) as count")
            ->groupBy('day')
            ->pluck('count', 'day');

        $dailyChart = collect(range(0, 13))->map(function (int $offset) use ($now, $dailyCounts) {
            $day = $now->copy()->subDays(13 - $offset)->toDateString();

            return ['date' => $day, 'count' => (int) ($dailyCounts[$day] ?? 0)];
        })->values();

        $topPages = SiteVisit::human()
            ->where('created_at', '>=', $now->copy()->subDays(30))
            ->selectRaw('path, count(*) as count')
            ->groupBy('path')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $recentVisits = SiteVisit::human()
            ->with('user:id,name,email')
            ->latest('created_at')
            ->limit(50)
            ->get()
            ->map(fn (SiteVisit $visit) => [
                'id' => $visit->id,
                'path' => $visit->path,
                'ip_address' => $visit->ip_address,
                'browser' => $visit->browser,
                'referer' => $visit->referer,
                'user' => $visit->user?->only(['name', 'email']),
                'created_at' => $visit->created_at,
            ]);

        return Inertia::render('admin/analytics/index', [
            'stats' => [
                'totalVisits' => $totalVisits,
                'visitsLast30Days' => $visitsLast30Days,
                'visitsLast7Days' => $visitsLast7Days,
                'uniqueIpsLast30' => $uniqueIpsLast30,
            ],
            'dailyChart' => $dailyChart,
            'topPages' => $topPages,
            'recentVisits' => $recentVisits,
        ]);
    }
}
