import { getTranslations, getLocale } from 'next-intl/server'
import { redirect } from 'next/navigation'

import { SITE } from '@/config/site'
import {
  loadChapters,
  loadAllTopics,
  loadClustersForTopics,
  loadTilesForClusters,
  loadQuestionNew,
  type ClusterInfo,
  type TopicCategory,
} from '@/lib/practice/chapter-overview'
import { createClient } from '@/lib/supabase/server'

import { OefenenClient } from './oefenen-client'

const CATEGORY_ORDER: TopicCategory[] = [
  'primitiveren',
  'integralen',
  'vergelijkingen',
  'toepassingen',
]
const CATEGORY_LABELS: Record<TopicCategory, string> = {
  primitiveren: 'Primitiveren',
  integralen: 'Integralen',
  vergelijkingen: 'Vergelijkingen',
  toepassingen: 'Toepassingen',
}

function isCategory(v: string | null): v is TopicCategory {
  return (
    v === 'primitiveren' ||
    v === 'integralen' ||
    v === 'vergelijkingen' ||
    v === 'toepassingen'
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FreeExercise' })
  return { title: t('title') }
}

type PageProps = {
  searchParams?: Promise<{
    category?: string
    chapter?: string
    topic?: string
    cluster?: string
    q?: string
  }>
}

export default async function OefenenPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/inloggen`)

  const t = await getTranslations('FreeExercise')
  const params = (await searchParams) ?? {}
  const categoryParam = params.category?.trim() ?? null
  const chapterParam = params.chapter?.trim() ?? null
  const topicParam = params.topic?.trim() ?? null
  const clusterParam = params.cluster?.trim() ?? null
  const qParam = params.q?.trim() ?? null

  const showCategories = SITE === 'integralen'
  const activeCategory: TopicCategory | null = showCategories
    ? isCategory(categoryParam)
      ? categoryParam
      : 'primitiveren'
    : null

  const [chapters, allTopicsRaw] = await Promise.all([
    loadChapters(supabase),
    loadAllTopics(supabase),
  ])

  const allTopics = activeCategory
    ? allTopicsRaw.filter((t) => t.category === activeCategory)
    : allTopicsRaw

  const visibleChapterIds = new Set(allTopics.map((t) => t.chapter_id))
  const visibleChapters = activeCategory
    ? chapters.filter((c) => visibleChapterIds.has(c.id))
    : chapters

  // Load ALL clusters for ALL visible topics (needed for client-side sidebar)
  const allClusters = await loadClustersForTopics(
    supabase,
    allTopics.map((t) => t.id),
  )

  // Resolve initial selection from URL params for first render
  const activeChapter =
    (chapterParam ? visibleChapters.find((c) => c.slug === chapterParam) : null) ??
    visibleChapters[0] ??
    null

  const chapterTopics = activeChapter
    ? allTopics.filter((t) => t.chapter_id === activeChapter.id)
    : []

  const activeTopic = topicParam
    ? (chapterTopics.find((t) => t.slug === topicParam) ?? null)
    : null

  const clustersByTopic = new Map<string, ClusterInfo[]>()
  for (const cl of allClusters) {
    const arr = clustersByTopic.get(cl.topic_id) ?? []
    arr.push(cl)
    clustersByTopic.set(cl.topic_id, arr)
  }

  const topicClusters = activeTopic ? (clustersByTopic.get(activeTopic.id) ?? []) : []
  const activeCluster = clusterParam
    ? (topicClusters.find((c) => c.slug === clusterParam) ?? null)
    : null

  const tileClusterIds: string[] = activeCluster
    ? [activeCluster.id]
    : activeTopic
      ? topicClusters.map((c) => c.id)
      : chapterTopics.flatMap((t) => (clustersByTopic.get(t.id) ?? []).map((c) => c.id))

  const initialTiles = await loadTilesForClusters(supabase, tileClusterIds)

  const validQuestionIds = new Set(initialTiles.map((t) => t.questionId))
  const question =
    qParam && validQuestionIds.has(qParam)
      ? await loadQuestionNew(supabase, qParam)
      : null

  return (
    <OefenenClient
      key={activeCategory ?? 'none'}
      chapters={visibleChapters}
      allTopics={allTopics}
      allClusters={allClusters}
      showCategories={showCategories}
      activeCategory={activeCategory}
      categoryOrder={CATEGORY_ORDER}
      categoryLabels={CATEGORY_LABELS}
      initialChapterSlug={activeChapter?.slug ?? null}
      initialTopicSlug={activeTopic?.slug ?? null}
      initialClusterSlug={activeCluster?.slug ?? null}
      initialTiles={initialTiles}
      question={question}
      labels={{
        chapterLabel: t('chapterLabel'),
        h1: t('h1'),
        difficultyHint: t('difficultyHint'),
        tilesHeading: t('tilesHeading'),
        tilesSortedBy: t('tilesSortedBy'),
        tileLastCorrect: t('tileLastCorrect'),
        tileLastWrong: t('tileLastWrong'),
        tileNotTried: t('tileNotTried'),
        tileExercise: t('tileExercise'),
        backToAll: t('backToAll'),
        noExercises: t('noExercises'),
      }}
    />
  )
}
