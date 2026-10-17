#!/usr/bin/env bash
# Maakt (of werkt bij) de pull request die `volgende` naar `main` brengt.
#
# Gewoon werk gaat naar `volgende`. Eén keer per dag gaat alles wat daar staat
# in één pull request naar `main`, en die zet Aaf zelf live. Dit script maakt
# die pull request en schrijft de tekst erbij: wat er in zit, welke migraties,
# en waar je het kunt bekijken.
#
# Staat `volgende` niet voor op `main` → niets te doen, afsluitcode 0.
# Staat de pull request al open → alleen de tekst bijwerken, titel blijft.
# --droog toont de tekst en verandert niets.
set -euo pipefail

droog=0
if [ "${1:-}" = "--droog" ]; then
  droog=1
fi

repo="${GITHUB_REPOSITORY:-}"
if [ -z "$repo" ]; then
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
fi
server="${GITHUB_SERVER_URL:-https://github.com}"

# Er staat hier bewust geen link naar een voorbeeldversie van `volgende`.
# <tak>-<worker>.<account>.workers.dev geeft 404 zolang de bouw van
# niet-productietakken bij Workers Builds faalt. Zie "Er is geen
# voorbeeldversie van `volgende`" in AGENTS.md.

# Nederlandse datum, ook als de runner op UTC staat.
titel_datum=$(python3 -c '
from datetime import datetime
from zoneinfo import ZoneInfo
nu = datetime.now(ZoneInfo("Europe/Amsterdam"))
maanden = [
    "januari", "februari", "maart", "april", "mei", "juni",
    "juli", "augustus", "september", "oktober", "november", "december",
]
print(f"{nu.day} {maanden[nu.month - 1]} {nu.year}")
')
titel="Release $titel_datum"

git fetch --no-tags origin main volgende
basis=$(git rev-parse origin/main)
top=$(git rev-parse origin/volgende)

aantal=$(git rev-list --count "$basis..$top")
if [ "$aantal" -eq 0 ]; then
  echo "volgende staat niet voor op main. Geen release-pull-request nodig."
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "\`volgende\` staat niet voor op \`main\`. Er is niets om uit te brengen." >> "$GITHUB_STEP_SUMMARY"
  fi
  exit 0
fi

zichtbaar=$(mktemp)
motorkap=$(mktemp)
migraties=$(mktemp)
regels=$(mktemp)
tekst=$(mktemp)
trap 'rm -f "$zichtbaar" "$motorkap" "$migraties" "$regels" "$tekst"' EXIT

# Wat een leerling niet kan zien. Blijft er na deze paden niets over, dan valt
# de wijziging onder "Onder de motorkap". Alles wat hier niet op staat — ook
# een migratie met nieuwe opgaven — telt als zichtbaar, want bij twijfel hoort
# Aaf er zelf naar te kijken.
onzichtbaar='^\.github/|^scripts/|^e2e/|^docs/|^content-bron/|\.md$|\.test\.tsx?$|^supabase/config\.toml$|^supabase/seed\.sql$|^package(-lock)?\.json$|^tsconfig[^/]*\.json$|^eslint\.config\.|^vitest\.config\.|^playwright\.config\.|^wrangler\.jsonc$|^open-next\.config\.ts$|^\.nvmrc$|^\.gitignore$|^\.dev\.vars\.example$'

git log --reverse --pretty=tformat:'%H%x09%s' "$basis..$top" > "$regels"

while IFS=$'\t' read -r sha onderwerp || [ -n "${sha:-}" ]; do
  [ -z "${sha:-}" ] && continue

  # Een samenvoeging van main in volgende (de weg terug na een kritieke fix)
  # brengt niets nieuws: die commits staan al op main.
  case "$onderwerp" in
    "Merge branch "*|"Merge remote-tracking "*) continue ;;
  esac

  nummer=""
  if printf '%s\n' "$onderwerp" | grep -Eq ' \(#[0-9]+\)[[:space:]]*$'; then
    nummer=$(printf '%s\n' "$onderwerp" | sed -E 's/.* \(#([0-9]+)\)[[:space:]]*$/\1/')
  elif printf '%s\n' "$onderwerp" | grep -Eq '^Merge pull request #[0-9]+'; then
    nummer=$(printf '%s\n' "$onderwerp" | sed -E 's/^Merge pull request #([0-9]+).*/\1/')
  fi

  kop=$(printf '%s\n' "$onderwerp" | sed -E 's/ \(#[0-9]+\)[[:space:]]*$//')
  ticket=""
  if [ -n "$nummer" ]; then
    gegevens=$(gh pr view "$nummer" --repo "$repo" --json title,headRefName \
      --jq '[.title, .headRefName] | @tsv' 2>/dev/null || true)
    if [ -n "$gegevens" ]; then
      kop=$(printf '%s\n' "$gegevens" | cut -f1)
      tak=$(printf '%s\n' "$gegevens" | cut -f2)
      ticket=$(printf '%s\n' "$tak" | grep -oE '^AFG-[0-9]+' || true)
    fi
  fi

  # De gewijzigde bestanden van deze commit. Bij een samenvoeging kijken we
  # naar wat er ten opzichte van de eerste ouder bij kwam.
  bestanden=$(git diff --name-only "${sha}^1" "$sha" 2>/dev/null || true)

  rest=$(printf '%s\n' "$bestanden" | grep -vE "$onzichtbaar" || true)
  if [ -n "$(printf '%s' "$rest" | tr -d '[:space:]')" ]; then
    doel="$zichtbaar"
  else
    doel="$motorkap"
  fi

  regel="- $kop"
  if [ -n "$nummer" ]; then
    regel="$regel ([#$nummer](${server}/${repo}/pull/${nummer}))"
  fi
  if [ -n "$ticket" ]; then
    regel="$regel — $ticket"
  fi
  printf '%s\n' "$regel" >> "$doel"
done < "$regels"

git diff --name-status --diff-filter=A "$basis" "$top" -- supabase/migrations/ \
  | cut -f2 > "$migraties"

# Zonder de verplichte controles op deze stand van `volgende` kan de release
# niet gemerged worden. Normaal staan ze er: controle.yml draait ook bij een
# push op `volgende`. Is zo'n run afgebroken of nooit gestart, dan niet.
ontbreekt=""
for controle in "Lint en typecontrole" "Weg van een leerling"; do
  gevonden=$(gh api "repos/${repo}/commits/${top}/check-runs?per_page=100" \
    --jq "[.check_runs[] | select(.name == \"$controle\")] | length" 2>/dev/null || echo 0)
  if [ "${gevonden:-0}" -eq 0 ]; then
    ontbreekt="${ontbreekt}${controle}, "
  fi
done
ontbreekt="${ontbreekt%, }"

{
  echo "> **Merge met \"Create a merge commit\", niet met squash.**"
  echo "> Squash maakt één nieuwe commit op \`main\`, en dan kent \`volgende\` die"
  echo "> niet. De takken lopen daarna uit elkaar en elke volgende release zit"
  echo "> vol met wat al live staat."
  echo
  echo "Dit is de release van $titel_datum: alles wat sinds de vorige release op"
  echo "\`volgende\` is gemerged, gaat hiermee in één keer naar \`main\` en dus live."
  echo

  if [ -s "$zichtbaar" ]; then
    echo "## Zichtbaar voor leerlingen"
    echo
    cat "$zichtbaar"
    echo
  fi

  if [ -s "$motorkap" ]; then
    echo "## Onder de motorkap"
    echo
    cat "$motorkap"
    echo
  fi

  if [ ! -s "$zichtbaar" ] && [ ! -s "$motorkap" ]; then
    echo "## Wat erin zit"
    echo
    echo "Alleen samenvoegingen van \`main\` terug in \`volgende\`. Er is niets nieuws."
    echo
  fi

  echo "## Migraties"
  echo
  if [ -s "$migraties" ]; then
    while IFS= read -r bestand; do
      [ -z "$bestand" ] && continue
      echo "- \`$bestand\`"
    done < "$migraties"
    echo
    echo "De ontwikkelaar zet ze na de merge zelf op de database."
  else
    echo "Geen migraties in deze release."
  fi
  echo

  if [ -n "$ontbreekt" ]; then
    echo "> [!WARNING]"
    echo "> Op deze stand van \`volgende\` ontbreekt: $ontbreekt."
    echo "> Zonder die controles kan deze pull request niet gemerged worden."
    echo "> Laat een ontwikkelaar \`gh workflow run controle.yml --ref volgende\`"
    echo "> draaien, dan komen ze alsnog."
    echo
  fi

  echo "## Even nalopen"
  echo
  echo "- [ ] Wat hierboven onder \"Zichtbaar voor leerlingen\" staat, klopt met wat je verwacht."
  echo "- [ ] De verplichte controles zijn groen."
  echo "- [ ] Mergen met **Create a merge commit**."
  echo
  echo "<sub>Automatisch gemaakt en bijgewerkt door \`.github/workflows/release-pr.yml\`.</sub>"
} > "$tekst"

echo "Titel: $titel"
echo "Commits: $aantal ($(git rev-parse --short "$basis") → $(git rev-parse --short "$top"))"
echo
cat "$tekst"

if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
  {
    echo "## $titel"
    echo
    cat "$tekst"
  } >> "$GITHUB_STEP_SUMMARY"
fi

if [ "$droog" -eq 1 ]; then
  echo
  echo "Droog: er is geen pull request gemaakt of bijgewerkt."
  exit 0
fi

nummer=$(gh pr list --repo "$repo" --base main --head volgende --state open \
  --json number --jq '.[0].number // empty')

if [ -n "$nummer" ]; then
  echo
  echo "Pull request #$nummer staat al open; alleen de tekst bijwerken."
  gh pr edit "$nummer" --repo "$repo" --body-file "$tekst"
else
  nummer=$(gh pr create --repo "$repo" \
    --base main --head volgende \
    --title "$titel" --body-file "$tekst" \
    | sed -E 's#.*/pull/([0-9]+).*#\1#')
  echo
  echo "Pull request #$nummer aangemaakt."
fi

echo "${server}/${repo}/pull/${nummer}"
