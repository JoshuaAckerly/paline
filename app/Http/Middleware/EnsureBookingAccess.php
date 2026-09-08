<?php

namespace App\Http\Middleware;

use App\Models\BookingAllowedEmail;
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

        if (! $user) {
            if ($request->expectsJson()) {
                abort(401, 'Sign in to access the PA LINE booking preview.');
            }

            return redirect()->guest(route('booking.access'));
        }

        if (! BookingAllowedEmail::allows($user->email)) {
            if ($request->expectsJson()) {
                abort(403, 'This email is not yet approved for the PA LINE booking preview.');
            }

            $request->session()->flash('booking_access_denied', true);

            return redirect()->route('booking.access');
        }

        return $next($request);
    }
}
