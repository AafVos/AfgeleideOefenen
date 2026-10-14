#!/usr/bin/env bash
# Rendert de vijf integraal-Shorts buiten de repo (niet in git, niet in iCloud).
set -euo pipefail
cd "$(dirname "$0")/.."
UIT="${SHORTS_UIT:-$HOME/Code/video-concepten/integraal/shorts}"
mkdir -p "$UIT"

npx remotion render ShortPrimitief "$UIT/primitieve-van-een-macht.mp4"
npx remotion render ShortSubstitutie "$UIT/substitutie.mp4"
npx remotion render ShortPartieel "$UIT/partieel-integreren.mp4"
npx remotion render ShortOppervlakte "$UIT/oppervlakte.mp4"
npx remotion render ShortArctan "$UIT/primitieve-arctan.mp4"

echo "Klaar in $UIT"
ls -lh "$UIT"/*.mp4
