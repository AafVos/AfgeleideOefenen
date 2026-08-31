#!/usr/bin/env bash
# Genereert de voice-over voor de video "Het stappenplan bij de quotiëntregel".
# Gebruik: ELEVENLABS_API_KEY in video/.env, dan: bash scripts/genereer-voiceover-quotient.sh
set -euo pipefail
cd "$(dirname "$0")/.."
source .env

VOICE_ID="${VOICE_ID:-6UGZSawYvSTRIMHxH2uW}" # Pauline (native NL); wissel via VOICE_ID=...
MODEL="eleven_multilingual_v2"
UIT="public/voiceover-quotient"
mkdir -p "$UIT"

teksten=(
  "Deze video gaat over het stappenplan dat je volgt bij de quotiëntregel."
  "Hier zie je de quotiëntregel. <break time=\"1.2s\" /> Net als bij de somregel en de productregel volg je steeds hetzelfde stappenplan. <break time=\"1.0s\" /> Stap nul: analyseer de buitenste schil. Zie je een breuk? Dan pak je de quotiëntregel. <break time=\"1.2s\" /> Stap één: bepaal wat g en h zijn. <break time=\"1.1s\" /> Stap twee: bereken de afgeleiden van g en h. <break time=\"1.1s\" /> En stap drie: vul alles terug in de formule."
  "We doen het meteen op een voorbeeld. <break time=\"1.1s\" /> De buitenste schil is een breuk. <break time=\"1.0s\" /> Dus: de quotiëntregel!"
  "Stap één: kies g en h. <break time=\"1.0s\" /> g is de teller, dus g is twee x plus één. En h is de noemer, dus h is drie x min één. <break time=\"1.2s\" /> Stap twee: bereken de afgeleiden. De afgeleide van g is twee, en de afgeleide van h is drie. <break time=\"1.1s\" /> Stap drie: vul de formule in. Eerst schrijven we hem op: de afgeleide van f is, de afgeleide van g keer h, min, g keer de afgeleide van h, en dat alles gedeeld door h in het kwadraat. <break time=\"1.2s\" /> Dan vullen we in: twee keer drie x min één, min, twee x plus één keer drie, gedeeld door drie x min één in het kwadraat. <break time=\"1.2s\" /> Nu werken we de teller uit: zes x min twee, min zes x min drie. De zes x'en vallen tegen elkaar weg, en er blijft min vijf over."
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
