/**
 * Seed de beslisboom vanuit de bestaande stoomcursus-types (geel-tredes.ts):
 * elk "Type vraag" wordt een wortelknoop; heeft het type takken (ja/nee),
 * dan worden dat kindknopen met hun eigen stappenplan, anders is de wortel
 * meteen een eindknoop met het platte stappenplan.
 *
 * Draait alleen als de boom nog leeg is (geen dubbele seeds).
 * Run: npx tsx scripts/seed-beslisboom.ts
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

import {
  GEEL_TREDES,
  TYPE_VRAAG_OPTIES,
} from '../src/app/[locale]/stoomcursus/geel-tredes'

function loadEnv(): Record<string, string> {
  const file = path.join(__dirname, '..', '.env.local')
  const env: Record<string, string> = {}
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (!m) continue
    let v = m[2].trim()
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1)
    }
    env[m[1]] = v
  }
  return env
}

async function main() {
  const env = loadEnv()
  const url = env.NEXT_PUBLIC_SUPABASE_URL
  const key = env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase-URL/service-key ontbreekt in .env.local')
  if (!url.includes('127.0.0.1') && !url.includes('localhost')) {
    throw new Error(`Seed is bedoeld voor lokaal, maar de URL is: ${url}`)
  }

  const sb = createClient(url, key)

  const { count } = await sb
    .from('beslisboom_nodes')
    .select('*', { count: 'exact', head: true })
  if ((count ?? 0) > 0) {
    console.log(`Boom bevat al ${count} knopen — seed overgeslagen.`)
    return
  }

  let wortelIndex = 0
  for (const optie of TYPE_VRAAG_OPTIES) {
    const trede = GEEL_TREDES[optie.tredeIndexes[0]]
    const heeftTakken = !!trede.takken

    const { data: wortel, error } = await sb
      .from('beslisboom_nodes')
      .insert({
        site: 'afgeleiden',
        parent_id: null,
        label: optie.label,
        vraag: heeftTakken ? trede.takken!.vraag : null,
        stappen: heeftTakken ? [] : trede.stappen,
        order_index: wortelIndex++,
      })
      .select('id')
      .single()
    if (error) throw new Error(`${optie.label}: ${error.message}`)

    if (heeftTakken) {
      const kinderen = trede.takken!.opties.map((tak, i) => ({
        site: 'afgeleiden' as const,
        parent_id: wortel.id,
        label: tak.keuze,
        vraag: null,
        stappen: tak.stappen,
        order_index: i,
      }))
      const { error: kindErr } = await sb.from('beslisboom_nodes').insert(kinderen)
      if (kindErr) throw new Error(`${optie.label} (takken): ${kindErr.message}`)
    }

    console.log(
      `  + ${optie.label}${heeftTakken ? ` (${trede.takken!.opties.length} takken)` : ' (eindknoop)'}`,
    )
  }

  const { count: totaal } = await sb
    .from('beslisboom_nodes')
    .select('*', { count: 'exact', head: true })
  console.log(`\n✓ Beslisboom geseed met ${totaal} knopen.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
