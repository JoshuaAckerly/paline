<?php

namespace App\Http\Middleware;

use App\Models\SiteVisit;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class TrackSiteVisit
{
    private const SKIP_PREFIXES = ['/up', '/build', '/storage'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if ($this->shouldTrack($request)) {
            $userAgent = $request->userAgent();

            SiteVisit::create([
                'user_id' => $request->user()?->id,
                'ip_address' => $request->ip(),
                'user_agent' => $userAgent,
                'path' => '/'.ltrim($request->path(), '/'),
                'referer' => $request->headers->get('referer'),
                'is_bot' => SiteVisit::isBot($userAgent),
            ]);
        }

        return $response;
    }

    private function shouldTrack(Request $request): bool
    {
        // Inertia navigations are XHR requests too, so only exclude plain
        // JSON/XHR calls (e.g. availability checks) that aren't page visits.
        if (! $request->isMethod('GET') || ($request->ajax() && ! $request->header('X-Inertia'))) {
            return false;
        }

        foreach (self::SKIP_PREFIXES as $prefix) {
            if ($request->is(ltrim($prefix, '/').'*')) {
                return false;
            }
        }

        return true;
    }
}
