<?php
namespace App\Http\Controllers;

use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ContactController extends Controller
{
    public function send(Request $request)
    {
        $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'subject' => 'nullable|string|max:255',
            'message' => 'required|string',
        ]);

        try {
            ContactMessage::create($request->only(['name', 'email', 'subject', 'message']));
        } catch (\Exception $e) {
            // Storage failure shouldn't block the notification email below.
            \Log::error($e->getMessage());
        }

        try {
            Mail::raw(
                "Name: {$request->name}\nEmail: {$request->email}\n\nMessage:\n{$request->message}",
                function ($mail) use ($request) {
                    $mail->to('info@palineofficial.com')
                         ->subject($request->subject ?: 'New Contact Form Message');
                }
            );

            return response()->json(['success' => true]);
        } catch (\Exception $e) {
            \Log::error($e->getMessage());
            return response()->json(['error' => true], 500);
        }
    }
}
