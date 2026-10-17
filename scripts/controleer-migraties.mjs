/**
 * Vergelijkt de bestanden in supabase/migrations/ met de rijen in
 * supabase_migrations.schema_migrations op de echte database. Drukt alleen de
 * bestandsnamen af die daar nog niet in staan.
 *
 *   SUPABASE_DB_URL=... node scripts/controleer-migraties.mjs
 *
 * Alleen lezen: één select, verder niets. Deze database draagt de echte
 * accounts en voortgang van leerlingen.
 *
 * Afsluitcodes, net als `supabase config diff --exit-code`:
 *   0  alles wat in de repo staat, is ook gedraaid
 *   2  er ontbreekt minstens één migratie (de namen staan op stdout)
 *   1  de controle zelf ging mis (geen verbinding, tabel weg, rare bestandsnaam)
 */
import { execFileSync } from 'node:child_process'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const url = process.env.SUPABASE_DB_URL ?? ''

if (!url) {
  console.error(
    'Geen SUPABASE_DB_URL. Zonder verbindingsgegevens kan dit script niet nakijken wat er gedraaid is.',
  )
  process.exit(1)
}

/** Het wachtwoord apart, want psql drukt bij een fout soms losse stukken af. */
let wachtwoord = ''
try {
  wachtwoord = new URL(url).password
} catch {
  // Geen geldige URL; dan valt er ook geen wachtwoord uit te halen.
}

/**
 * Deze repo is openbaar, en het logboek van een run dus ook. Wat psql bij een
 * fout afdrukt kan de verbindingsgegevens bevatten; die halen we eruit.
 */
function schoon(tekst) {
  const zonderUrl = tekst
    .split(url)
    .join('<verbindingsgegevens weggelaten>')
    .replace(/postgres(ql)?:\/\/\S+/gi, '<verbindingsgegevens weggelaten>')

  if (!wachtwoord) return zonderUrl
  return zonderUrl.split(wachtwoord).join('<wachtwoord weggelaten>')
}

const map = fileURLToPath(new URL('../supabase/migrations/', import.meta.url))

const bestanden = readdirSync(map)
  .filter((naam) => naam.endsWith('.sql'))
  .sort()

const inRepo = []
for (const bestand of bestanden) {
  const deel = /^(\d+)_(.+)\.sql$/.exec(bestand)
  if (!deel) {
    console.error(`De bestandsnaam ${bestand} begint niet met een nummer gevolgd door een naam.`)
    console.error('Zo kan dit script niet nakijken of hij gedraaid is.')
    process.exit(1)
  }
  inRepo.push({ versie: deel[1], bestand })
}

if (inRepo.length === 0) {
  console.error('Geen enkel migratiebestand gevonden in supabase/migrations/.')
  process.exit(1)
}

let ruw
try {
  ruw = execFileSync(
    'psql',
    [
      url,
      '--no-psqlrc',
      '--tuples-only',
      '--no-align',
      '--quiet',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      'select version from supabase_migrations.schema_migrations',
    ],
    {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PGCONNECT_TIMEOUT: '20' },
    },
  )
} catch (err) {
  const fout = err instanceof Error ? `${err.message}\n${err.stderr ?? ''}` : String(err)
  console.error('Het register op de database uitlezen lukte niet.')
  console.error(schoon(fout))
  process.exit(1)
}

const gedraaid = new Set(
  ruw
    .split('\n')
    .map((regel) => regel.trim())
    .filter(Boolean),
)

if (gedraaid.size === 0) {
  console.error('Het register supabase_migrations.schema_migrations is leeg.')
  console.error('Dat klopt niet met een database die al draait; kijk er met de hand naar.')
  process.exit(1)
}

const mist = inRepo.filter(({ versie }) => !gedraaid.has(versie))

if (mist.length === 0) {
  console.log('Alle migraties uit de repo staan in het register op de database.')
  process.exit(0)
}

console.log(mist.map(({ bestand }) => bestand).join('\n'))
process.exit(2)
