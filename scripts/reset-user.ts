/**
 * Reset een user naar nieuwe-gebruiker-staat.
 *
 * Run met:  npx tsx scripts/reset-user.ts <e-mailadres>
 * Of zet het adres in RESET_USER_EMAIL.
 *
 * Het adres staat met opzet niet in dit bestand: de repo is openbaar.
 */
import { createClient } from '@supabase/supabase-js'

const EMAIL = process.argv[2] ?? process.env.RESET_USER_EMAIL

async function main() {
  if (!EMAIL) {
    console.error('Geef een e-mailadres mee: npx tsx scripts/reset-user.ts <e-mailadres>')
    console.error('(of zet RESET_USER_EMAIL in je omgeving)')
    process.exit(1)
  }

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
  const { data: sessions } = await sb.from('user_sessions_new').select('id').eq('user_id', uid)
  const sessionIds = (sessions ?? []).map(s => s.id)
  if (sessionIds.length > 0) {
    const { count: sa } = await sb.from('session_answers_new')
      .delete({ count: 'exact' }).in('session_id', sessionIds)
    console.log('session_answers_new verwijderd:', sa)
  } else {
    console.log('session_answers_new verwijderd: 0')
  }

  const { count: us } = await sb.from('user_sessions_new')
    .delete({ count: 'exact' }).eq('user_id', uid)
  console.log('user_sessions_new verwijderd:', us)

  const { count: up } = await sb.from('user_progress_new')
    .delete({ count: 'exact' }).eq('user_id', uid)
  console.log('user_progress_new verwijderd:', up)

  // Reset onboarding in profiel (onboarded_at = null forceert onboarding-flow)
  await sb.from('profiles')
    .update({ onboarded_at: null })
    .eq('id', uid)
  console.log('Profiel gereset')

  console.log('\n✓ User', EMAIL, 'is terug naar nieuwe-gebruiker-staat')
}

main().catch(e => { console.error(e); process.exit(1) })
