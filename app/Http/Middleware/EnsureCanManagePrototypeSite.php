<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureCanManagePrototypeSite
{
    public function handle(Request $request, Closure $next): Response
    {
        $email = $request->user()?->email;

        $allowed = $email && (
            in_array($email, config('app.admin_emails', []), true)
            || in_array($email, config('app.prototype_admin_emails', []), true)
        );

        if (! $allowed) {
            abort(403);
        }

        return $next($request);
    }
}
