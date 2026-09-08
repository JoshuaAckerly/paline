<?php

use App\Http\Controllers\Admin\AnalyticsController;
use App\Http\Controllers\Admin\BookingAllowedEmailController;
use App\Http\Controllers\Admin\BookingRequestController as AdminBookingRequestController;
use App\Http\Controllers\Admin\ContactMessageController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LegalDocumentController;
use App\Http\Controllers\Admin\SeoController;
use App\Http\Controllers\Admin\SocialLinkController;
use App\Http\Controllers\Auth\AdminLoginController;
use App\Http\Controllers\Auth\MagicLinkController;
use App\Http\Controllers\AvailabilityController;
use App\Http\Controllers\BookingAccessController;
use App\Http\Controllers\BookingDocumentController;
use App\Http\Controllers\BookingQuoteController;
use App\Http\Controllers\BookingRequestController;
use App\Http\Controllers\DemandController;
use App\Http\Controllers\RoutingController;
use App\Http\Controllers\RouteSavingsController;
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

Route::get('/booking/access', [BookingAccessController::class, 'show'])->name('booking.access');

Route::middleware('booking.access')->group(function (): void {
    Route::get('/booking', fn () => Inertia::render('booking'))->name('booking');

    Route::get('/availability', [AvailabilityController::class, 'index'])->name('availability.index');
    Route::post('/availability/check', [AvailabilityController::class, 'check'])->name('availability.check');
    Route::post('/booking-requests', [BookingRequestController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('booking-requests.store');
    Route::patch('/booking-requests/{bookingRequest}', [BookingRequestController::class, 'update'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.update');
    Route::patch('/booking-requests/{bookingRequest}/production', [BookingRequestController::class, 'updateProduction'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.production.update');
    Route::patch('/booking-requests/{bookingRequest}/budget', [BookingRequestController::class, 'updateBudget'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.budget.update');
    Route::patch('/booking-requests/{bookingRequest}/merch', [BookingRequestController::class, 'updateMerch'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.merch.update');
    Route::post('/booking-requests/{bookingRequest}/dates', [BookingRequestController::class, 'storeDates'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.dates.store');
    Route::delete('/booking-requests/{bookingRequest}/dates/{bookingDate}', [BookingRequestController::class, 'destroyDate'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.dates.destroy');
    Route::post('/booking-requests/{bookingRequest}/submit', [BookingRequestController::class, 'submit'])
        ->middleware('throttle:20,1')
        ->name('booking-requests.submit');
    Route::patch('/booking-requests/{bookingRequest}/returning-profile', [BookingRequestController::class, 'updateReturningProfile'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.returning-profile.update');
    Route::post('/booking-requests/{bookingRequest}/secure-access', [BookingRequestController::class, 'claim'])
        ->middleware('throttle:20,1')
        ->name('booking-requests.secure-access');
    Route::patch('/booking-requests/{bookingRequest}/exclusivity', [BookingRequestController::class, 'updateExclusivity'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.exclusivity.update');
    Route::patch('/booking-requests/{bookingRequest}/technical-rider', [BookingRequestController::class, 'updateTechnicalRider'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.technical-rider.update');
    Route::patch('/booking-requests/{bookingRequest}/format', [BookingRequestController::class, 'updateFormat'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.format.update');
    Route::patch('/booking-requests/{bookingRequest}/checkout', [BookingRequestController::class, 'updateCheckout'])
        ->middleware('throttle:30,1')
        ->name('booking-requests.checkout.update');
    Route::get('/booking-requests/{bookingRequest}/documents/{documentKey}', [BookingDocumentController::class, 'show'])
        ->middleware('throttle:60,1')
        ->name('booking-requests.documents.show');
    Route::post('/booking-requests/{bookingRequest}/documents/{documentKey}/reviewed', [BookingDocumentController::class, 'markReviewed'])
        ->middleware('throttle:60,1')
        ->name('booking-requests.documents.reviewed');
    Route::post('/booking-requests/{bookingRequest}/confidentiality', [BookingDocumentController::class, 'acceptConfidentiality'])
        ->middleware('throttle:20,1')
        ->name('booking-requests.confidentiality.accept');
    Route::post('/booking-requests/{bookingRequest}/documents/sign', [BookingDocumentController::class, 'sign'])
        ->middleware('throttle:20,1')
        ->name('booking-requests.documents.sign');
    Route::get('/booking-requests/{bookingRequest}/quote', [BookingQuoteController::class, 'show'])
        ->middleware('throttle:60,1')
        ->name('booking-requests.quote.show');
    Route::get('/route-savings/{routeSavingsEvent}', [RouteSavingsController::class, 'show'])
        ->middleware('throttle:60,1')
        ->name('route-savings.show');
    Route::post('/route-savings/{routeSavingsEvent}/elect', [RouteSavingsController::class, 'elect'])
        ->middleware('throttle:20,1')
        ->name('route-savings.elect');
    Route::post('/routing/calculate', [RoutingController::class, 'calculate'])
        ->middleware('throttle:30,1')
        ->name('routing.calculate');
});

Route::post('/demand', [DemandController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('demand.store');

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

// Guest-only admin login; Laravel's default auth exception handler redirects here
// (named 'login') and stores the originally requested /admin URL as "intended".
Route::get('/admin/login', fn () => Inertia::render('admin/login', [
    'authMethod' => config('app.admin_auth_method'),
]))->name('login');
Route::post('/admin/login', [AdminLoginController::class, 'store'])
    ->middleware('throttle:5,1')
    ->name('admin.login.store');

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function (): void {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    Route::get('/messages', [ContactMessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/{message}', [ContactMessageController::class, 'show'])->name('messages.show');
    Route::delete('/messages/{message}', [ContactMessageController::class, 'destroy'])->name('messages.destroy');

    Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics');

    Route::get('/socials', [SocialLinkController::class, 'index'])->name('socials.index');
    Route::post('/socials', [SocialLinkController::class, 'store'])->name('socials.store');
    Route::put('/socials/{social}', [SocialLinkController::class, 'update'])->name('socials.update');
    Route::delete('/socials/{social}', [SocialLinkController::class, 'destroy'])->name('socials.destroy');

    Route::get('/seo', [SeoController::class, 'index'])->name('seo.index');
    Route::get('/seo/{pageKey}/edit', [SeoController::class, 'edit'])->name('seo.edit');
    Route::put('/seo/{pageKey}', [SeoController::class, 'update'])->name('seo.update');

    Route::get('/legal', [LegalDocumentController::class, 'index'])->name('legal.index');
    Route::post('/legal', [LegalDocumentController::class, 'store'])->name('legal.store');
    Route::post('/legal/{legalDocument}/activate', [LegalDocumentController::class, 'activate'])->name('legal.activate');

    Route::get('/booking-access', [BookingAllowedEmailController::class, 'index'])->name('booking-access.index');
    Route::post('/booking-access', [BookingAllowedEmailController::class, 'store'])->name('booking-access.store');
    Route::delete('/booking-access/{bookingAllowedEmail}', [BookingAllowedEmailController::class, 'destroy'])->name('booking-access.destroy');

    Route::get('/bookings', [AdminBookingRequestController::class, 'index'])->name('bookings.index');
    Route::post('/bookings/{bookingRequest}/confirm', [AdminBookingRequestController::class, 'confirm'])->name('bookings.confirm');
});

