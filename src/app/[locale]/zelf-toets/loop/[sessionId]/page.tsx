import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { Card } from '@/components/ui'
import { loadTestSessionState } from '@/lib/practice/custom-test'
import { createClient } from '@/lib/supabase/server'

import { TestRunnerCard } from './runner-card'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ZelfToets' })
  return { title: t('runnerTitle'), robots: { index: false, follow: false } }
}

export default async function ZelfToetsRunnerPage({
  params,
}: {
  params: Promise<{ locale: string; sessionId: string }>
}) {
  const { sessionId, locale } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('ZelfToets')

  const state = await loadTestSessionState(supabase, user.id, sessionId)
  if (!state) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <p className="font-medium text-text">{t('runnerNotFound')}</p>
        </Card>
      </div>
    )
  }

  if (state.totalCount === 0 || state.ended || !state.nextQuestionId) {
    redirect(`/${locale}/zelf-toets/resultaat/${sessionId}`)
  }

  const { data: question } = await supabase
    .from('questions_new')
    .select('id, latex_body, difficulty')
    .eq('id', state.nextQuestionId)
    .maybeSingle()

  if (!question) {
    redirect(`/${locale}/zelf-toets/resultaat/${sessionId}`)
  }

  const progressPercent = Math.round(
    (state.answeredCount / Math.max(1, state.totalCount)) * 100,
  )

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-wider text-accent">
          {t('eyebrow')}
        </p>
        <h1 className="mt-1 font-serif text-2xl text-text">
          {t('progress', { n: state.nextOrdinal ?? 1, total: state.totalCount })}
        </h1>
        <div
          className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={state.totalCount}
          aria-valuenow={state.answeredCount}
        >
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <TestRunnerCard
        sessionId={sessionId}
        question={{
          id: question.id,
          latex_body: question.latex_body,
          difficulty: question.difficulty,
        }}
        showAnswers={state.showAnswers}
      />
    </div>
  )
}
