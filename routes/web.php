<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Shared helper — fetches and parses upcoming shows, cached for 5 minutes
if (!function_exists('fetchUpcomingShows')) {
function fetchUpcomingShows(int $limit = 0): array
{
    $shows = \Illuminate\Support\Facades\Cache::remember('pa_line_shows', 300, function () {
        $all = [];
        try {
            $ch = curl_init('https://calendar.google.com/calendar/ical/palineofficial%40gmail.com/public/basic.ics');
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT        => 8,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_USERAGENT      => 'Mozilla/5.0',
            ]);
            $ics = curl_exec($ch);
            curl_close($ch);

            if ($ics) {
                preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $ics, $matches);
                foreach ($matches[1] as $event) {
                    $get = fn(string $key) => preg_match('/^' . $key . '[;:]([^\r\n]+)/m', $event, $m) ? trim($m[1]) : null;
                    $raw = $get('DTSTART(?:;[^:]+)?') ?? $get('DTSTART');
                    if (!$raw) continue;
                    $clean = strpos($raw, ':') !== false ? substr($raw, strrpos($raw, ':') + 1) : $raw;
                    if (strlen($clean) >= 15) {
                        $ts = \DateTime::createFromFormat('Ymd\THis\Z', $clean, new \DateTimeZone('UTC'))
                           ?: \DateTime::createFromFormat('Ymd\THis', $clean, new \DateTimeZone('America/New_York'));
                    } else {
                        $ts = \DateTime::createFromFormat('Ymd', $clean, new \DateTimeZone('America/New_York'));
                    }
                    if (!$ts || $ts->getTimestamp() < strtotime('today')) continue;
                    $ts->setTimezone(new \DateTimeZone('America/New_York'));
                    $unescape = fn(?string $s) => $s ? str_replace(['\\,', '\\;', '\\n'], [',', ';', ' '], $s) : null;
                    $all[] = [
                        'summary'  => $unescape($get('SUMMARY')) ?? 'Show',
                        'date'     => $ts->format('D, M j, Y'),
                        'time'     => strlen($clean) >= 15 ? $ts->format('g:i A') : null,
                        'location' => $unescape($get('LOCATION')),
                        'url'      => $get('URL'),
                        'ts'       => $ts->getTimestamp(),
                    ];
                }
                usort($all, fn($a, $b) => $a['ts'] - $b['ts']);
            }
        } catch (\Throwable) {}
        return $all;
    });

    return $limit > 0 ? array_slice($shows, 0, $limit) : $shows;
}
} // end function_exists guard

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
