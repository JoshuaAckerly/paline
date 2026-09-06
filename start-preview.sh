#!/usr/bin/env bash
# Builds the preview assets and refreshes the systemd-managed preview stack.
# The real preview is served by paline-preview.service (127.0.0.1:8091) and
# exposed publicly via paline-preview-tunnel.service -> EC2 -> oauth2-proxy at
# https://paline-preview.graveyardjokes.com/ (see deploy/*.service).

set -Eeuo pipefail

cd "$(dirname "$0")"

readonly PREVIEW_URL="https://paline-preview.graveyardjokes.com"
readonly APP_PORT=8091

echo "Building Paline preview assets..."
rm -f public/hot
npm run build

echo "Restarting paline-preview.service..."
systemctl --user restart paline-preview.service

curl --silent --show-error --fail \
    --retry 20 --retry-delay 1 --retry-connrefused \
    "http://127.0.0.1:${APP_PORT}/up" >/dev/null

if ! systemctl --user is-active --quiet paline-preview-tunnel.service; then
    echo "WARNING: paline-preview-tunnel.service is not active; public preview may be unreachable." >&2
    echo "  Check with: systemctl --user status paline-preview-tunnel.service" >&2
fi

echo "Paline preview: $PREVIEW_URL"
echo "Allowed Google account: info@palineofficial.com"