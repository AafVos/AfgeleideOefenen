#!/usr/bin/env bash
# Genereert de voice-over voor de video "Machten en wortels herschrijven".
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-herschrijven.sh
#
# Gebruikt het with-timestamps-endpoint: naast scene-n.mp3 komt scene-n.json met
# per teken de starttijd. Zo kun je de beats in scenes-herschrijven.tsx precies
# op een woord leggen (zie scripts/beats.py).
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-herschrijven"
mkdir -p "$UIT"

teksten=(
  "Deze video gaat over machten en wortels herschrijven."
  "Dit is de machtsregel: de afgeleide van a x tot de n, is n keer a x tot de n min één. <break time=\"1.0s\" /> Maar die regel kun je pas gebruiken als er echt x tot een macht staat. <break time=\"0.8s\" /> Staat de x in de noemer, of onder een wortel? Dan schrijf je hem eerst om tot een macht van x. <break time=\"1.0s\" /> Eén gedeeld door x tot de n, is x tot de min n. <break time=\"1.0s\" /> De wortel van x, is x tot de macht een half. <break time=\"1.0s\" /> En de n-de machtswortel van x tot de m, is x tot de macht m gedeeld door n."
  "Ook hier volg je het vaste stappenplan. <break time=\"0.8s\" /> Stap nul: analyseer de buitenste schil. Staat er alleen x in de noemer, of alleen x onder de wortel? Dan ga je herschrijven. <break time=\"1.0s\" /> Stap één: schrijf de functie als macht van x. <break time=\"1.0s\" /> Stap twee: pas de machtsregel toe. <break time=\"1.0s\" /> En stap drie: schrijf het antwoord terug, zonder negatieve of gebroken exponent."
  "We beginnen met f van x is zes gedeeld door x tot de derde. <break time=\"1.0s\" /> Stap nul: in de noemer staat alleen x tot de derde. Dus: herschrijven! <break time=\"1.0s\" /> Stap één: zes gedeeld door x tot de derde, is zes x tot de min drie. <break time=\"1.0s\" /> Stap twee: de machtsregel. De exponent min drie komt ervoor, en de nieuwe exponent is min drie min één, dus min vier. Min drie keer zes is min achttien. <break time=\"1.0s\" /> Stap drie: schrijf terug. x tot de min vier zet je weer in de noemer, als x tot de vierde. De afgeleide is min achttien gedeeld door x tot de vierde."
  "Nu een met een wortel: f van x is x keer de wortel van x. <break time=\"1.0s\" /> Stap nul: onder de wortel staat alleen x. Dus ook hier: herschrijven! <break time=\"1.0s\" /> Stap één: de wortel van x is x tot de macht een half, en x zelf is x tot de eerste. Bij keer tel je de exponenten op: één plus een half is drie halve. Dus f van x is x tot de macht drie halve. <break time=\"1.0s\" /> Stap twee: de machtsregel. Drie halve komt ervoor, en de exponent wordt drie halve min één, dus een half. <break time=\"1.0s\" /> Stap drie: schrijf terug. x tot de macht een half is de wortel van x. De afgeleide is anderhalf keer de wortel van x."
  "Samengevat. <break time=\"0.6s\" /> Eén: staat er alleen x in de noemer of onder de wortel? Schrijf het als macht van x. <break time=\"0.8s\" /> Twee: pas de machtsregel toe. <break time=\"0.8s\" /> Drie: schrijf het antwoord terug, zonder negatieve of gebroken exponent. <break time=\"1.0s\" /> Let op: staat er onder de wortel meer dan alleen x, zoals x kwadraat plus één? Dan is het de kettingregel. <break time=\"0.8s\" /> Succes!"
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
  http=$(curl -s -o "$UIT/scene-$n.raw.json" -w "%{http_code}" \
    -X POST "https://api.elevenlabs.io/v1/text-to-speech/$VOICE_ID/with-timestamps?output_format=mp3_44100_128" \
    -H "xi-api-key: $ELEVENLABS_API_KEY" \
    -H "Content-Type: application/json" \
    -d "$json")
  if [ "$http" != "200" ]; then
    echo "FOUT bij scène $n (HTTP $http):" >&2
    cat "$UIT/scene-$n.raw.json" >&2
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
