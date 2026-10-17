#!/usr/bin/env bash
# Zorgt dat alles wat op `main` staat ook in `volgende` zit.
#
# Normaal komt `main` uit `volgende` en is dit een fast-forward: niets aan de
# hand. Gaat er een kritieke fix rechtstreeks naar `main`, dan haalt dit
# script hem terug in `volgende`, zodat de volgende release hem niet weer
# weghaalt.
#
# Lukt samenvoegen niet, dan komt er een melding in Issues met de bestanden
# die botsen. De run blijft dan toch groen: een rode controle op `main` zegt
# niets over de commit die net gemerged is.
set -euo pipefail

repo="${GITHUB_REPOSITORY:-}"
if [ -z "$repo" ]; then
  repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
fi
melding_titel="main en volgende botsen"

zeg() {
  echo "$1"
  if [ -n "${GITHUB_STEP_SUMMARY:-}" ]; then
    echo "$1" >> "$GITHUB_STEP_SUMMARY"
  fi
}

git fetch --no-tags origin main volgende

if git merge-base --is-ancestor origin/main origin/volgende; then
  zeg "\`volgende\` bevat \`main\` al. Niets te doen."
  exit 0
fi

git config user.name "github-actions[bot]"
git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
git checkout -B volgende origin/volgende

if git merge --no-edit -m "Haal main terug in volgende" origin/main; then
  doorgeschoven=0
  if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
    doorgeschoven=1
  fi

  git push origin volgende
  nieuw=$(git rev-parse --short HEAD)

  if [ "$doorgeschoven" -eq 1 ]; then
    zeg "\`volgende\` is doorgeschoven naar \`main\` (\`$nieuw\`). Inhoudelijk verandert er niets."
  else
    zeg "\`main\` is samengevoegd in \`volgende\` (\`$nieuw\`)."
  fi

  nummer=$(gh issue list --repo "$repo" --state open --limit 100 --json number,title \
    --jq "[.[] | select(.title == \"$melding_titel\")][0].number // empty")
  if [ -n "$nummer" ]; then
    gh issue close "$nummer" --repo "$repo" \
      --comment "\`main\` zit weer in \`volgende\`. Automatisch gesloten."
  fi
  exit 0
fi

botsend=$(git diff --name-only --diff-filter=U || true)
git merge --abort || true

echo "::warning::main en volgende botsen. Zie de melding in Issues."
zeg "## \`main\` en \`volgende\` botsen"
zeg ""
zeg "De samenvoeging is teruggedraaid; \`volgende\` is niet veranderd."

melding=$(mktemp)
trap 'rm -f "$melding"' EXIT

{
  echo "Deze melding is automatisch gemaakt door de workflow **Terug naar volgende**."
  echo
  echo "Er staat iets op \`main\` wat niet in \`volgende\` past. Meestal is dat een"
  echo "kritieke fix die rechtstreeks naar \`main\` ging, terwijl \`volgende\` dezelfde"
  echo "regels anders heeft opgelost."
  echo
  echo "Zolang dit niet is opgelost, haalt de volgende release die fix weer weg."
  echo
  if [ -n "$botsend" ]; then
    echo "Bestanden die botsen:"
    echo
    echo '```'
    printf '%s\n' "$botsend"
    echo '```'
    echo
  fi
  echo "Zo trek je het recht:"
  echo
  echo '```bash'
  echo "git fetch origin"
  echo "git switch -c main-in-volgende origin/volgende"
  echo "git merge origin/main      # los de conflicten op"
  echo "git push -u origin main-in-volgende"
  echo "gh pr create --base volgende --title 'Haal main terug in volgende'"
  echo '```'
  echo
  echo "Laatste controle: [run ${GITHUB_RUN_ID:-?}](${GITHUB_SERVER_URL:-https://github.com}/${repo}/actions/runs/${GITHUB_RUN_ID:-})"
} > "$melding"

nummer=$(gh issue list --repo "$repo" --state open --limit 100 --json number,title \
  --jq "[.[] | select(.title == \"$melding_titel\")][0].number // empty")

if [ -n "$nummer" ]; then
  echo "Melding #$nummer staat al open; alleen de tekst bijwerken."
  gh issue edit "$nummer" --repo "$repo" --body-file "$melding"
else
  gh issue create --repo "$repo" --title "$melding_titel" --body-file "$melding"
fi
