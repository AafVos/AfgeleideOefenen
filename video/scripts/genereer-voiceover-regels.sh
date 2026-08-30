#!/usr/bin/env bash
# Genereert de voice-over voor de video "Somregel of productregel?" via ElevenLabs.
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-regels.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-regels"
mkdir -p "$UIT"

teksten=(
  "Hoi, in dit filmpje leer je wanneer je bij differentiëren de somregel gebruikt, en wanneer de productregel."
  "Kijk altijd eerst hoe de functie in elkaar zit. Zijn de stukken aan elkaar geplakt met een plus of een min? Dan gebruik je de somregel. Worden twee stukken met x keer elkaar gedaan? Dan pak je de productregel."
  "De somregel. Als je f kunt opsplitsen in twee delen, g en h, met een plusteken ertussen, dan mag je de afgeleide van g, en de afgeleide van h, apart uitrekenen. En die tel je daarna weer bij elkaar op. Kijk naar f van x is x tot de derde, plus vijf x kwadraat. Hier kun je dus zeggen: g van x is x tot de derde, en h van x is vijf x kwadraat. Bereken nu de afgeleiden van beide. De afgeleide van g is drie x kwadraat. En de afgeleide van h is tien x. En zoals in de somregel staat, mogen we die nu gewoon bij elkaar optellen: de afgeleide van f is drie x kwadraat, plus tien x."
  "De productregel. Deze gebruik je als er twee stukken met x keer elkaar staan. De regel zegt: als f het product is van g en h, dan is de afgeleide van f: de afgeleide van g, keer h, plus g, keer de afgeleide van h. Kijk naar het voorbeeld: hier is g van x gelijk aan x kwadraat min vier, en h van x is x tot de derde plus twee x. We hebben dus de afgeleide van zowel g als h nodig. Links: g is x kwadraat min vier. Kijk eens goed: dat is gewoon een som! Dus daar gebruik je de somregel: de afgeleide van g is twee x. Rechts: h is x tot de derde plus twee x. Óók een som, dus ook hier de somregel: de afgeleide van h is drie x kwadraat plus twee. Binnen de productregel gebruik je de somregel dus gewoon opnieuw. Alles invullen, en klaar!"
  "Samengevat. Zijn de stukken geplakt met plus of min? Dan gebruik je de somregel: differentieer term voor term, en tel op. Staan er twee stukken met x keer elkaar? Dan pak je de productregel. Succes!"
)

# SCENES=1 of SCENES=1,3 genereert alleen die fragmenten opnieuw (scheelt credits).
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
