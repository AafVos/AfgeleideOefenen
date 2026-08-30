#!/usr/bin/env bash
# Genereert de zes voice-overfragmenten via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover"
mkdir -p "$UIT"

teksten=(
  "Hoi! In dit filmpje leer je wanneer je de som-productmethode kiest om een kwadratische vergelijking op te lossen."
  "Kijk eerst goed naar de vergelijking. Hier staat: x-kwadraat plus zeven x plus twaalf is nul. Er staat géén getal voor de x-kwadraat. Dan kan de som-productmethode!"
  "Nu zoek je twee getallen die keer elkaar twaalf zijn, én plus elkaar zeven. Eén keer twaalf? De som is dertien, dat klopt niet. Twee keer zes? Som is acht, ook niet. Drie keer vier is twaalf… en drie plus vier is zeven. Die is het!"
  "Dus je schrijft: x plus drie, keer x plus vier, is nul. De oplossingen zijn dan: x is min drie, óf x is min vier."
  "Maar soms lukt het niet. Kijk naar: x-kwadraat plus vijf x plus drie is nul. Eén keer drie is drie, maar de som is vier — en geen vijf. Er zijn geen gehele getallen die passen. Vind je geen mooie gehele getallen? Dan gebruik je gewoon de a-b-c-formule."
  "Samengevat. Stel jezelf twee vragen. Eén: staat er één, of niets, voor de x-kwadraat? Twee: zie je snel twee gehele getallen met het juiste product en de juiste som? Twee keer ja? Dan kies je som-product. Anders pak je de a-b-c-formule. Succes!"
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
