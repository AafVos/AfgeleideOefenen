/**
 * Vergelijkt de namen van de geheimen op de Worker met
 * scripts/worker-omgeving.json. Drukt alleen ontbrekende namen af.
 *
 *   node scripts/controleer-worker-env.mjs
 *
 * Heeft een Cloudflare-token nodig (CLOUDFLARE_API_TOKEN), net als wrangler.
 * Zonder token stopt het script met uitleg en afsluitcode 2.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const lijst = JSON.parse(readFileSync(new URL('./worker-omgeving.json', import.meta.url), 'utf8'))

const verplicht = lijst
  .filter((regel) => regel.verplicht && regel.geheim && regel.wanneer === 'runtime')
  .map((regel) => regel.naam)

if (!process.env.CLOUDFLARE_API_TOKEN) {
  console.error(
    'Geen CLOUDFLARE_API_TOKEN. Zonder die sleutel kan dit script de namen op de Worker niet lezen.',
  )
  process.exit(2)
}

let ruw
try {
  ruw = execFileSync(
    'npx',
    ['wrangler', 'secret', 'list', '--name', 'afgeleide-oefenen'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  )
} catch (err) {
  const fout = err instanceof Error ? err.message : String(err)
  console.error('De namen op de Worker ophalen lukte niet.')
  console.error(fout.replace(/[A-Za-z0-9_\-]{20,}/g, '<weggelaten>'))
  process.exit(1)
}

let namen
try {
  const json = ruw.slice(ruw.indexOf('['))
  const geparsed = JSON.parse(json)
  namen = geparsed.map((regel) => (typeof regel === 'string' ? regel : regel.name))
} catch {
  console.error('Het antwoord van wrangler was geen lijst met namen.')
  process.exit(1)
}

const bekend = new Set(namen)
const mist = verplicht.filter((naam) => !bekend.has(naam))

if (mist.length === 0) {
  console.log('Alle verplichte geheimen staan op de Worker.')
  process.exit(0)
}

console.log(mist.join('\n'))
process.exit(1)
