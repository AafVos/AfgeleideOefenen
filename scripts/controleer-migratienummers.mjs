/**
 * Vergelijkt de nummers van de bestanden in supabase/migrations/ met elkaar.
 * Twee migraties met hetzelfde nummer (bijvoorbeeld twee takken die allebei
 * op 0083 vertakt waren) botsen pas bij het registreren op de echte
 * database — `version` is daar de primary key. Deze controle vangt dat af
 * vóórdat een pull request groen wordt.
 *
 *   node scripts/controleer-migratienummers.mjs
 *
 * Geen git-conflict ontstaat hierbij, want de bestandsnamen verschillen; dus
 * "Botst met de doeltak" ziet dit niet. Alleen lezen: dit script draait geen
 * SQL en raakt geen database aan.
 *
 * Afsluitcodes:
 *   0  elk nummer komt maar één keer voor
 *   1  twee of meer bestanden delen een nummer, of een bestandsnaam is raar
 */
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const map = fileURLToPath(new URL('../supabase/migrations/', import.meta.url))

const bestanden = readdirSync(map)
  .filter((naam) => naam.endsWith('.sql'))
  .sort()

const perNummer = new Map()
for (const bestand of bestanden) {
  const deel = /^(\d+)_(.+)\.sql$/.exec(bestand)
  if (!deel) {
    console.error(`De bestandsnaam ${bestand} begint niet met een nummer gevolgd door een naam.`)
    process.exit(1)
  }
  const [, nummer] = deel
  const lijst = perNummer.get(nummer) ?? []
  lijst.push(bestand)
  perNummer.set(nummer, lijst)
}

const dubbel = [...perNummer.entries()].filter(([, lijst]) => lijst.length > 1)

if (dubbel.length === 0) {
  console.log('Elk migratienummer komt maar één keer voor.')
  process.exit(0)
}

console.error('Twee of meer migraties delen hetzelfde nummer:')
for (const [nummer, lijst] of dubbel) {
  console.error(`  ${nummer}: ${lijst.join(', ')}`)
}
console.error('Geef één ervan het eerstvolgende vrije nummer en hernoem het bestand.')
process.exit(1)
