#!/bin/bash
# Start PA Line local dev servers
cd "$(dirname "$0")"

echo "Starting PA Line dev servers..."
echo "  Laravel: http://127.0.0.1:8091"
echo "  Vite:    http://127.0.0.1:8090"
echo ""
echo "Press Ctrl+C to stop both."

# Run both in parallel
trap 'kill %1 %2 2>/dev/null' EXIT
php artisan serve --port=8091 &
npm run dev
