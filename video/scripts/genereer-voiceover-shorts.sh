#!/usr/bin/env bash
# Stem Pauline voor de vijf Shorts. Sleutel via de omgeving, of via video/.env.
# Gebruik: bash scripts/genereer-voiceover-shorts.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [ -z "${ELEVENLABS_API_KEY:-}" ]; then
  source .env
fi

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}"
MODEL="eleven_multilingual_v2"

genereer() {
  local map="$1"
  shift
  local uit="public/voiceover-shorts/$map"
  mkdir -p "$uit"
  local i=0
  for tekst in "$@"; do
    i=$((i + 1))
    echo "$map scène $i…"
    json=$(python3 -c "import json,sys; print(json.dumps({'text': sys.argv[1], 'model_id': sys.argv[2]}))" "$tekst" "$MODEL")
    http=$(curl -s -o "$uit/scene-$i.mp3" -w "%{http_code}" \
      -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID?output_format=mp3_44100_128" \
      -H "xi-api-key: $ELEVENLABS_API_KEY" \
      -H "Content-Type: application/json" \
      -d "$json")
    if [ "$http" != "200" ]; then
      echo "FOUT bij $map scène $i (HTTP $http)" >&2
      rm -f "$uit/scene-$i.mp3"
      exit 1
    fi
  done
}

genereer macht \
  "Hoe differentieer je drie x tot de vierde?" \
  "De machtsregel. Zo differentieer je een macht van x." \
  "De functie f van x is drie x tot de vierde." \
  "Haal de macht naar voren, en haal er één af." \
  "Vier keer drie is twaalf. Vier min één is drie." \
  "De afgeleide van f is twaalf x tot de derde." \
  "Oefen het zelf op afgeleideoefenen punt nl."

genereer ketting \
  "Hoe differentieer je, haakje twee x plus één, tot de derde?" \
  "Zit er een functie in een functie? Dan gebruik je de kettingregel." \
  "De functie f van x is, haakje twee x plus één, tot de derde. De binnenkant noemen we h van x. De buitenkant is g: tot de derde." \
  "Eerst de buitenkant. Drie keer, haakje twee x plus één, tot de tweede." \
  "Dan keer de afgeleide van h. Die is twee." \
  "De afgeleide van f is zes keer, haakje twee x plus één, tot de tweede." \
  "Oefen de kettingregel op afgeleideoefenen punt nl."

genereer product \
  "Hoe differentieer je x kwadraat, keer haakje drie x plus één?" \
  "Twee functies keer elkaar? Dan de productregel." \
  "De functie f van x is x kwadraat, keer haakje drie x plus één." \
  "g van x is x kwadraat. h van x is drie x plus één." \
  "De afgeleide van g is twee x. De afgeleide van h is drie." \
  "Twee x keer haakje drie x plus één, plus x kwadraat keer drie." \
  "Dat is negen x kwadraat plus twee x." \
  "Oefen de productregel op afgeleideoefenen punt nl."

genereer quotient \
  "Hoe differentieer je x, gedeeld door x plus één?" \
  "Een breuk van twee functies? Dan de quotiëntregel." \
  "De functie f van x is x, gedeeld door x plus één." \
  "g is de teller: x. h is de noemer: x plus één." \
  "In de teller staat een min. Eén keer x plus één, min x keer één. Dat is één." \
  "De noemer blijft h in het kwadraat. De afgeleide van f is één, gedeeld door haakje x plus één, in het kwadraat." \
  "Oefen de quotiëntregel op afgeleideoefenen punt nl."

genereer wortel \
  "Hoe differentieer je wortel x?" \
  "De afgeleide van een wortel. Schrijf hem eerst als een macht." \
  "De functie f van x is wortel x. Dat is x tot de macht een half. Dat geldt voor x groter dan nul." \
  "De machtsregel: een half, keer x tot de macht min een half." \
  "Terugschrijven geeft één, gedeeld door twee wortel x." \
  "Oefen wortels op afgeleideoefenen punt nl."

echo "Klaar."
