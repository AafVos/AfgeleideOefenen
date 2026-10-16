#!/usr/bin/env bash
# Stem Pauline voor de vijf integraal-Shorts. Zie genereer-voiceover-integraal-shorts.py.
# SHORT=primitief BEATS=2 FORCE=1 bash scripts/genereer-voiceover-integraal-shorts.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${ELEVENLABS_API_KEY:-}" ] && [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
exec python3 scripts/genereer-voiceover-integraal-shorts.py
