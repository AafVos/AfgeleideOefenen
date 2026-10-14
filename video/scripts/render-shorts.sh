#!/usr/bin/env bash
# Rendert de vijf staande Shorts buiten de repo (niet in git, niet in iCloud).
set -euo pipefail
cd "$(dirname "$0")/.."
UIT="${SHORTS_UIT:-$HOME/Code/video-concepten/afgeleide/shorts}"
mkdir -p "$UIT"

npx remotion render ShortMacht "$UIT/machtsregel.mp4"
npx remotion render ShortKetting "$UIT/kettingregel.mp4"
npx remotion render ShortProduct "$UIT/productregel.mp4"
npx remotion render ShortQuotient "$UIT/quotientregel.mp4"
npx remotion render ShortWortel "$UIT/wortel.mp4"

echo "Klaar in $UIT"
ls -lh "$UIT"/*.mp4
