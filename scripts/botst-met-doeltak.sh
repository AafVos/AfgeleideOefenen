#!/usr/bin/env bash
# Kijkt of HEAD botst met de doeltak, bijvoorbeeld origin/main.
#
# Afsluitcode 0: geen conflict. De tak mag best achterlopen; de controle in
# controle.yml draait dan op de samengevoegde versie.
# Afsluitcode 1: wel een conflict. De controle start dan helemaal niet.
# Elke andere code: het nakijken zelf mislukte.
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Gebruik: $0 <doeltak>, bijvoorbeeld origin/main" >&2
  exit 2
fi

basis="$1"

set +e
uitvoer=$(git merge-tree --write-tree --name-only HEAD "$basis" 2>&1)
code=$?
set -e

if [ "$code" -eq 0 ]; then
  achter=$(git rev-list --count "HEAD..$basis")
  if [ "$achter" -eq 0 ]; then
    echo "Deze tak botst niet met $basis."
  elif [ "$achter" -eq 1 ]; then
    echo "Deze tak loopt 1 commit achter op $basis, maar botst niet."
    echo "De controle draait op de samengevoegde versie."
  else
    echo "Deze tak loopt $achter commits achter op $basis, maar botst niet."
    echo "De controle draait op de samengevoegde versie."
  fi
  exit 0
fi

# Code 1 hoort een conflict te zijn. Een onbekende tak geeft op sommige
# git-versies óók 1, met een foutzin en zonder bestandsnamen. Dat is geen
# conflict: de controle mag daar niet "botst" van maken.
if [ "$code" -ne 1 ] || printf '%s\n' "$uitvoer" | grep -q 'not something we can merge\|^fatal:'; then
  echo "::error::Nakijken of de tak botst met $basis is mislukt."
  printf '%s\n' "$uitvoer"
  exit "$code"
fi

# Eerste regel is de tree-id. Daarna de bestandsnamen, tot de lege regel
# waar de conflicttekst begint.
bestanden=$(printf '%s\n' "$uitvoer" | awk '
  NR == 1 { next }
  NF == 0 { exit }
  { print }
')

echo "::error::Deze tak botst met $basis. Lint, types en de weg van een leerling starten niet zolang dat zo is. Voeg $basis samen of rebase erop, en duw opnieuw."
if [ -n "$bestanden" ]; then
  echo "Bestanden die botsen:"
  printf '%s\n' "$bestanden"
else
  echo "git merge-tree gaf geen bestandsnamen. Uitvoer:"
  printf '%s\n' "$uitvoer"
fi
exit 1
