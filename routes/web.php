<?php

use App\Http\Controllers\Auth\MagicLinkController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ContactController;

Route::get('/', fn () => Inertia::render('home', [
    'upcomingShows' => fetchUpcomingShows(3),
]))->name('home');
Route::get('/music', fn () => Inertia::render('music'))->name('music');
Route::get('/shows', fn () => Inertia::render('shows', ['shows' => fetchUpcomingShows()]))->name('shows');
Route::get('/about', fn () => Inertia::render('about'))->name('about');
Route::get('/contact', fn () => Inertia::render('contact'))->name('contact');
Route::redirect('/booking', '/booking/')->name('booking');

Route::prefix('auth')->group(function (): void {
    Route::post('/magic-link', [MagicLinkController::class, 'store'])
        ->middleware('throttle:6,1')
        ->name('auth.magic.store');
    Route::get('/callback/{magicLoginToken}', [MagicLinkController::class, 'consume'])
        ->middleware(['signed', 'throttle:12,1'])
        ->name('auth.magic.consume');
    Route::post('/logout', [MagicLinkController::class, 'destroy'])
        ->middleware('auth')
        ->name('auth.logout');
    Route::get('/me', [MagicLinkController::class, 'me'])->name('auth.me');
});

Route::post('/contact', [ContactController::class, 'send']);
