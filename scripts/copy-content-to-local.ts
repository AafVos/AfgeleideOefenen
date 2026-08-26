/**
 * Kopieert de content-tabellen (hoofdstukken, topics, clusters, vragen,
 * stappen en AI-cache) van de productie-Supabase naar de lokale
 * dev-database van `supabase start`. User-data (profiles, user_*, sessies,
 * voortgang) wordt bewust NIET gekopieerd.
 *
 * Vereist: `supabase start` draait, en .env.local bevat de productie-keys
 * (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 *
 * Run: npx tsx scripts/copy-content-to-local.ts
 */
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

// Insert-volgorde respecteert de foreign keys; wissen gebeurt omgekeerd.
const CONTENT_TABLES = [
  'chapters',
  'topics',
  'root_causes',
  'topic_clusters',
  'questions',
  'question_steps',
  'known_wrong_answers',
  'topics_new',
  'topic_clusters_new',
  'questions_new',
  'question_steps_new',
  'known_wrong_answers_new',
]

const PAGE_SIZE = 1000
const INSERT_CHUNK = 500

function readEnvLocal(): Record<string, string> {
  const file = path.join(__dirname, '..', '.env.local')
  const env: Record<string, string> = {}
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m) env[m[1]] = m[2].trim()
  }
  return env
}

function localKeys(): { url: string; serviceKey: string } {
  const raw = execSync('supabase status -o json', {
    cwd: path.join(__dirname, '..'),
    encoding: 'utf8',
  })
  const status = JSON.parse(raw.slice(raw.indexOf('{')))
  const url: string = status.API_URL ?? 'http://127.0.0.1:54321'
  const serviceKey: string = status.SERVICE_ROLE_KEY
  if (!serviceKey) throw new Error('Geen SERVICE_ROLE_KEY in `supabase status` — draait `supabase start`?')
  return { url, serviceKey }
}

function headers(key: string, extra: Record<string, string> = {}) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

async function fetchAll(url: string, key: string, table: string) {
  const rows: unknown[] = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const res = await fetch(`${url}/rest/v1/${table}?select=*`, {
      headers: headers(key, { Range: `${from}-${from + PAGE_SIZE - 1}` }),
    })
    if (!res.ok) throw new Error(`${table}: lezen mislukt (${res.status}) ${await res.text()}`)
    const page = (await res.json()) as unknown[]
    rows.push(...page)
    if (page.length < PAGE_SIZE) return rows
  }
}

async function wipe(url: string, key: string, table: string) {
  const res = await fetch(`${url}/rest/v1/${table}?id=not.is.null`, {
    method: 'DELETE',
    headers: headers(key, { Prefer: 'return=minimal' }),
  })
  if (!res.ok) throw new Error(`${table}: wissen mislukt (${res.status}) ${await res.text()}`)
}

async function insert(url: string, key: string, table: string, rows: unknown[]) {
  for (let i = 0; i < rows.length; i += INSERT_CHUNK) {
    const chunk = rows.slice(i, i + INSERT_CHUNK)
    const res = await fetch(`${url}/rest/v1/${table}`, {
      method: 'POST',
      headers: headers(key, { Prefer: 'return=minimal' }),
      body: JSON.stringify(chunk),
    })
    if (!res.ok) throw new Error(`${table}: invoegen mislukt (${res.status}) ${await res.text()}`)
  }
}

async function main() {
  const env = readEnvLocal()
  const prodUrl = env.NEXT_PUBLIC_SUPABASE_URL_PROD ?? env.NEXT_PUBLIC_SUPABASE_URL
  const prodKey = env.SUPABASE_SERVICE_ROLE_KEY_PROD ?? env.SUPABASE_SERVICE_ROLE_KEY
  if (!prodUrl || !prodKey) throw new Error('Productie-URL/service-key niet gevonden in .env.local')
  if (prodUrl.includes('127.0.0.1') || prodUrl.includes('localhost')) {
    throw new Error('Productie-URL wijst naar localhost — zet de prod-keys als *_PROD in .env.local')
  }

  const local = localKeys()
  console.log(`Prod:   ${prodUrl}`)
  console.log(`Lokaal: ${local.url}\n`)

  // Eerst lokaal leegmaken (omgekeerde volgorde i.v.m. foreign keys)
  for (const table of [...CONTENT_TABLES].reverse()) {
    await wipe(local.url, local.serviceKey, table)
  }

  for (const table of CONTENT_TABLES) {
    const rows = await fetchAll(prodUrl, prodKey, table)
    if (rows.length > 0) await insert(local.url, local.serviceKey, table, rows)
    console.log(`  ${table.padEnd(24)} ${rows.length} rijen`)
  }

  console.log('\nKlaar — lokale database heeft nu de productie-content.')
}

main().catch((err) => {
  console.error(err.message ?? err)
  process.exit(1)
})
