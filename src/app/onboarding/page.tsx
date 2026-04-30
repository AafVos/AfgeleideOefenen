import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { OnboardingWizard } from './wizard'

export const metadata = {
  title: 'Welkom · afgeleideoefenen.nl',
  robots: { index: false, follow: false },
}

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, display_name, username')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.onboarded_at) redirect('/leerpad')

  // Geen automatische naam uit e-mail/username — alleen opgeslagen display_name.
  const defaultName = profile?.display_name?.trim() ?? ''

  return <OnboardingWizard defaultName={defaultName} />
}
