<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AdminLoginController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        abort_unless(config('app.admin_auth_method') === 'password', 404);

        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        if (
            ! in_array($credentials['email'], config('app.admin_emails', []), true)
            || ! Auth::attempt($credentials, true)
        ) {
            throw ValidationException::withMessages(['email' => 'Those credentials do not match our records.']);
        }

        $request->session()->regenerate();

        return redirect()->intended('/admin');
    }
}
