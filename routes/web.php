<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', fn () => Inertia::render('home'))->name('home');
Route::get('/music', fn () => Inertia::render('music'))->name('music');
Route::get('/shows', fn () => Inertia::render('shows'))->name('shows');
Route::get('/about', fn () => Inertia::render('about'))->name('about');
Route::get('/contact', fn () => Inertia::render('contact'))->name('contact');
Route::post('/contact', function () {
    request()->validate([
        'name'    => 'required|string|max:100',
        'email'   => 'required|email|max:200',
        'message' => 'required|string|max:5000',
    ]);
    // TODO: wire up mail once Google Workspace is live
    return back()->with('success', true);
})->name('contact.send');
