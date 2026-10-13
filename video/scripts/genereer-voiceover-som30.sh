#!/usr/bin/env bash
# Genereert de voice-over voor de video "Uitleg bij som 30" via ElevenLabs.
# Letters: f, g en h, net als in het beeld. De sleutel komt uit de omgeving
# of uit video/.env. Opnieuw genereren kost ElevenLabs-tegoed.
# Gebruik: bash scripts/genereer-voiceover-som30.sh
#
# Gebruikt het with-timestamps-endpoint: naast scene-n.mp3 komt scene-n.json
# met per teken de starttijd (zie scripts/beats.py).
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -f .env ]; then
  # shellcheck disable=SC1091
  source .env
fi
if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
  echo "ELEVENLABS_API_KEY ontbreekt. Zet hem in de omgeving of in video/.env." >&2
  exit 1
fi

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-som30"
mkdir -p "$UIT"

teksten=(
  "Deze uitlegvideo gaat over som dertig, uit hoofdstuk twee."
  "Stap nul: analyseer de buitenste schil. Kijk eerst naar de grote vorm, voordat je je druk maakt om de details. <break time=\"1.3s\" /> Je ziet dat de som uit twee delen bestaat, gesplitst door het minteken. Links staat de vijf. En rechts staat: drie, keer x tot de vierde min x, keer x plus één. Twee delen met een minteken ertussen, en dan gebruiken we: de somregel. Die zie je hier."
  "Stap één: kies g en h. <break time=\"1.0s\" /> g is vijf. En h is: drie, keer x tot de vierde min x, keer x plus één. <break time=\"1.3s\" /> Stap twee: bereken de afgeleiden. De afgeleide van g is nul, want er zit geen x in. Voor h halen we eerst de drie naar binnen, bij de eerste factor. Dan staat er: drie x tot de vierde min drie x, keer x plus één. Dat is altijd handig om te doen. <break time=\"1.2s\" /> En kijk: nu hebben we twee losse factoren, met een keer-teken ertussen. Dus voor de afgeleide van h gebruiken we: de productregel!"
  "De functie van de vorige pagina noemen we hier f. <break time=\"1.0s\" /> Dus f is: drie x tot de vierde min drie x, keer x plus één. <break time=\"1.2s\" /> Stap één: g is drie x tot de vierde min drie x, en h is x plus één. Stap twee: de afgeleide van g is twaalf x tot de derde min drie, en de afgeleide van h is gewoon één. Stap drie: vul de formule in. Eerst schrijven we hem op: de afgeleide van f is: de afgeleide van g, keer h, plus, g, keer de afgeleide van h. Dan vullen we in: twaalf x tot de derde min drie, keer x plus één, plus, drie x tot de vierde min drie x, keer één. Nu werken we de haakjes weg: twaalf x tot de vierde, plus twaalf x tot de derde, min drie x, min drie, plus drie x tot de vierde, min drie x. En als we gelijksoortige termen samennemen, is de afgeleide van f: vijftien x tot de vierde, plus twaalf x tot de derde, min zes x, min drie."
  "Nu voegen we alles samen. Die afgeleide hoorde bij h, dus de afgeleide van h is vijftien x tot de vierde, plus twaalf x tot de derde, min zes x, min drie. <break time=\"1.0s\" /> De afgeleide van k is de afgeleide van g, min de afgeleide van h. Dat is: nul, min, vijftien x tot de vierde plus twaalf x tot de derde min zes x min drie. Let op: die min gaat over álle termen heen. En dan is de uitkomst: min vijftien x tot de vierde, min twaalf x tot de derde, plus zes x, plus drie."
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
  http=$(curl -s -o "$UIT/scene-$n.raw.json" -w "%{http_code}" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID/with-timestamps?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$json")
  if [ "$http" != "200" ]; then
    echo "FOUT bij scène $n (HTTP $http):" >&2
    # Alleen de fouttekst, nooit de sleutel.
    python3 -c "import sys; t=open(sys.argv[1],errors='replace').read(); print(t[:500])" "$UIT/scene-$n.raw.json" >&2
    rm -f "$UIT/scene-$n.raw.json"
    exit 1
  fi
  python3 - "$UIT/scene-$n" <<'PY'
import base64, json, sys
basis = sys.argv[1]
d = json.load(open(basis + '.raw.json'))
open(basis + '.mp3', 'wb').write(base64.b64decode(d['audio_base64']))
json.dump(d['alignment'], open(basis + '.json', 'w'), ensure_ascii=False)
PY
  rm -f "$UIT/scene-$n.raw.json"
done

echo "Klaar. Duur per fragment:"
for f in "$UIT"/scene-*.mp3; do
  echo "$f: $(afinfo "$f" | grep 'estimated duration' | awk '{print $3}')s"
done
