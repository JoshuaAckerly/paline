<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Application Name
    |--------------------------------------------------------------------------
    |
    | This value is the name of your application, which will be used when the
    | framework needs to place the application's name in a notification or
    | other UI elements where an application name needs to be displayed.
    |
    */

    'name' => env('APP_NAME', 'Laravel'),

    /*
    |--------------------------------------------------------------------------
    | Application Environment
    |--------------------------------------------------------------------------
    |
    | This value determines the "environment" your application is currently
    | running in. This may determine how you prefer to configure various
    | services the application utilizes. Set this in your ".env" file.
    |
    */

    'env' => env('APP_ENV', 'production'),

    /*
    |--------------------------------------------------------------------------
    | Application Debug Mode
    |--------------------------------------------------------------------------
    |
    | When your application is in debug mode, detailed error messages with
    | stack traces will be shown on every error that occurs within your
    | application. If disabled, a simple generic error page is shown.
    |
    */

    'debug' => (bool) env('APP_DEBUG', false),

    /*
    |--------------------------------------------------------------------------
    | Application URL
    |--------------------------------------------------------------------------
    |
    | This URL is used by the console to properly generate URLs when using
    | the Artisan command line tool. You should set this to the root of
    | the application so that it's available within Artisan commands.
    |
    */

    'url' => env('APP_URL', 'http://localhost'),

    /*
    |--------------------------------------------------------------------------
    | Application Timezone
    |--------------------------------------------------------------------------
    |
    | Here you may specify the default timezone for your application, which
    | will be used by the PHP date and date-time functions. The timezone
    | is set to "UTC" by default as it is suitable for most use cases.
    |
    */

    'timezone' => 'UTC',

    /*
    |--------------------------------------------------------------------------
    | Admin Emails
    |--------------------------------------------------------------------------
    |
    | Comma-separated list of email addresses permitted to access the /admin
    | panel once authenticated.
    |
    */

    'admin_emails' => array_values(array_filter(array_map('trim', explode(',', (string) env('ADMIN_EMAILS'))))),

    // Starter password assigned to newly-created admin users by `php artisan admin:sync-users`.
    'admin_default_password' => env('ADMIN_DEFAULT_PASSWORD', '00000000'),

    /*
    |--------------------------------------------------------------------------
    | Prototype-Site Admin Emails
    |--------------------------------------------------------------------------
    |
    | Scoped access: these emails can only manage the prototype-site importer
    | (/admin/prototype-site) and never the rest of /admin (messages, prototype
    | inquiries, etc. carry real customer PII). Kept separate from admin_emails.
    |
    */

    'prototype_admin_emails' => array_values(array_filter(array_map('trim', explode(',', (string) env('PROTOTYPE_ADMIN_EMAILS'))))),

    /*
    |--------------------------------------------------------------------------
    | Admin Auth Method
    |--------------------------------------------------------------------------
    |
    | 'password': /admin/login is an email + password form (dev/preview, where
    | outbound mail may not be configured/reachable).
    | 'magic-link': /admin/login reuses the passwordless magic-link flow (real
    | production, where outbound mail is reliable).
    |
    | Deliberately NOT derived from APP_ENV — the preview host sets
    | APP_ENV=production for unrelated reasons (debug/error pages) but still
    | needs password auth, so this must be set explicitly per environment.
    |
    */

    'admin_auth_method' => env('ADMIN_AUTH_METHOD', 'password'),

    /*
    |--------------------------------------------------------------------------
    | Application Locale Configuration
    |--------------------------------------------------------------------------
    |
    | The application locale determines the default locale that will be used
    | by Laravel's translation / localization methods. This option can be
    | set to any locale for which you plan to have translation strings.
    |
    */

    'locale' => env('APP_LOCALE', 'en'),

    'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),

    'faker_locale' => env('APP_FAKER_LOCALE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Encryption Key
    |--------------------------------------------------------------------------
    |
    | This key is utilized by Laravel's encryption services and should be set
    | to a random, 32 character string to ensure that all encrypted values
    | are secure. You should do this prior to deploying the application.
    |
    */

    'cipher' => 'AES-256-CBC',

    'key' => env('APP_KEY'),

    'previous_keys' => [
        ...array_filter(
            explode(',', (string) env('APP_PREVIOUS_KEYS', ''))
        ),
    ],

    /*
    |--------------------------------------------------------------------------
    | Maintenance Mode Driver
    |--------------------------------------------------------------------------
    |
    | These configuration options determine the driver used to determine and
    | manage Laravel's "maintenance mode" status. The "cache" driver will
    | allow maintenance mode to be controlled across multiple machines.
    |
    | Supported drivers: "file", "cache", "array"
    |
    */

    'maintenance' => [
        'driver' => env('APP_MAINTENANCE_DRIVER', 'file'),
        'store' => env('APP_MAINTENANCE_STORE', 'database'),
    ],

];
