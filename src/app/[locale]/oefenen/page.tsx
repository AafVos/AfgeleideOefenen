import { getTranslations } from 'next-intl/server'

import {
  loadAllTopics,
  loadClustersForTopics,
  loadParagraphs,
  loadTheoryBlocks,
  loadTilesForClusters,
  loadQuestionNew,
  type ClusterInfo,
} from '@/lib/practice/chapter-overview'
import {
  clusterIdsVoorSelectie,
  losSelectieOp,
  oefenIndeling,
} from '@/lib/practice/oefenen-indeling'
import { THEORY_OVERVIEW } from '@/content/theory/afgeleiden'
import { canoniek, deelkaart } from '@/lib/seo'
import { getChapters } from '@/lib/supabase/request-cache'
import { requireUser } from '@/lib/supabase/require-user'
import { createClient } from '@/lib/supabase/server'

import { OefenenClient } from './oefenen-client'

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ chapter?: string }>
}) {
  const { locale } = await params
  const chapter = (await searchParams)?.chapter?.trim()
  const hoofdstuk = THEORY_OVERVIEW.find((item) => item.slug === chapter)
  const t = await getTranslations({ locale, namespace: 'FreeExercise' })
  const title = hoofdstuk?.title ?? t('title')
  const description = hoofdstuk
    ? `Oefen ${hoofdstuk.title} voor wiskunde B. Gratis, met uitleg bij elke fout.`
    : 'Differentiëren oefenen per hoofdstuk, met uitleg bij elke fout.'
  return {
    title,
    description,
    alternates: canoniek(locale, '/oefenen'),
    openGraph: deelkaart(locale, '/oefenen', { title, description }),
  }
}

type PageProps = {
  searchParams?: Promise<{
    chapter?: string
    topic?: string
    cluster?: string
    blok?: string
    q?: string
  }>
}

export default async function OefenenPage(props: PageProps) {
  if (oefenIndeling() === 'onderwerp') return <OnderwerpPagina {...props} />
  return <BlokPagina {...props} />
}

async function OnderwerpPagina({ searchParams }: PageProps) {
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

  const allClusters = await loadClustersForTopics(
    supabase,
    allTopics.map((topic) => topic.id),
  )

  const activeChapter =
    (chapterParam ? visibleChapters.find((c) => c.slug === chapterParam) : null) ??
    visibleChapters[0] ??
    null

  const chapterTopics = activeChapter
    ? allTopics.filter((topic) => topic.chapter_id === activeChapter.id)
    : []

  const activeTopic = topicParam
    ? (chapterTopics.find((topic) => topic.slug === topicParam) ?? null)
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
      : chapterTopics.flatMap((topic) => (clustersByTopic.get(topic.id) ?? []).map((c) => c.id))

  const allClusterIdsOrdered = visibleChapters.flatMap((ch) =>
    allTopics
      .filter((topic) => topic.chapter_id === ch.id)
      .flatMap((topic) => (clustersByTopic.get(topic.id) ?? []).map((c) => c.id)),
  )
  const allTiles = await loadTilesForClusters(supabase, allClusterIdsOrdered)

  const tileClusterIdSet = new Set(tileClusterIds)
  const initialTiles = allTiles
    .filter((tile) => tileClusterIdSet.has(tile.clusterId))
    .map((tile, i) => ({ ...tile, ordinal: i + 1 }))

  const validQuestionIds = new Set(initialTiles.map((tile) => tile.questionId))
  const question =
    qParam && validQuestionIds.has(qParam) ? await loadQuestionNew(supabase, qParam) : null

  return (
    <OefenenClient
      indeling="onderwerp"
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

async function BlokPagina({ searchParams }: PageProps) {
  const supabase = await createClient()
  await requireUser()

  const params = (await searchParams) ?? {}
  const adres = {
    blok: params.blok?.trim() || null,
    topic: params.topic?.trim() || null,
    cluster: params.cluster?.trim() || null,
    chapter: params.chapter?.trim() || null,
  }
  const qParam = params.q?.trim() ?? null

  const [t, chapters, allTopics, paragraphs, blocks] = await Promise.all([
    getTranslations('FreeExercise'),
    getChapters(),
    loadAllTopics(supabase),
    loadParagraphs(supabase),
    loadTheoryBlocks(supabase),
  ])

  const allClusters = await loadClustersForTopics(
    supabase,
    allTopics.map((topic) => topic.id),
  )
  const allClusterIds = chapters.flatMap((ch) =>
    allTopics
      .filter((topic) => topic.chapter_id === ch.id)
      .flatMap((topic) =>
        allClusters.filter((cl) => cl.topic_id === topic.id).map((cl) => cl.id),
      ),
  )
  const allTiles = await loadTilesForClusters(supabase, allClusterIds)

  const data = {
    chapters,
    paragraphs,
    blocks,
    topics: allTopics,
    clusters: allClusters,
    tiles: allTiles,
  }
  const selectie = losSelectieOp(adres, data)
  const scope = new Set(
    selectie ? clusterIdsVoorSelectie(selectie, allTopics, allClusters) : [],
  )
  const question =
    qParam && allTiles.some((tile) => tile.questionId === qParam && scope.has(tile.clusterId))
      ? await loadQuestionNew(supabase, qParam)
      : null

  return (
    <OefenenClient
      indeling="blok"
      chapters={chapters}
      paragraphs={paragraphs}
      blocks={blocks}
      allTopics={allTopics}
      allClusters={allClusters}
      adres={adres}
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
        oudeOpgaven: 'Oude opgaven',
        nogGeenOpgaven: 'nog geen opgaven',
        kiesOnderdeel: 'Kies een onderdeel',
        sluiten: 'Sluiten',
      }}
    />
  )
}
