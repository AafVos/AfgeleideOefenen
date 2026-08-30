#!/usr/bin/env bash
# Genereert de voice-over voor de video "Uitleg bij som 30" via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-som30.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-som30"
mkdir -p "$UIT"

teksten=(
  "Deze uitlegvideo gaat over som dertig, uit hoofdstuk twee."
  "Stap nul: analyseer de buitenste schil. Kijk eerst naar de grote vorm, voordat je je druk maakt om de details. <break time=\"1.3s\" /> Je ziet dat de som uit twee delen bestaat, gesplitst door het minteken. Links staat de vijf. En rechts staat: drie, keer x tot de vierde min x, keer x plus één. Twee delen met een minteken ertussen, en dan gebruiken we: de somregel. Die zie je hier."
  "Stap één: kies u en v. <break time=\"1.0s\" /> u is vijf. En v is: drie, keer x tot de vierde min x, keer x plus één. <break time=\"1.3s\" /> Stap twee: bereken de afgeleiden. De afgeleide van u is nul, want er zit geen x in. Voor v halen we eerst de drie naar binnen, bij de eerste factor. Dan staat er: drie x tot de vierde min drie x, keer x plus één. Dat is altijd handig om te doen. <break time=\"1.2s\" /> En kijk: nu hebben we twee losse factoren, met een keer-teken ertussen. Dus voor de afgeleide van v gebruiken we: de productregel!"
  "Hier zie je de productregel, en onze v. Stap één: g is drie x tot de vierde min drie x, en h is x plus één. Stap twee: de afgeleide van g is twaalf x tot de derde min drie, en de afgeleide van h is gewoon één. Stap drie: vul de formule in. Eerst schrijven we hem op: de afgeleide van v is: de afgeleide van g, keer h, plus, g, keer de afgeleide van h. Dan vullen we in: twaalf x tot de derde min drie, keer x plus één, plus, drie x tot de vierde min drie x, keer één. Nu werken we de haakjes weg: twaalf x tot de vierde, plus twaalf x tot de derde, min drie x, min drie, plus drie x tot de vierde, min drie x. En als we gelijksoortige termen samennemen, is de afgeleide van v: vijftien x tot de vierde, plus twaalf x tot de derde, min zes x, min drie."
  "Nu voegen we alles samen. De afgeleide van k, is de afgeleide van u, min de afgeleide van v. Dat is: nul, min, vijftien x tot de vierde plus twaalf x tot de derde min zes x min drie. Let op: die min gaat over álle termen heen. En dan is de uitkomst: min vijftien x tot de vierde, min twaalf x tot de derde, plus zes x, plus drie."
)

# SCENES=5 of SCENES=2,5 genereert alleen die fragmenten opnieuw (scheelt credits).
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
