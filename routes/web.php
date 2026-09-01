<?php

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

Route::post('/contact', [ContactController::class, 'send']);
