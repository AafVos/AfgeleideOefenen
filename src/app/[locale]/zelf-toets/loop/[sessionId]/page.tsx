import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { Card } from '@/components/ui'
import { loadTestResults, loadTestSessionState } from '@/lib/practice/custom-test'
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

  if (state.totalCount === 0) {
    redirect(`/${locale}/zelf-toets`)
  }

  if (state.ended || !state.nextQuestionId) {
    const results = await loadTestResults(supabase, user.id, sessionId)
    const correctCount = results?.correctCount ?? 0
    const totalCount = results?.totalCount ?? state.totalCount
    const pct =
      totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0

    const headlineKey =
      pct === 100
        ? 'finishedHeadlinePerfect'
        : pct >= 80
          ? 'finishedHeadlineGreat'
          : pct >= 50
            ? 'finishedHeadlineGood'
            : 'finishedHeadlineKeepGoing'

    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="rounded-2xl border border-border bg-surface p-8 text-center shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="mt-2 font-serif text-3xl text-text">
            {t(headlineKey)}
          </h1>
          <p className="mt-4 font-serif text-5xl text-text">
            {correctCount}{' '}
            <span className="text-text-muted">/ {totalCount}</span>
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {t('finishedScoreLine', { pct })}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              {t('toDashboard')}
            </Link>
            <Link
              href={`/zelf-toets/resultaat/${sessionId}`}
              className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
            >
              {t('viewDetails')}
            </Link>
            <Link
              href="/zelf-toets"
              className="rounded-md border border-border bg-surface px-5 py-2.5 text-sm font-medium text-text hover:bg-surface-2"
            >
              {t('newTest')}
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const [{ data: question }, { data: steps }] = await Promise.all([
    supabase
      .from('questions_new')
      .select('id, latex_body, difficulty')
      .eq('id', state.nextQuestionId)
      .maybeSingle(),
    supabase
      .from('question_steps_new')
      .select('id, step_order, step_description')
      .eq('question_id', state.nextQuestionId)
      .order('step_order'),
  ])

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
        steps={steps ?? []}
        showAnswers={state.showAnswers}
      />
    </div>
  )
}
