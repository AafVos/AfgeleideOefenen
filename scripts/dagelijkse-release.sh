#!/usr/bin/env bash
# Zet op een rij welke pull requests sinds de vorige datum-release op main
# zijn gemerged, en maakt daar een GitHub Release van.
#
# Elke merge op main staat meteen live. Deze release verandert daar niets aan:
# het is alleen het lijstje achteraf, met een datum-tag zoals v2026-10-13.
#
# Geen nieuwe commits sinds de vorige tag → geen release, afsluitcode 0.
# De tag van vandaag bestaat al → niets doen, afsluitcode 0.
# --droog toont wat er zou gebeuren en maakt niets aan.
set -euo pipefail

droog=0
if [ "${1:-}" = "--droog" ]; then
  droog=1
fi

# Nederlandse datum, ook als de runner op UTC staat. De tag is de dag waarop
# we de stand van main vastleggen.
datum_bestand=$(mktemp)
python3 -c '
from datetime import datetime
from zoneinfo import ZoneInfo
nu = datetime.now(ZoneInfo("Europe/Amsterdam"))
maanden = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
]
print(f"{nu.day} {maanden[nu.month - 1]} {nu.year}")
print(nu.strftime("%Y-%m-%d"))
' > "$datum_bestand"
titel_datum=$(sed -n '1p' "$datum_bestand")
tag="v$(sed -n '2p' "$datum_bestand")"
rm -f "$datum_bestand"

repo="${GITHUB_REPOSITORY:-}"
if [ -z "$repo" ]; then
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
fi
server="${GITHUB_SERVER_URL:-https://github.com}"

if gh release view "$tag" --repo "$repo" >/dev/null 2>&1; then
  echo "Release $tag bestaat al. Niets te doen."
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "Release \`$tag\` bestond al. Er is niets nieuws aangemaakt." >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi

# Alleen onze datum-tags. De archieftag hoort hier niet bij.
vorige_tag=$(gh release list --repo "$repo" --limit 30 --json tagName \
  --jq '[.[] | .tagName | select(test("^v[0-9]{4}-[0-9]{2}-[0-9]{2}$"))] | sort | last // empty')

git fetch --no-tags origin main
sha=$(git rev-parse origin/main)

onderwerpen=$(mktemp)
notities=$(mktemp)
fout=$(mktemp)
trap 'rm -f "$onderwerpen" "$notities" "$fout"' EXIT

# Geen --first-parent: main krijgt zijn werk via één samenvoeging per dag (de
# release van `volgende`), en langs de eerste ouder zie je daar alleen die ene
# regel van. We willen de pull requests die erin zaten. --no-merges laat de
# samenvoegingen zelf weg; wat overblijft zijn de squash-commits.
if [ -n "$vorige_tag" ]; then
  git fetch --no-tags origin "refs/tags/${vorige_tag}:refs/tags/${vorige_tag}"
  git log --no-merges --reverse --pretty=tformat:'%s' "${vorige_tag}..${sha}" > "$onderwerpen"
  eerste=0
else
  # Nog geen peildatum. Niet de hele geschiedenis: alleen het afgelopen etmaal,
  # en wel een tag op de huidige main, zodat de volgende ochtend daarvandaan telt.
  git log --no-merges --reverse --since='24 hours ago' --pretty=tformat:'%s' "$sha" > "$onderwerpen"
  eerste=1
fi

{
  echo "Elke merge op main staat meteen live. Deze release is alleen het lijstje achteraf."
  echo
  if [ "$eerste" -eq 1 ]; then
    echo "Dit is de eerste datum-release. Hieronder staat wat er in de afgelopen 24 uur op main is gemerged. Ouder werk staat er niet bij; vanaf deze tag tellen we verder."
  else
    echo "Dit is er sinds [$vorige_tag](${server}/${repo}/releases/tag/${vorige_tag}) bij gekomen."
  fi
  echo
} > "$notities"

aantal=0
while IFS= read -r subject || [ -n "$subject" ]; do
  [ -z "$subject" ] && continue
  aantal=$((aantal + 1))

  if printf '%s\n' "$subject" | grep -Eq ' \(#[0-9]+\)[[:space:]]*$'; then
    nummer=$(printf '%s\n' "$subject" | sed -E 's/.* \(#([0-9]+)\)[[:space:]]*$/\1/')
    kop=$(printf '%s\n' "$subject" | sed -E 's/ \(#[0-9]+\)[[:space:]]*$//')
    printf -- '- %s (#%s)\n' "$kop" "$nummer" >> "$notities"
  else
    printf -- '- %s\n' "$subject" >> "$notities"
  fi
done < "$onderwerpen"

if [ "$aantal" -eq 0 ] && [ "$eerste" -eq 0 ]; then
  echo "Geen nieuwe commits sinds $vorige_tag. Geen release gemaakt."
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "Geen nieuwe commits sinds \`$vorige_tag\`. Geen release gemaakt." >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi

if [ "$aantal" -eq 0 ]; then
  echo "In de afgelopen 24 uur is er niets gemerged." >> "$notities"
fi

echo
echo "Tag: $tag"
echo "Commit: $sha"
echo "Regels: $aantal"
echo
cat "$notities"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "## $titel_datum"
    echo
    echo "Tag \`$tag\` op \`${sha:0:7}\`."
    echo
    cat "$notities"
  } >> "$GITHUB_STEP_SUMMARY"
fi

if [ "$droog" -eq 1 ]; then
  echo
  echo "Droog: release $tag is niet aangemaakt."
  exit 0
fi

if ! gh release create "$tag" \
  --repo "$repo" \
  --target "$sha" \
  --title "$titel_datum" \
  --notes-file "$notities" \
  2>"$fout"; then
  # Twee runs tegelijk: de ander was eerst klaar. Dat is geen fout.
  if gh release view "$tag" --repo "$repo" >/dev/null 2>&1; then
    echo "Release $tag is intussen aangemaakt."
    exit 0
  fi
  cat "$fout" >&2
  exit 1
fi

echo "Release $tag aangemaakt: ${server}/${repo}/releases/tag/${tag}"
