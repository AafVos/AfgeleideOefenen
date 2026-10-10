/**
 * Leest alleen (verandert niets): hoeveel wordt er geoefend in de laatste
 * 30 dagen? Draai met: npx tsx scripts/check-activiteit.ts
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
if (!url || !key) { console.error('Missing env vars'); process.exit(1) }
const sb = createClient(url, key)

const SINCE = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

async function main() {
  const { data: profiles, error: pErr } = await sb
    .from('profiles')
    .select('id, username')
  if (pErr) throw pErr

  const { data: sessions, error: sErr } = await sb
    .from('user_sessions_new')
    .select('id, user_id, started_at')
    .gte('started_at', SINCE)
  if (sErr) throw sErr

  const { data: answers, error: aErr } = await sb
    .from('session_answers_new')
    .select('id, session_id, answered_at')
    .gte('answered_at', SINCE)
  if (aErr) throw aErr

  const sessionToUser = new Map<string, string>()
  for (const s of sessions ?? []) sessionToUser.set(s.id, s.user_id)

  const perUser = new Map<string, { sessions: number; answers: number; last: string }>()
  for (const s of sessions ?? []) {
    const r = perUser.get(s.user_id) ?? { sessions: 0, answers: 0, last: '' }
    r.sessions++
    if (s.started_at > r.last) r.last = s.started_at
    perUser.set(s.user_id, r)
  }
  for (const a of answers ?? []) {
    const uid = sessionToUser.get(a.session_id)
    if (!uid) continue
    const r = perUser.get(uid)
    if (!r) continue
    r.answers++
  }

  console.log('=== Drukste gebruikers (laatste 30 dagen) ===')
  const topRows = [...perUser.entries()]
    .map(([uid, r]) => ({
      user: profiles?.find((p) => p.id === uid)?.username ?? uid.slice(0, 8),
      ...r,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20)
  console.log('  gebruiker                      sess  ans   laatst')
  for (const r of topRows) {
    console.log(
      `  ${r.user.padEnd(30)} ${String(r.sessions).padStart(4)}  ${String(r.answers).padStart(4)}  ${r.last.slice(0, 16)}`,
    )
  }

  console.log(`\nProfielen totaal: ${profiles?.length ?? 0}`)
  console.log(`Actieve gebruikers in 30d: ${perUser.size}`)
  console.log(`Sessies in 30d: ${sessions?.length ?? 0}`)
  console.log(`Antwoorden in 30d: ${answers?.length ?? 0}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
