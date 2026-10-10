import { getTranslations } from 'next-intl/server'

import { SITE } from '@/config/site'
import { canoniek } from '@/lib/seo'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { beginVanDag, berekenReeks, dagSleutel, laatsteDagen } from './activiteit'
import { DashboardGrid } from './dashboard-grid'
import type { ChapterData, TopicData } from './topic-block'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Dashboard' })
  return { title: t('title'), alternates: canoniek(locale, '/dashboard') }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const user = await requireUser()

  const t = await getTranslations('Dashboard')

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()

  const firstName =
    profile?.display_name?.trim().split(/\s+/)[0]?.trim() || null

  // New tables
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, slug, title, order_index')
    .eq('site', SITE)
    .order('order_index')

  const { data: topics } = await supabase
    .from('topics_new')
    .select('id, title, slug, chapter_id, order_index')
    .eq('site', SITE)
    .order('order_index')

  const { data: clusters } = await supabase
    .from('topic_clusters_new')
    .select('id, title, slug, topic_id, order_index')
    .eq('site', SITE)
    .order('order_index')

  const { data: progressRows } = await supabase
    .from('user_progress_new')
    .select('cluster_id, status, total_answered, total_correct, is_skipped')
    .eq('user_id', user.id)

  const progressByCluster = new Map(
    (progressRows ?? []).map((p) => [p.cluster_id, p]),
  )

  // Activity: last 14 days via user_sessions_new + session_answers_new.
  // De dagen lopen van middernacht tot middernacht in Nederlandse tijd.
  const vandaag = dagSleutel(new Date())
  const veertienDagen = laatsteDagen(vandaag, 14)
  const since14 = beginVanDag(veertienDagen[0])

  const { data: recentSessions } = await supabase
    .from('user_sessions_new')
    .select('id')
    .eq('user_id', user.id)
    .gte('started_at', since14.toISOString())

  const sessionIds = (recentSessions ?? []).map((s) => s.id)

  const { data: answersRows } = sessionIds.length > 0
    ? await supabase
        .from('session_answers_new')
        .select('answered_at, is_correct')
        .in('session_id', sessionIds)
        .gte('answered_at', since14.toISOString())
    : { data: [] }

  const bucket = new Map<string, number>(veertienDagen.map((d) => [d, 0]))

  let totalAnswered = 0
  let totalCorrect = 0

  for (const row of answersRows ?? []) {
    // "Ik weet het niet" staat met een lege is_correct in de database: de
    // leerling heeft de opgave niet beantwoord, dus hij telt hier niet mee
    // en trekt het percentage goed niet omlaag (zie AFG-102).
    if (row.is_correct !== true && row.is_correct !== false) continue
    const k = dagSleutel(new Date(row.answered_at))
    if (bucket.has(k)) bucket.set(k, (bucket.get(k) ?? 0) + 1)
    totalAnswered++
    if (row.is_correct) totalCorrect++
  }

  const activity = Array.from(bucket.entries()).map(([date, count]) => ({ date, count }))

  const dagenMetAntwoord = new Set(
    activity.filter((d) => d.count > 0).map((d) => d.date),
  )
  const streakDays = berekenReeks(dagenMetAntwoord, vandaag)

  // Build chapter → meta map
  const chapterById = new Map((chapters ?? []).map((c) => [c.id, c]))

  // Sort topics by chapter order then topic order
  const sortedTopics = [...(topics ?? [])].sort((a, b) => {
    const ca = chapterById.get(a.chapter_id)?.order_index ?? 999
    const cb = chapterById.get(b.chapter_id)?.order_index ?? 999
    if (ca !== cb) return ca - cb
    return a.order_index - b.order_index
  })

  // Build TopicData per topic
  const topicDataById = new Map<string, TopicData>()
  for (const topic of sortedTopics) {
    const chapterSlug = chapterById.get(topic.chapter_id)?.slug ?? ''
    const topicClusters = (clusters ?? [])
      .filter((c) => c.topic_id === topic.id)
      .sort((a, b) => a.order_index - b.order_index)
      .map((c) => {
        const progress = progressByCluster.get(c.id)
        const isSkipped = progress?.is_skipped === true
        return {
          id: c.id,
          slug: c.slug,
          title: c.title,
          topicId: topic.id,
          totalAnswered: progress?.total_answered ?? 0,
          totalCorrect: progress?.total_correct ?? 0,
          isKnown: !isSkipped && progress?.status === 'mastered',
          isSkipped,
        }
      })
    topicDataById.set(topic.id, {
      id: topic.id,
      slug: topic.slug,
      title: topic.title,
      chapterSlug,
      clusters: topicClusters,
    })
  }

  // Group topics by chapter
  const chapterData: ChapterData[] = (chapters ?? [])
    .sort((a, b) => a.order_index - b.order_index)
    .map((chapter) => ({
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      topics: sortedTopics
        .filter((t) => t.chapter_id === chapter.id)
        .map((t) => topicDataById.get(t.id)!)
        .filter(Boolean),
    }))
    .filter((ch) => ch.topics.length > 0)

  return (
    <div className="mx-auto max-w-[1400px] px-3 py-6">
      <div className="mb-2">
        <h1 className="font-serif text-2xl text-text">
          {firstName
            ? t('greetingWithName', { name: firstName })
            : t('progressTitle')}
        </h1>
      </div>

      <DashboardGrid
        chapterData={chapterData}
        streakDays={streakDays}
        activity={activity}
        totalAnswered={totalAnswered}
        totalCorrect={totalCorrect}
      />
    </div>
  )
}
