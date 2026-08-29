#!/usr/bin/env bash
# Genereert de voice-over voor de video "Uitleg bij som 29" via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-som29.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-som29"
mkdir -p "$UIT"

teksten=(
  "Deze uitlegvideo gaat over som negenentwintig."
  "Stap nul: analyseer de vorm. In deze som werken we met q, in plaats van x. Maar dat maakt voor het differentiëren niets uit. <break time=\"1.3s\" /> Je ziet hier duidelijk dat de som uit twee delen bestaat. Het lijkt er dus op dat we de somregel gaan gebruiken. Maar let op: er zit geen q in het eerste deel, dus we hoeven alleen naar het tweede deel te kijken. De één strepen we door. Om het jezelf makkelijk te maken, schrijf je een term tussen haakjes tot de macht twee altijd op als: de term, keer zichzelf. Nu zie je twee termen tussen haakjes, met een keer-teken ertussen. En dan gebruiken we: de productregel!"
  "Hier zie je de productregel, en onze som, met de één al doorgestreept. We volgen drie stappen. Stap één: kies g en h. Bij ons zijn dat allebei: drie q kwadraat min twee. Stap twee: bereken de afgeleiden van g en h. Dat is allebei: zes q. Stap drie: vul de formule in. Eerst schrijven we hem uit: de afgeleide van m is nul, min, de afgeleide van g keer h, plus, g keer de afgeleide van h. Dan vullen we alles in: nul min, zes q keer drie q kwadraat min twee, plus, drie q kwadraat min twee, keer zes q. Dat zijn twee keer precies dezelfde termen, dus samen is dat: min twee keer zes q, keer drie q kwadraat min twee. En dan is de uitkomst: min twaalf q, keer drie q kwadraat min twee. Gelukt!"
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
