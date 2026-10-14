#!/usr/bin/env bash
# Rendert de vijf Shorts (1080×1920) naar out/shorts/.
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p out/shorts
npx remotion render ShortPrimitief out/shorts/primitieve-van-een-macht.mp4
npx remotion render ShortSubstitutie out/shorts/substitutie.mp4
npx remotion render ShortPartieel out/shorts/partieel-integreren.mp4
npx remotion render ShortOppervlakte out/shorts/oppervlakte.mp4
npx remotion render ShortArctan out/shorts/primitieve-arctan.mp4
echo "Klaar: out/shorts/"
