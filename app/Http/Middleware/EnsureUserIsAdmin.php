<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        $email = $request->user()?->email;

        if (! $email || ! in_array($email, config('app.admin_emails', []), true)) {
            abort(403);
        }

        return $next($request);
    }
}
