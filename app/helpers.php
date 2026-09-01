<?php

use Illuminate\Support\Facades\Cache;

/**
 * Fetches and parses upcoming shows from the PA Line Google Calendar ICS feed.
 * Results are cached for 5 minutes.
 */
function fetchUpcomingShows(int $limit = 0): array
{
    $shows = Cache::remember('pa_line_shows', 300, function () {

        // Add as many ICS URLs as you want
        $feeds = [
            'https://calendar.google.com/calendar/ical/palineofficial%40gmail.com/public/basic.ics',
            'https://calendar.google.com/calendar/ical/treverstribing%40gmail.com/private-32527b15ad84d0ad1fc3ef60dd819751/basic.ics', // your iCloud feed
        ];

        $all = [];

        foreach ($feeds as $url) {
            try {
                $ch = curl_init($url);
                curl_setopt_array($ch, [
                    CURLOPT_RETURNTRANSFER => true,
                    CURLOPT_TIMEOUT        => 8,
                    CURLOPT_FOLLOWLOCATION => true,
                    CURLOPT_SSL_VERIFYPEER => true,
                    CURLOPT_USERAGENT      => 'Mozilla/5.0',
                ]);
                $ics = curl_exec($ch);
                curl_close($ch);

                if (!$ics) continue;

                preg_match_all('/BEGIN:VEVENT(.*?)END:VEVENT/s', $ics, $matches);

                foreach ($matches[1] as $event) {
                    $get = fn(string $key) => preg_match('/^' . $key . '[;:]([^\r\n]+)/m', $event, $m) ? trim($m[1]) : null;

                    $raw = $get('DTSTART(?:;[^:]+)?') ?? $get('DTSTART');
                    if (!$raw) continue;

                    $clean = strpos($raw, ':') !== false ? substr($raw, strrpos($raw, ':') + 1) : $raw;

                    if (strlen($clean) >= 15) {
                        $ts = DateTime::createFromFormat('Ymd\THis\Z', $clean, new DateTimeZone('UTC'))
                           ?: DateTime::createFromFormat('Ymd\THis', $clean, new DateTimeZone('America/New_York'));
                    } else {
                        $ts = DateTime::createFromFormat('Ymd', $clean, new DateTimeZone('America/New_York'));
                    }

                    if (!$ts || $ts->getTimestamp() < strtotime('today')) continue;

                    $ts->setTimezone(new DateTimeZone('America/New_York'));

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
            } catch (\Throwable) {}
        }

        // Merge + sort all events from all calendars
        usort($all, fn($a, $b) => $a['ts'] <=> $b['ts']);

        return $all;
    });

    return $limit > 0 ? array_slice($shows, 0, $limit) : $shows;
}
