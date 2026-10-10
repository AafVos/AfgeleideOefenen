import { getTranslations } from 'next-intl/server'

import { SITE } from '@/config/site'
import { canoniek } from '@/lib/seo'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { berekenReeks, dagSleutel, laatsteDagen, telOefendagen } from './activiteit'
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

  // Activiteit uit session_answers_new. De balkjes gaan over de laatste
  // 14 dagen; "Dagen op rij", "Goed beantwoord" en "Vragen" gaan over
  // alles wat de leerling ooit gedaan heeft.
  // De dagen lopen van middernacht tot middernacht in Nederlandse tijd.
  const vandaag = dagSleutel(new Date())
  const veertienDagen = laatsteDagen(vandaag, 14)

  // "Ik weet het niet" staat met een lege is_correct in de database: de
  // leerling heeft de opgave niet beantwoord, dus die telt hier nergens mee
  // en trekt het percentage goed niet omlaag (zie AFG-102).
  const beantwoord = () =>
    supabase
      .from('session_answers_new')
      .select('answered_at, user_sessions_new!inner(user_id)')
      .eq('user_sessions_new.user_id', user.id)
      .not('is_correct', 'is', null)

  const [tellingPerDag, antwoordTotaal, goedTotaal] = await Promise.all([
    telOefendagen(
      (van, tot) =>
        beantwoord()
          // Nieuw naar oud, met de id erbij zodat antwoorden met hetzelfde
          // tijdstip niet tussen de pagina's door schuiven.
          .order('answered_at', { ascending: false })
          .order('id', { ascending: false })
          .returns<{ answered_at: string }[]>()
          .range(van, tot),
      vandaag,
      veertienDagen[0],
    ),
    supabase
      .from('session_answers_new')
      .select('user_sessions_new!inner(user_id)', { count: 'exact', head: true })
      .eq('user_sessions_new.user_id', user.id)
      .not('is_correct', 'is', null),
    supabase
      .from('session_answers_new')
      .select('user_sessions_new!inner(user_id)', { count: 'exact', head: true })
      .eq('user_sessions_new.user_id', user.id)
      .eq('is_correct', true),
  ])

  const totalAnswered = antwoordTotaal.count ?? 0
  const totalCorrect = goedTotaal.count ?? 0

  const activity = veertienDagen.map((date) => ({
    date,
    count: tellingPerDag.get(date) ?? 0,
  }))

  const streakDays = berekenReeks(new Set(tellingPerDag.keys()), vandaag)

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
