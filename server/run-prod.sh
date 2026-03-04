#!/bin/zsh
set -euo pipefail

cd /Users/hieronymuslosh/.openclaw/workspace/submission-builder-app

# Load APP_PASSWORD from .env if present
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi

if [ -z "${APP_PASSWORD:-}" ]; then
  echo "APP_PASSWORD is not set. Create .env with APP_PASSWORD=..." >&2
  exit 1
fi

exec /opt/homebrew/bin/node server/prod.js
