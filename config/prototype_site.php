<?php

return [
    // Where a published version actually gets written. Kept overridable so tests
    // never touch the real dev copies of these files.
    'live_paths' => [
        public_path('exact-copy-site/index.html'),
        public_path('exact-copy-site/PA_LINE_PUBLIC_BOOKING.html'),
    ],
];
