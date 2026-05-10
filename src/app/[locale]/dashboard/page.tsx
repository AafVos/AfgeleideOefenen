import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { DashboardGrid } from './dashboard-grid'
import type { TopicData } from './topic-block'

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
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('Dashboard')

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

  // Fetch all topics with their clusters
  const { data: topics } = await supabase
    .from('topics')
    .select('id, title, slug, order_index')
    .order('order_index')

  const { data: clusters } = await supabase
    .from('topic_clusters')
    .select('id, title, slug, topic_id, order_index')
    .order('order_index')

  // Fetch user progress for all clusters
  const { data: progressRows } = await supabase
    .from('user_progress')
    .select('cluster_id, status, total_answered, total_correct, is_skipped')
    .eq('user_id', user.id)

  const progressByCluster = new Map(
    (progressRows ?? []).map((p) => [p.cluster_id, p]),
  )

  // ---- Activity, streak, stumbles (last 14 days) ----
  const since14 = new Date()
  since14.setDate(since14.getDate() - 13)
  since14.setHours(0, 0, 0, 0)

  const { data: recentSessions } = await supabase
    .from('user_sessions')
    .select('id')
    .eq('user_id', user.id)
    .gte('started_at', since14.toISOString())

  const sessionIds = (recentSessions ?? []).map((s) => s.id)

  const { data: answersRows } = sessionIds.length > 0
    ? await supabase
        .from('session_answers')
        .select('answered_at, is_correct, is_careless, question_id, user_answer')
        .in('session_id', sessionIds)
        .gte('answered_at', since14.toISOString())
    : { data: [] }

  const dayKey = (d: Date) => d.toISOString().slice(0, 10)
  const bucket = new Map<string, number>()
  for (let i = 0; i < 14; i++) {
    const d = new Date(since14)
    d.setDate(since14.getDate() + i)
    bucket.set(dayKey(d), 0)
  }

  let totalAnswered = 0
  let totalCorrect = 0
  const wrongQA: Array<{ question_id: string; user_answer: string }> = []

  for (const row of answersRows ?? []) {
    const k = dayKey(new Date(row.answered_at))
    if (bucket.has(k)) bucket.set(k, (bucket.get(k) ?? 0) + 1)
    totalAnswered++
    if (row.is_correct) totalCorrect++
    if (!row.is_correct && !row.is_careless && row.user_answer) {
      wrongQA.push({ question_id: row.question_id, user_answer: row.user_answer })
    }
  }

  const activity = Array.from(bucket.entries()).map(([date, count]) => ({ date, count }))

  // Streak: consecutive days ending today with ≥1 answer
  let streakDays = 0
  const todayKey = dayKey(new Date())
  for (const k of Array.from(bucket.keys()).sort().reverse()) {
    if (k > todayKey) continue
    if ((bucket.get(k) ?? 0) > 0) streakDays++
    else break
  }

  // Stumbles: join wrong answers with known_wrong_answers to get root_cause_slug
  let stumbles: Array<{ slug: string; label: string; topic: string; count: number }> = []
  const wrongQuestionIds = [...new Set(wrongQA.map((w) => w.question_id))]
  if (wrongQuestionIds.length > 0) {
    const { data: kwaRows } = await supabase
      .from('known_wrong_answers')
      .select('question_id, wrong_answer, root_cause_slug')
      .in('question_id', wrongQuestionIds)

    const kwaMap = new Map<string, string>()
    for (const kwa of kwaRows ?? []) {
      kwaMap.set(`${kwa.question_id}::${kwa.wrong_answer}`, kwa.root_cause_slug)
    }

    const stumbleMap = new Map<string, number>()
    for (const { question_id, user_answer } of wrongQA) {
      const slug = kwaMap.get(`${question_id}::${user_answer}`)
      if (slug) stumbleMap.set(slug, (stumbleMap.get(slug) ?? 0) + 1)
    }

    const stumbleSlugs = [...stumbleMap.keys()]
    if (stumbleSlugs.length > 0) {
      const { data: rcs } = await supabase
        .from('root_causes')
        .select('slug, description')
        .in('slug', stumbleSlugs)
      const descBySlug = new Map((rcs ?? []).map((r) => [r.slug, r.description]))
      stumbles = Array.from(stumbleMap.entries())
        .map(([slug, count]) => ({
          slug,
          label: descBySlug.get(slug) ?? slug,
          topic: '',
          count,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }
  }

  // Build the data structure for the UI
  const topicData: TopicData[] = (topics ?? []).map((topic) => {
    const topicClusters = (clusters ?? [])
      .filter((c) => c.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => {
        const progress = progressByCluster.get(c.id)
        const isSkipped = progress?.is_skipped === true
        return {
          id: c.id,
          title: c.title,
          topicId: topic.id,
          totalAnswered: progress?.total_answered ?? 0,
          totalCorrect: progress?.total_correct ?? 0,
          isKnown: !isSkipped && progress?.status === 'mastered',
          isSkipped,
        }
      })

    return {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      clusters: topicClusters,
    }
  })

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6">
      {/* Header */}
      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-text">
          {firstName
            ? t('greetingWithName', { name: firstName })
            : t('progressTitle')}
        </h1>
        <div className="flex gap-2">
          <Link
            href="/leerpad"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
          >
            {t('continueLeerpad')}
          </Link>
          <Link
            href="/oefenen"
            className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2"
          >
            {t('freeExercise')}
          </Link>
        </div>
      </div>

      <DashboardGrid
        topicData={topicData}
        streakDays={streakDays}
        activity={activity}
        stumbles={stumbles}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
      />
    </div>
  )
}
