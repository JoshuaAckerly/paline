<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureBookingAccess
{
    public function handle(Request $request, Closure $next): Response
    {
        if (config('booking.access_bypass')) {
            return $next($request);
        }

        $user = $request->user();

        // Booking is open to anyone who signs in. We still require a verified
        // identity (magic-link login) as a light spam barrier, but the former
        // email allow-list has been removed so no manual approval is needed.
        if (! $user) {
            if ($request->expectsJson()) {
                abort(401, 'Sign in to access the PA LINE booking flow.');
            }

            return redirect()->guest(route('booking.access'));
        }

        return $next($request);
    }
}
