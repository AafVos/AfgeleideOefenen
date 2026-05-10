/**
 * Read-only check: how are users distributed across learning_mode,
 * and how active are each group? Run with: npx tsx scripts/check-mode-usage.ts
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
    .select('id, username, learning_mode')
  if (pErr) throw pErr

  const modeCounts = new Map<string, number>()
  for (const p of profiles ?? []) {
    const m = p.learning_mode ?? '(not set)'
    modeCounts.set(m, (modeCounts.get(m) ?? 0) + 1)
  }
  console.log('=== Users by learning_mode ===')
  for (const [m, c] of [...modeCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${m.padEnd(15)} ${c}`)
  }

  const { data: sessions, error: sErr } = await sb
    .from('user_sessions')
    .select('id, user_id, started_at')
    .gte('started_at', SINCE)
  if (sErr) throw sErr

  const { data: answers, error: aErr } = await sb
    .from('session_answers')
    .select('id, session_id, answered_at')
    .gte('answered_at', SINCE)
  if (aErr) throw aErr

  const userMode = new Map<string, string>()
  for (const p of profiles ?? []) userMode.set(p.id, p.learning_mode ?? '(not set)')

  const sessionToUser = new Map<string, string>()
  const sessionsByMode = new Map<string, Set<string>>()
  const usersByMode = new Map<string, Set<string>>()
  for (const s of sessions ?? []) {
    sessionToUser.set(s.id, s.user_id)
    const m = userMode.get(s.user_id) ?? '(unknown)'
    if (!sessionsByMode.has(m)) sessionsByMode.set(m, new Set())
    if (!usersByMode.has(m)) usersByMode.set(m, new Set())
    sessionsByMode.get(m)!.add(s.id)
    usersByMode.get(m)!.add(s.user_id)
  }

  const answersByMode = new Map<string, number>()
  for (const a of answers ?? []) {
    const uid = sessionToUser.get(a.session_id)
    if (!uid) continue
    const m = userMode.get(uid) ?? '(unknown)'
    answersByMode.set(m, (answersByMode.get(m) ?? 0) + 1)
  }

  console.log('\n=== Last 30 days activity, grouped by user learning_mode ===')
  console.log('  mode             sessions   active_users   answers')
  const allModes = new Set([
    ...sessionsByMode.keys(),
    ...usersByMode.keys(),
    ...answersByMode.keys(),
  ])
  const rows = [...allModes].map((m) => ({
    m,
    sessions: sessionsByMode.get(m)?.size ?? 0,
    users: usersByMode.get(m)?.size ?? 0,
    answers: answersByMode.get(m) ?? 0,
  }))
  rows.sort((a, b) => b.sessions - a.sessions)
  for (const r of rows) {
    console.log(`  ${r.m.padEnd(16)} ${String(r.sessions).padStart(8)}   ${String(r.users).padStart(12)}   ${String(r.answers).padStart(7)}`)
  }

  console.log(`\n=== Top users (last 30 days) ===`)
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
    const r = perUser.get(uid)!
    r.answers++
  }
  const topRows = [...perUser.entries()]
    .map(([uid, r]) => ({
      user: profiles?.find((p) => p.id === uid)?.username ?? uid.slice(0, 8),
      mode: userMode.get(uid) ?? '(unknown)',
      ...r,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 20)
  console.log('  user                           mode             sess  ans   last')
  for (const r of topRows) {
    console.log(
      `  ${r.user.padEnd(30)} ${r.mode.padEnd(15)} ${String(r.sessions).padStart(4)}  ${String(r.answers).padStart(4)}  ${r.last.slice(0, 16)}`,
    )
  }

  console.log(`\nTotal profiles: ${profiles?.length ?? 0}`)
  console.log(`Total sessions in 30d: ${sessions?.length ?? 0}`)
  console.log(`Total answers in 30d: ${answers?.length ?? 0}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
