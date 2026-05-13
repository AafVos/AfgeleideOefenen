import { getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

// Onboarding temporarily skipped — leerpad (its destination) is disabled.
// We still mark the profile as onboarded so the middleware doesn't loop.
// To restore: revert this file from git.
export default async function OnboardingPage() {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  // Mark onboarded so the middleware gate won't redirect back here.
  await supabase
    .from('profiles')
    .update({ onboarded_at: new Date().toISOString() })
    .eq('id', user.id)
    .is('onboarded_at', null)

  redirect(`/${locale}/oefenen`)
}
