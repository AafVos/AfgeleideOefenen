#!/usr/bin/env bash
# Stem Pauline voor de vijf Shorts. Zie genereer-voiceover-shorts.py.
# SHORT=primitief BEATS=2 FORCE=1 bash scripts/genereer-voiceover-shorts.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
exec python3 scripts/genereer-voiceover-shorts.py
