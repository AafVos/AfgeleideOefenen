import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { PadForm, type TopicPadRow } from './pad-form'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'OnboardingPad' })
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  }
}

export default async function PadPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const t = await getTranslations('OnboardingPad')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, learning_mode')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarded_at) redirect('/onboarding')
  if (profile.learning_mode !== 'topic_select') redirect('/leerpad')

  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, slug, order_index')
    .order('order_index')

  const rows = (topics ?? []) as TopicPadRow[]

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">{t('h1')}</h1>

      <div className="mt-10">
        <PadForm topics={rows} />
      </div>

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/leerpad" className="text-accent hover:underline">
          {t('skipLink')}
        </Link>{' '}
        ({t('skipHint')})
      </p>
    </div>
  )
}
