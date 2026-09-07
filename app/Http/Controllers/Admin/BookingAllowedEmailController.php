<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\BookingAllowedEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class BookingAllowedEmailController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/booking-access/index', [
            'emails' => BookingAllowedEmail::orderBy('email')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['email' => Str::lower((string) $request->input('email'))]);

        $validated = $request->validate([
            'email' => ['required', 'email:rfc', 'max:255', 'unique:booking_allowed_emails,email'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        BookingAllowedEmail::create($validated);

        return redirect()->route('admin.booking-access.index');
    }

    public function destroy(BookingAllowedEmail $bookingAllowedEmail): RedirectResponse
    {
        $bookingAllowedEmail->delete();

        return redirect()->route('admin.booking-access.index');
    }
}
