#!/usr/bin/env bash
# Genereert de voice-over voor de video "Uitleg bij #34 (H2)" via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-som34.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-som34"
mkdir -p "$UIT"

teksten=(
  "Deze uitlegvideo gaat over som vierendertig, uit hoofdstuk twee."
  "Stap nul: analyseer de buitenste schil. Kijk eerst naar de grote vorm. <break time=\"1.2s\" /> Je ziet een breuk. Boven de streep staat x min twee, en onder de streep staat x plus vijf. De breukstreep splitst de functie in twee delen. Dan gebruik je de quotiëntregel. <break time=\"1.1s\" /> Deze regel zie je hier."
  "Stap één: kies g en h. <break time=\"1.0s\" /> g is de teller, dus g is x min twee. En h is de noemer, dus h is x plus vijf. <break time=\"1.2s\" /> Stap twee: bereken de afgeleiden. De afgeleide van g is één, en de afgeleide van h is ook één. <break time=\"1.0s\" /> Stap drie: vul de formule in. Eerst schrijven we hem op: de afgeleide van f is, de afgeleide van g keer h, min, g keer de afgeleide van h, en dat alles gedeeld door h in het kwadraat. <break time=\"1.2s\" /> Dan vullen we in: één keer x plus vijf, min, x min twee keer één, gedeeld door x plus vijf in het kwadraat. Nu werken we de teller uit: x plus vijf, min x, plus twee. De x'en vallen tegen elkaar weg, en er blijft zeven over."
)

# SCENES=3 of SCENES=2,4 genereert alleen die fragmenten opnieuw (scheelt credits).
SCENES="${SCENES:-}"

for i in "${!teksten[@]}"; do
  n=$((i + 1))
  if [ -n "$SCENES" ] && [[ ",$SCENES," != *",$n,"* ]]; then
    continue
  fi
  echo "Scène $n…"
  json=$(python3 -c "import json,sys; print(json.dumps({'text': sys.argv[1], 'model_id': sys.argv[2]}))" "${teksten[$i]}" "$MODEL")
  http=$(curl -s -o "$UIT/scene-$n.mp3" -w "%{http_code}" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$json")
  if [ "$http" != "200" ]; then
    echo "FOUT bij scène $n (HTTP $http):" >&2
    cat "$UIT/scene-$n.mp3" >&2
    rm -f "$UIT/scene-$n.mp3"
    exit 1
  fi
done

echo "Klaar. Duur per fragment:"
for f in "$UIT"/scene-*.mp3; do
  echo "$f: $(afinfo "$f" | grep 'estimated duration' | awk '{print $3}')s"
done
