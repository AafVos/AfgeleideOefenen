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
  "Deze uitlegvideo gaat over som negenentwintig, uit hoofdstuk twee."
  "Stap nul: analyseer de buitenste schil. We werken hier met q, in plaats van x. Maar dat maakt voor het differentiëren niets uit. <break time=\"1.3s\" /> Je ziet dat de som uit twee delen bestaat, gesplitst door het minteken. En dan gebruiken we de somregel. <break time=\"1.1s\" /> Deze regel zie je hier."
  "Stap één: kies g en h. <break time=\"1.0s\" /> g is één. En h is: drie q kwadraat min twee, in het kwadraat. <break time=\"1.3s\" /> Stap twee: bereken de afgeleiden. De afgeleide van g is nul, want er zit geen q in. <break time=\"1.2s\" /> Voor h schrijven we het kwadraat eerst anders op: als de term keer zichzelf. Dat is altijd handig om te doen. <break time=\"1.2s\" /> Kijk: nu staan er twee delen met een keer-teken ertussen. Dus voor de afgeleide van h gebruiken we de productregel."
  "De functie van de vorige pagina noemen we hier f. <break time=\"1.0s\" /> Dus f is: drie q kwadraat min twee, keer drie q kwadraat min twee. <break time=\"1.2s\" /> Stap één: g is drie q kwadraat min twee, en h is óók drie q kwadraat min twee. Stap twee: de afgeleide van g is zes q, en de afgeleide van h is zes q. Stap drie: vul de formule in. Eerst schrijven we hem op: de afgeleide van f is, de afgeleide van g keer h, plus, g keer de afgeleide van h. Dan vullen we in: zes q keer drie q kwadraat min twee, plus, drie q kwadraat min twee keer zes q. Samen is dat twee keer zes q, keer drie q kwadraat min twee. En dan is de afgeleide van f: twaalf q, keer drie q kwadraat min twee."
  "Nu voegen we alles samen. Die afgeleide hoorde bij h, dus de afgeleide van h is twaalf q keer drie q kwadraat min twee. <break time=\"1.0s\" /> De afgeleide van m is de afgeleide van g, min de afgeleide van h. Dat is nul, min twaalf q keer drie q kwadraat min twee. En dat geeft de uitkomst: min twaalf q, keer drie q kwadraat min twee."
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
