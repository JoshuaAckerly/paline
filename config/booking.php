<?php

return [
    'scheduling' => [
        'booking_horizon_months' => 24,
        'earliest_performance_start_minutes' => 10 * 60,
        'latest_performance_start_minutes' => 23 * 60,
        'pre_show_minutes' => 120,
        'post_show_minutes' => 120,
        'default_performance_duration_minutes' => 90,
        'max_additional_bookings' => 24,
    ],
    'pricing' => [
        'performance_baselines' => [
            'solo' => [200, 200, 200, 250, 250, 300, 300],
            'duo' => [350, 350, 350, 450, 450, 550, 550],
            'full_pa_line' => [600, 600, 600, 750, 750, 1000, 1000],
        ],
        'season_multipliers' => [
            1 => 0.75,
            2 => 0.75,
            3 => 1.00,
            4 => 1.00,
            5 => 1.25,
            6 => 1.40,
            7 => 1.40,
            8 => 1.40,
            9 => 1.25,
            10 => 1.00,
            11 => 1.00,
            12 => 0.75,
        ],
        'mileage_rate' => 0.80,
        'max_drive_hours_without_allowance' => 8.0,
        'hourly_drive_rate' => 0,
        'sound_fees' => [
            'solo' => 25,
            'duo' => 50,
            'full_pa_line' => 250,
        ],
        'sound_technician_base_fee' => 150,
        'sound_technician_mileage_rate' => 0.80,
    ],
];
