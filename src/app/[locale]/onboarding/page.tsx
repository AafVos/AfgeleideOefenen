import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { OnboardingWizard } from './wizard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Onboarding' })
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  }
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

  const defaultName = profile?.display_name?.trim() ?? ''

  return <OnboardingWizard defaultName={defaultName} />
}
