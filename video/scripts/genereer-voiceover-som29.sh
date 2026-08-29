#!/usr/bin/env bash
# Genereert de voice-over voor de video "Uitleg bij som 29" via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-som29.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-OlBRrVAItyi00MuGMbna}" # Emma (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-som29"
mkdir -p "$UIT"

teksten=(
  "Deze uitlegvideo gaat over som negenentwintig."
  "In deze som werken we met q, in plaats van x. Maar dat maakt voor het differentiëren niets uit. Je ziet hier duidelijk dat de som uit twee delen bestaat. Het lijkt er dus op dat we de somregel gaan gebruiken. Maar let op: er zit geen q in het eerste deel, dus we hoeven alleen naar het tweede deel te kijken. De één strepen we door. Om het jezelf makkelijk te maken, schrijf je een term tussen haakjes tot de macht twee altijd op als: de term, keer zichzelf. Nu zie je twee termen tussen haakjes, met een keer-teken ertussen. En dan gebruiken we: de productregel!"
  "Hier zie je de productregel. Volg bij de productregel altijd deze drie stappen: kies g en h. Bepaal de afgeleiden. En vul de formule in. De regel staat er met x, maar bij ons is de variabele q. Dat werkt precies hetzelfde: we nemen de regel gewoon over, met q. Stap één: wat zijn bij ons g en h? Allebei: drie q kwadraat min twee. Stap twee: bepaal de afgeleiden. Allebei: zes q. Stap drie: vul de formule in. De doorgestreepte één wordt nul. Daarachter komt: de afgeleide van g, keer h, plus, g, keer de afgeleide van h. Vullen we alles in, dan staat er: nul min, zes q keer drie q kwadraat min twee, plus, drie q kwadraat min twee, keer zes q. En netjes uitgewerkt is dat: min twaalf q, keer drie q kwadraat min twee. Gelukt!"
)

for i in "${!teksten[@]}"; do
  n=$((i + 1))
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
