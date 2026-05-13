import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { Math as TeX, RichMath } from '@/components/math'
import { Card, cn } from '@/components/ui'
import { loadTestResults } from '@/lib/practice/custom-test'
import { createClient } from '@/lib/supabase/server'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'ZelfToets' })
  return { title: t('resultsTitle'), robots: { index: false, follow: false } }
}

function renderInline(src: string | null, fallback: string) {
  const text = src ?? fallback
  if (text.includes('$')) return <RichMath source={text} />
  return <TeX tex={text} />
}

export default async function ZelfToetsResultaatPage({
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

  const results = await loadTestResults(supabase, user.id, sessionId)
  if (!results) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card>
          <p className="font-medium text-text">{t('runnerNotFound')}</p>
        </Card>
      </div>
    )
  }

  const pct =
    results.totalCount > 0
      ? Math.round((results.correctCount / results.totalCount) * 100)
      : 0

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-xs font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-1 font-serif text-3xl text-text">
        {results.correctCount} / {results.totalCount} ·{' '}
        <span className="text-text-muted">{pct}%</span>
      </h1>
      <p className="mt-2 text-text-muted">{t('resultsIntro')}</p>

      <div className="mt-10 space-y-8">
        {results.perCluster.map((group) => (
          <section key={group.clusterId}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {group.topicTitle}
                </p>
                <h2 className="mt-0.5 font-serif text-lg text-text">
                  {group.clusterTitle}
                </h2>
              </div>
              <div className="text-sm text-text-muted">
                {group.correct} / {group.total}
              </div>
            </div>

            <ol className="mt-3 space-y-2">
              {group.items.map((item, i) => (
                <li
                  key={item.questionId}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-sm',
                    item.isCorrect
                      ? 'border-emerald-300/60 bg-emerald-50/60'
                      : 'border-rose-300/60 bg-rose-50/70',
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={cn(
                        'mt-0.5 shrink-0 text-base font-bold',
                        item.isCorrect ? 'text-emerald-700' : 'text-rose-700',
                      )}
                      aria-hidden
                    >
                      {item.isCorrect ? '✓' : '✗'}
                    </span>
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="font-serif text-base text-text">
                        <span className="mr-2 text-xs text-text-muted">#{i + 1}</span>
                        {renderInline(item.latexBody, '')}
                      </div>
                      {!item.isCorrect && (
                        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                          <span>
                            <span className="text-text-muted">{t('yourAnswer')}: </span>
                            <span className="font-mono text-rose-700">
                              {item.userAnswer ? (
                                <TeX tex={item.userAnswer} />
                              ) : (
                                '—'
                              )}
                            </span>
                          </span>
                          <span>
                            <span className="text-text-muted">{t('correctAnswer')}: </span>
                            <span className="font-mono text-emerald-700">
                              {renderInline(item.latexAnswer, item.correctAnswer)}
                            </span>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>

            {group.correct < group.total && group.chapterSlug && (
              <p className="mt-3 text-xs">
                <Link
                  href={`/oefenen?chapter=${encodeURIComponent(group.chapterSlug)}&topic=${encodeURIComponent(group.topicSlug)}&cluster=${encodeURIComponent(group.clusterSlug)}`}
                  className="font-medium text-accent hover:underline"
                >
                  {t('drillLink')} →
                </Link>
              </p>
            )}
          </section>
        ))}
      </div>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link
          href="/zelf-toets"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90"
        >
          {t('newTest')}
        </Link>
        <Link
          href="/dashboard"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm font-medium text-text hover:bg-surface-2"
        >
          {t('toDashboard')}
        </Link>
      </div>
    </div>
  )
}
