#!/bin/bash
set -e

# Kill any previous processes on our ports
pkill -f "pnpm.*api-server" 2>/dev/null || true
pkill -f "pnpm.*tradevision" 2>/dev/null || true
sleep 1

# Start API server in background on port 3000
PORT=3000 pnpm --filter @workspace/api-server dev &
API_PID=$!

# Start Vite frontend on port 5000 (required for Replit webview)
PORT=5000 BASE_PATH=/ API_PORT=3000 pnpm --filter @workspace/tradevision dev &
VITE_PID=$!

# Forward SIGTERM to children
trap "kill $API_PID $VITE_PID 2>/dev/null; exit 0" SIGTERM SIGINT

# Wait for both
wait $VITE_PID
