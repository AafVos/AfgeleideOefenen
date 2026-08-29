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
  "Stap nul: analyseer de vorm. We werken hier met q, in plaats van x. Maar dat maakt voor het differentiëren niets uit. <break time=\"1.3s\" /> Je ziet dat de som uit twee delen bestaat, met een minteken ertussen. En dan gebruiken we: de somregel. Die zie je hier."
  "Stap één: kies g en h. g van q is één. En h van q is: min, drie q kwadraat min twee, in het kwadraat. Stap twee: bereken de afgeleiden. De afgeleide van g is nul, want er zit geen q in. Voor h schrijven we het kwadraat eerst anders op: als de term, keer zichzelf. Dat is altijd handig om te doen. En kijk: nu staat er een product. Dus voor de afgeleide van h gebruiken we de productregel!"
  "Hier zie je de productregel, en onze h. Stap één: kies g en h. g van q is drie q kwadraat min twee, en h van q is óók drie q kwadraat min twee. Stap twee: de afgeleide van g is zes q, en de afgeleide van h is zes q. Stap drie: vul de formule in. Let op: de min blijft er gewoon voor staan. Samen is dat: min twee keer zes q, keer drie q kwadraat min twee. En dan is de afgeleide van h: min twaalf q, keer drie q kwadraat min twee."
  "Nu voegen we alles samen. De afgeleide van m, is de afgeleide van g, plus de afgeleide van h. Dat is: nul, min twaalf q keer drie q kwadraat min twee. En dat geeft de uitkomst: min twaalf q, keer drie q kwadraat min twee. Gelukt!"
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
