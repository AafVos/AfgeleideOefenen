import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { Badge, Card } from '@/components/ui'
import { loadLearningPath } from '@/lib/practice/engine'
import { createClient } from '@/lib/supabase/server'
import type { LearningMode } from '@/lib/supabase/types'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Dashboard' })
  return { title: t('title') }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const t = await getTranslations('Dashboard')

  const [{ data: profile }, path] = await Promise.all([
    supabase
      .from('profiles')
      .select('display_name, learning_mode')
      .eq('id', user.id)
      .maybeSingle(),
    loadLearningPath(supabase, user.id),
  ])

  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

  const [{ data: progressRows }, { data: answerAgg }] = await Promise.all([
    supabase
      .from('user_progress')
      .select('total_answered, total_correct, correct_streak, status')
      .eq('user_id', user.id),
    supabase
      .from('session_answers')
      .select(
        'is_correct, is_careless, time_spent_sec, created_at, user_sessions!inner(user_id), question:questions(root_cause_tags)',
      )
      .eq('user_sessions.user_id', user.id)
      .returns<
        Array<{
          is_correct: boolean | null
          is_careless: boolean
          time_spent_sec: number | null
          created_at: string
          user_sessions: unknown
          question: { root_cause_tags: string[] } | null
        }>
      >(),
  ])

  const totalAnswered =
    progressRows?.reduce((acc, r) => acc + r.total_answered, 0) ?? 0
  const totalCorrect =
    progressRows?.reduce((acc, r) => acc + r.total_correct, 0) ?? 0
  const masteredClusters =
    progressRows?.filter((r) => r.status === 'mastered').length ?? 0
  const carelessCount = answerAgg?.filter((a) => a.is_careless).length ?? 0
  const totalClusters = path.reduce((acc, t2) => acc + t2.clusters.length, 0)
  const bestStreak = progressRows?.length
    ? Math.max(...progressRows.map((r) => r.correct_streak))
    : 0

  const totalMinutes = Math.round(
    (answerAgg ?? []).reduce((acc, a) => acc + (a.time_spent_sec ?? 0), 0) / 60,
  )

  const last14 = buildActivity(
    (answerAgg ?? []).map((a) => new Date(a.created_at)),
  )

  const rootCauseCounts = new Map<string, number>()
  for (const a of answerAgg ?? []) {
    if (a.is_correct === false && !a.is_careless && a.question?.root_cause_tags) {
      for (const tag of a.question.root_cause_tags) {
        rootCauseCounts.set(tag, (rootCauseCounts.get(tag) ?? 0) + 1)
      }
    }
  }
  const topCauses = [...rootCauseCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const modeHintMode =
    profile?.learning_mode && profile.learning_mode !== 'topic_select'
      ? profile.learning_mode
      : null

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      {firstName ? (
        <>
          <p className="font-serif text-2xl text-text">
            {t('greetingWithName', { name: firstName })}
          </p>
          <h1 className="mt-1 font-serif text-xl text-text-muted">
            {t('progressTitle')}
          </h1>
          <p className="mt-2 text-sm text-text-muted">{t('progressSubtitle')}</p>
        </>
      ) : (
        <>
          <h1 className="font-serif text-3xl text-text">{t('progressTitle')}</h1>
          <p className="mt-1 text-sm text-text-muted">{t('progressSubtitleNoName')}</p>
        </>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/leerpad"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg bg-accent px-6 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-accent/90 sm:flex-none sm:px-8"
        >
          {t('continueLeerpad')}
        </Link>
        <Link
          href="/oefenen"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-center text-base font-medium text-text hover:bg-surface-2 sm:flex-none sm:px-8"
        >
          {t('freeExercise')}
        </Link>
      </div>

      {modeHintMode ? (
        <Card className="mt-5 border-accent/20 bg-accent/5">
          <p className="text-sm font-medium text-text">
            {t(`mode${capitalize(modeHintMode)}Title` as 'modeGuidedTitle')}
          </p>
          <p className="mt-1 text-sm text-text-muted">
            {t(`mode${capitalize(modeHintMode)}Body` as 'modeGuidedBody')}
          </p>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Stat label={t('statMastered')} value={`${masteredClusters} / ${totalClusters}`} />
        <Stat label={t('statAnswered')} value={totalAnswered} />
        <Stat
          label={t('statCorrect')}
          value={totalAnswered > 0 ? `${Math.round((totalCorrect / totalAnswered) * 100)}%` : '—'}
        />
        <Stat label={t('statCareless')} value={carelessCount} />
        <Stat label={t('statStreak')} value={bestStreak > 0 ? `${bestStreak}/3` : '—'} />
        <Stat
          label={t('statTime')}
          value={totalMinutes > 0 ? `${totalMinutes} min` : '—'}
        />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <h3 className="font-serif text-lg text-text">{t('activityTitle')}</h3>
          <p className="mt-1 text-xs text-text-muted">{t('activitySubtitle')}</p>
          <ActivityChart data={last14} questionLabel={t('questionCount', { n: 0 }).replace('0', '{n}')} />
        </Card>

        <Card className="lg:col-span-2">
          <h3 className="font-serif text-lg text-text">{t('stumbleTitle')}</h3>
          <p className="mt-1 text-xs text-text-muted">{t('stumbleSubtitle')}</p>
          {topCauses.length === 0 ? (
            <p className="mt-3 text-sm text-text-muted">{t('stumbleEmpty')}</p>
          ) : (
            <ul className="mt-3 space-y-1.5">
              {topCauses.map(([slug, count]) => (
                <li
                  key={slug}
                  className="flex items-center justify-between gap-3 rounded-md bg-surface-2 px-3 py-2 text-sm"
                >
                  <span className="font-mono text-xs text-text-muted">{slug}</span>
                  <span className="font-medium text-text">{count}×</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <h2 className="mt-10 font-serif text-xl text-text">{t('perTopicTitle')}</h2>
      <div className="mt-4 space-y-3">
        {path.map((topic) => {
          const masteredInTopic = topic.clusters.filter((c) => c.status === 'mastered').length
          const inProgressInTopic = topic.clusters.filter((c) => c.status === 'in_progress').length
          const pct =
            topic.clusters.length > 0
              ? Math.round((masteredInTopic / topic.clusters.length) * 100)
              : 0

          return (
            <Card key={topic.id}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-text">
                    {topic.title}
                    {topic.isLocked && (
                      <span className="ml-2 text-sm font-normal text-text-muted">
                        {t('locked')}
                      </span>
                    )}
                    {topic.isMastered && (
                      <span className="ml-2 text-sm font-normal text-accent">
                        {t('mastered')}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-text-muted">
                    {t('clustersOf', { mastered: masteredInTopic, total: topic.clusters.length })}
                    {inProgressInTopic > 0 && `, ${t('inProgress', { n: inProgressInTopic })}`}
                  </p>
                </div>
                <span className="font-serif text-2xl text-text">{pct}%</span>
              </div>

              <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-surface-2">
                <div className="h-full bg-accent transition-all" style={{ width: `${pct}%` }} />
              </div>

              <ul className="flex flex-wrap gap-2">
                {topic.clusters.map((c) => (
                  <li key={c.id}>
                    <ClusterChip status={c.status} title={c.title} streak={c.correct_streak} />
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>

      <div className="mt-10 flex flex-col gap-3 border-t border-border pt-10 sm:flex-row sm:flex-wrap sm:items-center">
        <Link
          href="/leerpad"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg bg-accent px-6 py-3 text-center text-base font-semibold text-white shadow-sm hover:bg-accent/90 sm:flex-none sm:px-8"
        >
          {t('continueLeerpad')}
        </Link>
        <Link
          href="/oefenen"
          className="inline-flex min-h-[3rem] flex-1 items-center justify-center rounded-lg border border-border bg-surface px-6 py-3 text-center text-base font-medium text-text hover:bg-surface-2 sm:flex-none sm:px-8"
        >
          {t('freeExercise')}
        </Link>
      </div>
    </div>
  )
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wider text-text-muted">{label}</p>
      <p className="mt-1 font-serif text-3xl text-text">{value}</p>
    </Card>
  )
}

function buildActivity(dates: Date[]): Array<{ label: string; count: number }> {
  const bins: Array<{ key: string; label: string; count: number }> = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    bins.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString('nl-NL', { day: '2-digit', month: 'short' }),
      count: 0,
    })
  }
  const byKey = new Map(bins.map((b) => [b.key, b] as const))
  for (const d of dates) {
    const key = d.toISOString().slice(0, 10)
    const bin = byKey.get(key)
    if (bin) bin.count += 1
  }
  return bins
}

function ActivityChart({
  data,
  questionLabel,
}: {
  data: Array<{ label: string; count: number }>
  questionLabel: string
}) {
  const max = Math.max(1, ...data.map((d) => d.count))
  return (
    <div className="mt-4">
      <div className="flex h-32 items-end gap-1">
        {data.map((d) => (
          <div
            key={d.label + d.count}
            className="group flex flex-1 flex-col items-center gap-1"
          >
            <div
              className="w-full rounded-t bg-accent/80 transition-all group-hover:bg-accent"
              style={{
                height: `${Math.max(3, (d.count / max) * 100)}%`,
                opacity: d.count === 0 ? 0.15 : 1,
              }}
              title={questionLabel.replace('{n}', String(d.count))}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex gap-1 text-[10px] text-text-muted">
        {data.map((d, i) => (
          <span
            key={d.label + i}
            className="flex-1 text-center"
            style={{ visibility: i % 2 === 0 ? 'visible' : 'hidden' }}
          >
            {d.label}
          </span>
        ))}
      </div>
    </div>
  )
}

function ClusterChip({
  status,
  title,
  streak,
}: {
  status: string
  title: string
  streak: number
}) {
  if (status === 'mastered') {
    return <Badge tone="accent">✓ {title}</Badge>
  }
  if (status === 'in_progress') {
    return <Badge tone="warn">{title} · {streak}/3</Badge>
  }
  return <Badge>{title}</Badge>
}
