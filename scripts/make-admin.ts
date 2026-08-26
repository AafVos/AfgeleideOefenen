/**
 * Zet profiles.role = 'admin' voor één account op PRODUCTIE.
 * Run: npx tsx scripts/make-admin.ts
 */
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { createClient } from '@supabase/supabase-js'

const EMAIL = 'alhvos@gmail.com'

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
  const url = env.NEXT_PUBLIC_SUPABASE_URL_PROD
  const key = env.SUPABASE_SERVICE_ROLE_KEY_PROD
  if (!url || !key) {
    throw new Error('Prod-URL/service-key ontbreekt (_PROD) in .env.local')
  }
  if (url.includes('localhost') || url.includes('127.0.0.1')) {
    throw new Error('Prod-URL wijst naar localhost — controleer de *_PROD keys')
  }
  console.log('Doel (productie):', url)

  const sb = createClient(url, key)

  // Zoek de user-id via auth (pagineren voor de zekerheid)
  let uid: string | undefined
  for (let page = 1; page <= 20 && !uid; page++) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const u = data.users.find(
      (u) => u.email?.toLowerCase() === EMAIL.toLowerCase(),
    )
    if (u) uid = u.id
    if (data.users.length < 1000) break
  }
  if (!uid) {
    console.error('User niet gevonden:', EMAIL)
    process.exit(1)
  }
  console.log('Account gevonden.')

  const { data: before } = await sb
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .maybeSingle()
  console.log('Rol vóór:', before?.role ?? '(geen profielrij gevonden)')

  if (!before) {
    console.error(
      'Geen profielrij voor dit account — handmatig controleren i.p.v. blind invoegen.',
    )
    process.exit(1)
  }

  const { error: upErr } = await sb
    .from('profiles')
    .update({ role: 'admin' })
    .eq('id', uid)
  if (upErr) throw upErr

  const { data: after } = await sb
    .from('profiles')
    .select('role')
    .eq('id', uid)
    .maybeSingle()
  console.log('Rol ná:', after?.role)

  if (after?.role === 'admin') {
    console.log(`\n✓ ${EMAIL} is weer admin op productie.`)
  } else {
    console.error('Update lijkt niet doorgevoerd.')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
