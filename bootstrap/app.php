<?php

use App\Http\Middleware\EnsureBookingAccess;
use App\Http\Middleware\EnsureCanManagePrototypeSite;
use App\Http\Middleware\EnsureUserIsAdmin;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\TrackSiteVisit;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $trustedProxies = array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('TRUSTED_PROXIES', '')),
        )));
        $middleware->trustProxies(at: $trustedProxies);
        $middleware->web(append: [
            HandleInertiaRequests::class,
            TrackSiteVisit::class,
        ]);
        $middleware->alias([
            'admin' => EnsureUserIsAdmin::class,
            'booking.access' => EnsureBookingAccess::class,
            'prototype-site.manage' => EnsureCanManagePrototypeSite::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
