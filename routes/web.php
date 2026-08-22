<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('home', [
    'upcomingShows' => fetchUpcomingShows(3),
]))->name('home');
Route::get('/music', fn () => Inertia::render('music'))->name('music');
Route::get('/shows', fn () => Inertia::render('shows', ['shows' => fetchUpcomingShows()]))->name('shows');
Route::get('/about', fn () => Inertia::render('about'))->name('about');
Route::get('/contact', fn () => Inertia::render('contact'))->name('contact');
Route::post('/contact', function () {
    request()->validate([
        'name'    => 'required|string|max:100',
        'email'   => 'required|email|max:200',
        'message' => 'required|string|max:5000',
    ]);
    // Send to PA Line inbox — requires SMTP config after Google Workspace is live
    try {
        \Illuminate\Support\Facades\Mail::raw(
            "Name: " . request('name') . "\nEmail: " . request('email') . "\n\n" . request('message'),
            fn ($m) => $m->to('info@palineofficial.com')->subject('Message from ' . request('name') . ' via palineofficial.com')
        );
    } catch (\Throwable) {}
    return back()->with('success', true);
})->name('contact.send');
