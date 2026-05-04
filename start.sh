#!/usr/bin/env bash
set -euo pipefail

export PORT="${PORT:-10000}"
export AI_SERVICE_PORT="${AI_SERVICE_PORT:-5001}"
export AI_SERVICE_URL="${AI_SERVICE_URL:-http://127.0.0.1:${AI_SERVICE_PORT}}"
export EVIDENCE_UPLOAD_DIR="${EVIDENCE_UPLOAD_DIR:-/app/server/uploads}"

python3 -c "import nltk; nltk.download('punkt', quiet=True); nltk.download('punkt_tab', quiet=True); nltk.download('vader_lexicon', quiet=True)"

cd /app/ai-service
gunicorn --bind 127.0.0.1:${AI_SERVICE_PORT} app:app &
AI_PID=$!

cd /app/server
node server.js &
NODE_PID=$!

shutdown() {
  kill "${AI_PID}" "${NODE_PID}" 2>/dev/null || true
}

trap shutdown SIGTERM SIGINT

wait -n "${AI_PID}" "${NODE_PID}"
STATUS=$?
shutdown
wait || true
exit "${STATUS}"
