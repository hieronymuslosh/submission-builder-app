#!/bin/zsh
set -euo pipefail

LOG="/Users/hieronymuslosh/.openclaw/workspace/logs/submissionbuilder-tunnel.err.log"

if [ ! -f "$LOG" ]; then
  echo "Log not found: $LOG" >&2
  echo "Is the launchd tunnel running?" >&2
  exit 1
fi

# Extract the most recent trycloudflare URL from the log
URL=$(tail -n 500 "$LOG" | grep -Eo 'https://[a-z0-9-]+\.trycloudflare\.com' | tail -n 1 || true)

if [ -z "${URL:-}" ]; then
  echo "No trycloudflare URL found in: $LOG" >&2
  exit 2
fi

echo "$URL"
