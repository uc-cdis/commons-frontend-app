#!/bin/sh
set -e
echo "Starting Next.js standalone server"
echo "Working directory: $(pwd)"
echo "Config directory check:"

NODE_ENV=production
PORT=3000
NEXT_TELEMETRY_DISABLED=1
HOSTNAME=0.0.0.0
ls -la config/gen3/ 2>/dev/null || echo "Config not yet mounted"

exec node .next/standalone/server.js
