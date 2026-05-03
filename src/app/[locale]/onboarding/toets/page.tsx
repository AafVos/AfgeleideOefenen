import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { loadDiagnosticQuestions } from '@/lib/practice/diagnostic'
import { createClient } from '@/lib/supabase/server'

import { DiagnosticRunner } from './diagnostic-runner'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'OnboardingToets' })
  return {
    title: t('title'),
    robots: { index: false, follow: false },
  }
}

export default async function ToetsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const t = await getTranslations('OnboardingToets')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, learning_mode')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarded_at) redirect('/onboarding')
  if (profile.learning_mode !== 'diagnostic') redirect('/leerpad')

  const questions = await loadDiagnosticQuestions(supabase)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">{t('h1')}</h1>
      <p className="mt-3 text-text-muted">{t('intro')}</p>

      {questions.length === 0 ? (
        <p className="mt-8 text-text-muted">{t('noQuestions')}</p>
      ) : (
        <div className="mt-10">
          <DiagnosticRunner questions={questions} />
        </div>
      )}

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/leerpad" className="text-accent hover:underline">
          {t('skipLink')}
        </Link>
      </p>
    </div>
  )
}
