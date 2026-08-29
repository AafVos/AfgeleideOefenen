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
  "Hoi! Eén van jullie vroeg om uitleg bij som negenentwintig. Goede keuze, want in deze som komt alles samen. We gaan differentiëren: m van q, is één min, drie q kwadraat min twee, in het kwadraat."
  "Kijk eerst goed naar de functie. Twee dingen vallen op. Eén: de variabele is hier geen x, maar q. Dat verandert niets aan de regels — je differentieert gewoon naar q. Twee: er staat een kwadraat. En een kwadraat is stiekem een product: drie q kwadraat min twee, keer, drie q kwadraat min twee. Dus, je voelt hem al: de productregel!"
  "We pakken het rustig aan, stukje voor stukje. Links: de losse één vooraan. Een getal heeft afgeleide nul, dus die valt straks gewoon weg. Rechts: de twee stukken van het product. Die zijn allebei hetzelfde: g van q is drie q kwadraat min twee. En de afgeleide daarvan is zes q."
  "Nu de productregel op het kwadraat. De regel zegt: de afgeleide van g keer g, is: de afgeleide van g, keer g, plus, g, keer de afgeleide van g. Vullen we dat in, dan krijgen we: zes q keer drie q kwadraat min twee, plus, drie q kwadraat min twee, keer zes q. Maar kijk eens goed: die twee termen zijn precies hetzelfde! Dus samen wordt het: twee keer zes q, keer drie q kwadraat min twee."
  "Bijna klaar. Voor het kwadraat stond nog een minteken, en dat moet mee. De afgeleide van m wordt dus: min twee keer zes q, keer drie q kwadraat min twee. En netjes uitgewerkt is dat: min twaalf q, keer drie q kwadraat min twee. Gelukt!"
  "Samengevat. Eén: check de variabele — hier is dat q, geen x. Twee: een kwadraat is een product, dus je gebruikt de productregel. Drie: een los getal valt weg bij het differentiëren. En vier: staat er een min voor? Vergeet die niet mee te nemen. Succes!"
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
