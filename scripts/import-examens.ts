/**
 * Importeer de examenvragen uit content-bron/examens/*.json in exam_questions.
 * Upsert op (site, jaar, tijdvak, nummer) — veilig om opnieuw te draaien.
 *
 * Standaard naar de LOKALE database; run met --prod voor productie.
 * Run: npx tsx scripts/import-examens.ts [--prod]
 */
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

const EXAMENS_DIR = path.join(__dirname, '..', 'content-bron', 'examens')

type ExamJson = {
  _bron: string
  examen: string
  opgaven: Array<{
    nummer: number
    onderwerp: string
    context: string
    vraag: string
    verhaaltjes: number[]
    afgeleides: number[]
    oplosmethoden: number[]
    toelichting?: string
  }>
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

async function main() {
  const prod = process.argv.includes('--prod')
  const env = loadEnv()
  const url = prod
    ? env.NEXT_PUBLIC_SUPABASE_URL_PROD
    : env.NEXT_PUBLIC_SUPABASE_URL
  const key = prod
    ? env.SUPABASE_SERVICE_ROLE_KEY_PROD
    : env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Supabase-URL/service-key ontbreekt in .env.local')
  if (!prod && !url.includes('127.0.0.1') && !url.includes('localhost')) {
    throw new Error(`Zonder --prod verwacht ik een localhost-URL, maar kreeg: ${url}`)
  }
  console.log(`Doel (${prod ? 'PRODUCTIE' : 'lokaal'}):`, url)

  const sb = createClient(url, key)

  const files = readdirSync(EXAMENS_DIR)
    .filter((f) => /^vwo-wisB-\d{4}-tv[12]\.json$/.test(f))
    .sort()

  let total = 0
  for (const file of files) {
    const m = file.match(/^vwo-wisB-(\d{4})-tv([12])\.json$/)!
    const jaar = Number(m[1])
    const tijdvak = Number(m[2])
    const data = JSON.parse(
      readFileSync(path.join(EXAMENS_DIR, file), 'utf8'),
    ) as ExamJson

    const rows = data.opgaven.map((o) => ({
      site: 'afgeleiden' as const,
      jaar,
      tijdvak,
      nummer: o.nummer,
      onderwerp: o.onderwerp,
      context: o.context,
      vraag: o.vraag,
      verhaaltjes: o.verhaaltjes ?? [],
      afgeleides: o.afgeleides ?? [],
      oplosmethoden: o.oplosmethoden ?? [],
      toelichting: o.toelichting ?? null,
      bron: data._bron,
    }))

    const { error } = await sb
      .from('exam_questions')
      .upsert(rows, { onConflict: 'site,jaar,tijdvak,nummer' })
    if (error) throw new Error(`${file}: ${error.message}`)

    console.log(`  ${file}: ${rows.length} vragen`)
    total += rows.length
  }

  const { count } = await sb
    .from('exam_questions')
    .select('*', { count: 'exact', head: true })
  console.log(`\n✓ ${total} vragen geïmporteerd/bijgewerkt uit ${files.length} examens.`)
  console.log(`  Totaal in exam_questions: ${count}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
