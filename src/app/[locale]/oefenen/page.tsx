import { getTranslations } from 'next-intl/server'

import {
  loadAllTopics,
  loadClustersForTopics,
  loadTilesForClusters,
  loadQuestionNew,
  type ClusterInfo,
} from '@/lib/practice/chapter-overview'
import { canoniek } from '@/lib/seo'
import { getChapters } from '@/lib/supabase/request-cache'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { OefenenClient } from './oefenen-client'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'FreeExercise' })
  return { title: t('title'), alternates: canoniek(locale, '/oefenen') }
}

type PageProps = {
  searchParams?: Promise<{
    chapter?: string
    topic?: string
    cluster?: string
    q?: string
  }>
}

export default async function OefenenPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  await requireUser()

  const params = (await searchParams) ?? {}
  const chapterParam = params.chapter?.trim() ?? null
  const topicParam = params.topic?.trim() ?? null
  const clusterParam = params.cluster?.trim() ?? null
  const qParam = params.q?.trim() ?? null

  const [t, visibleChapters, allTopics] = await Promise.all([
    getTranslations('FreeExercise'),
    getChapters(),
    loadAllTopics(supabase),
  ])

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

  // Alle opgaven van alle zichtbare hoofdstukken (overzicht + navigator)
  const allClusterIdsOrdered = visibleChapters.flatMap((ch) =>
    allTopics
      .filter((t) => t.chapter_id === ch.id)
      .flatMap((t) => (clustersByTopic.get(t.id) ?? []).map((c) => c.id)),
  )
  const allTiles = await loadTilesForClusters(supabase, allClusterIdsOrdered)

  // Starttegels afleiden uit allTiles i.p.v. een tweede query; de client
  // hernummert bij navigatie op dezelfde manier (zie chapterGroups)
  const tileClusterIdSet = new Set(tileClusterIds)
  const initialTiles = allTiles
    .filter((tile) => tileClusterIdSet.has(tile.clusterId))
    .map((tile, i) => ({ ...tile, ordinal: i + 1 }))

  const validQuestionIds = new Set(initialTiles.map((t) => t.questionId))
  const question =
    qParam && validQuestionIds.has(qParam)
      ? await loadQuestionNew(supabase, qParam)
      : null

  return (
    <OefenenClient
      chapters={visibleChapters}
      allTopics={allTopics}
      allClusters={allClusters}
      initialChapterSlug={activeChapter?.slug ?? null}
      initialTopicSlug={activeTopic?.slug ?? null}
      initialClusterSlug={activeCluster?.slug ?? null}
      initialTiles={initialTiles}
      allTiles={allTiles}
      question={question}
      labels={{
        chapterLabel: t('chapterLabel'),
        h1: t('h1'),
        difficultyHint: t('difficultyHint'),
        tilesHeading: t('tilesHeading'),
        tileLastCorrect: t('tileLastCorrect'),
        tileLastWrong: t('tileLastWrong'),
        tileNotTried: t('tileNotTried'),
        tileExercise: t('tileExercise'),
        backToAll: t('backToAll'),
        noExercises: t('noExercises'),
        questionsNav: t('questionsNav'),
        collapseSidebar: t('collapseSidebar'),
        expandSidebar: t('expandSidebar'),
      }}
    />
  )
}
