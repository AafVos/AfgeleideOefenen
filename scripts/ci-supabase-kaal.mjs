#!/usr/bin/env node
/**
 * Zet in `supabase/config.toml` de onderdelen uit die de e2e-controle niet
 * gebruikt. Alleen voor de automatische controle (CI) — op je eigen computer
 * blijft alles aan staan, inclusief Studio.
 *
 * Waarom dit nodig is: `supabase start -x realtime,storage-api,...` start die
 * containers niet, maar haalt de images wél op. Dat kostte in de controle
 * ongeveer 45 seconden aan downloads voor containers die daarna stilstonden.
 * Staat een onderdeel in de config uit, dan wordt er niets opgehaald.
 *
 * De test heeft de database, inloggen (auth), de data-API en de testpostbus
 * nodig. Die postbus (Mailpit, poort 54324) blijft dus met opzet aan: zonder
 * hem kan de test de bevestigingsmail en de resetmail niet ophalen.
 */
import { readFileSync, writeFileSync } from 'node:fs'

if (!process.env.CI) {
  console.error(
    'Dit script hoort alleen in de automatische controle thuis: het verandert supabase/config.toml.',
  )
  process.exit(1)
}

// De kopjes waarvan het eerste `enabled` op false mag. Onderkopjes (zoals
// [storage.s3_protocol]) hebben een eigen naam en blijven dus met rust.
const UIT = new Set([
  'studio',
  'storage',
  'realtime',
  'analytics', // logflare en vector
  'edge_runtime',
])

const pad = 'supabase/config.toml'
const regels = readFileSync(pad, 'utf8').split('\n')

let kopje = null
const uitgezet = []

const nieuw = regels.map((regel) => {
  const kop = /^\s*\[([^\]]+)\]/.exec(regel)
  if (kop) kopje = kop[1]

  if (kopje && UIT.has(kopje) && /^\s*enabled\s*=\s*true\s*$/.test(regel)) {
    uitgezet.push(kopje)
    UIT.delete(kopje) // alleen de eerste regel onder het kopje
    return 'enabled = false'
  }
  return regel
})

writeFileSync(pad, nieuw.join('\n'))
console.log(`Uitgezet voor deze controle: ${uitgezet.join(', ')}`)
