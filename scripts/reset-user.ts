/**
 * Reset een user naar nieuwe-gebruiker-staat.
 * Run met: npx tsx scripts/reset-user.ts
 */
import { createClient } from '@supabase/supabase-js'

const EMAIL = 'wouterdeligt3@gmail.com'

async function main() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  // Zoek user id
  const { data: users } = await sb.auth.admin.listUsers()
  const user = users.users.find(u => u.email === EMAIL)
  if (!user) { console.error('User niet gevonden:', EMAIL); process.exit(1) }
  const uid = user.id
  console.log('User id:', uid)

  // Verwijder voortgang
  const { data: sessions } = await sb.from('user_sessions').select('id').eq('user_id', uid)
  const sessionIds = (sessions ?? []).map(s => s.id)
  if (sessionIds.length > 0) {
    const { count: sa } = await sb.from('session_answers')
      .delete({ count: 'exact' }).in('session_id', sessionIds)
    console.log('session_answers verwijderd:', sa)
  } else {
    console.log('session_answers verwijderd: 0')
  }

  const { count: us } = await sb.from('user_sessions')
    .delete({ count: 'exact' }).eq('user_id', uid)
  console.log('user_sessions verwijderd:', us)

  const { count: up } = await sb.from('user_progress')
    .delete({ count: 'exact' }).eq('user_id', uid)
  console.log('user_progress verwijderd:', up)

  // Reset onboarding in profiel (onboarded_at = null forceert onboarding-flow)
  await sb.from('profiles')
    .update({ onboarded_at: null })
    .eq('id', uid)
  console.log('Profiel gereset')

  console.log('\n✓ User', EMAIL, 'is terug naar nieuwe-gebruiker-staat')
}

main().catch(e => { console.error(e); process.exit(1) })
