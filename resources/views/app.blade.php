<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="csrf-token" content="{{ csrf_token() }}" />
        <title inertia>PA Line</title>
        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        @inertiaHead
        {{-- Load Typekit async so it never blocks page render --}}
        <link rel="preconnect" href="https://use.typekit.net">
    </head>
    <body class="antialiased">
        @inertia
        <script>
            (function(){var l=document.createElement('link');l.rel='stylesheet';l.href='https://use.typekit.net/fih4tju.css';document.head.appendChild(l);})();
        </script>
    </body>
</html>
