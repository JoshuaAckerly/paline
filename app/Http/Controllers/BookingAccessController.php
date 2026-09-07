<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BookingAccessController extends Controller
{
    public function show(Request $request): Response
    {
        return Inertia::render('booking-access', [
            'denied' => (bool) $request->session()->pull('booking_access_denied', false),
        ]);
    }
}
