/**
 * Importeer de boekopgaven uit content-bron/boek/*.json in exam_questions
 * (bron_type 'boek'). Elk onderdeel wordt één rij; de verhaaltje-tag bepaalt
 * boek_categorie: nummer → 'verhaaltje' (+ verhaaltjes-array), 'afgeleide' →
 * puur de afgeleide berekenen, anders 'geen'.
 * Upsert op (site, bron_type, paragraaf, nummer, onderdeel) — veilig om
 * opnieuw te draaien.
 *
 * Let op: boekvragen zijn auteursrechtelijk beschermd (Noordhoff) en via RLS
 * alleen voor admins leesbaar — niet aan leerlingen tonen.
 *
 * Standaard naar de LOKALE database; run met --dev of --prod voor online.
 * Optioneel een hoofdstuk als filter (bv. `h2`), anders alle boek-bestanden.
 * Run: npx tsx scripts/import-boek.ts [h2] [--dev|--prod]
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

const BOEK_DIR = path.join(__dirname, '..', 'content-bron', 'boek')

type Onderdeel = {
  letter?: string
  vraag: string
  verhaaltje?: number | string | null
}

type Opgave = {
  nummer: number
  niveau?: string | null
  context?: string | null
  figuur?: string | null
  paragraaf?: string
  onderdelen: Onderdeel[]
}

type BoekJson = {
  _bron: string
  paragrafen: Array<{
    nummer: string
    titel: string
    boekpaginas?: string
    opgaven: Opgave[]
  }>
  diagnostischeToets?: { boekpaginas?: string; opgaven: Opgave[] }
}

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

function categorie(v: Onderdeel['verhaaltje']): 'verhaaltje' | 'afgeleide' | 'geen' {
  if (typeof v === 'number') return 'verhaaltje'
  if (v === 'afgeleide') return 'afgeleide'
  return 'geen'
}

function maakRows(
  bron: string,
  paragraaf: string,
  onderwerp: string,
  opgaven: Opgave[],
) {
  return opgaven.flatMap((o) =>
    o.onderdelen.map((od) => ({
      site: 'afgeleiden' as const,
      bron_type: 'boek' as const,
      paragraaf,
      nummer: o.nummer,
      onderdeel: od.letter ?? '',
      onderwerp,
      context: [o.context, o.figuur].filter(Boolean).join(' — '),
      vraag: od.vraag,
      verhaaltjes: typeof od.verhaaltje === 'number' ? [od.verhaaltje] : [],
      boek_categorie: categorie(od.verhaaltje),
      niveau: o.niveau ?? null,
      toelichting: o.paragraaf ? `Hoort bij §${o.paragraaf}` : null,
      bron: `${bron} — §${paragraaf} opgave ${o.nummer}${od.letter ?? ''}`,
    })),
  )
}

async function main() {
  const dev = process.argv.includes('--dev')
  const prod = process.argv.includes('--prod')
  const env = loadEnv()
  const suffix = prod ? '_PROD' : dev ? '_DEV' : ''
  const url = env[`NEXT_PUBLIC_SUPABASE_URL${suffix}`]
  const key = env[`SUPABASE_SERVICE_ROLE_KEY${suffix}`]
  if (!url || !key) throw new Error('Supabase-URL/service-key ontbreekt in .env.local')
  if (!dev && !prod && !url.includes('127.0.0.1') && !url.includes('localhost')) {
    throw new Error(`Zonder --dev/--prod verwacht ik een localhost-URL, maar kreeg: ${url}`)
  }
  console.log(`Doel (${prod ? 'PRODUCTIE' : dev ? 'dev (online)' : 'lokaal'}):`, url)

  const sb = createClient(url, key)

  const only = process.argv.find((a) => /^h\d+$/.test(a))
  const files = readdirSync(BOEK_DIR)
    .filter((f) => /^h\d+\.json$/.test(f))
    .filter((f) => !only || f === `${only}.json`)
    .sort()
  if (files.length === 0) throw new Error('Geen boek-bestanden gevonden')

  let total = 0
  const perCategorie: Record<string, number> = {}
  for (const file of files) {
    const hoofdstuk = file.replace('.json', '') // 'h2'
    const data = JSON.parse(
      readFileSync(path.join(BOEK_DIR, file), 'utf8'),
    ) as BoekJson

    const rows = [
      ...data.paragrafen.flatMap((p) =>
        maakRows(data._bron, p.nummer, p.titel, p.opgaven),
      ),
      ...(data.diagnostischeToets
        ? maakRows(
            data._bron,
            `${hoofdstuk.slice(1)}.dt`,
            'Diagnostische toets',
            data.diagnostischeToets.opgaven,
          )
        : []),
    ]

    const { error } = await sb.from('exam_questions').upsert(rows, {
      onConflict: 'site,bron_type,paragraaf,nummer,onderdeel',
    })
    if (error) throw new Error(`${file}: ${error.message}`)

    for (const r of rows) {
      perCategorie[r.boek_categorie] = (perCategorie[r.boek_categorie] ?? 0) + 1
    }
    console.log(`  ${file}: ${rows.length} onderdelen`)
    total += rows.length
  }

  const { count } = await sb
    .from('exam_questions')
    .select('*', { count: 'exact', head: true })
    .eq('bron_type', 'boek')
  console.log(`\n✓ ${total} boekonderdelen geïmporteerd/bijgewerkt uit ${files.length} bestanden.`)
  console.log(
    `  Per categorie: ${Object.entries(perCategorie)
      .map(([k, v]) => `${k} ${v}`)
      .join(', ')}`,
  )
  console.log(`  Totaal boekvragen in exam_questions: ${count}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
