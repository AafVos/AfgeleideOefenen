import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { Card } from '@/components/ui'
import {
  loadChapters,
  loadAllTopics,
  loadClustersForTopics,
  loadTilesForClusters,
  loadQuestionNew,
  type ClusterInfo,
} from '@/lib/practice/chapter-overview'
import { createClient } from '@/lib/supabase/server'

import { ExerciseTileGrid, type TileSection } from './exercise-tile-grid'
import { StudyCard } from './study-card'

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
  const chapterParam = params.chapter?.trim() ?? null
  const topicParam = params.topic?.trim() ?? null
  const clusterParam = params.cluster?.trim() ?? null
  const qParam = params.q?.trim() ?? null

  const [chapters, allTopics] = await Promise.all([
    loadChapters(supabase),
    loadAllTopics(supabase),
  ])

  // Resolve active chapter
  const activeChapter =
    (chapterParam ? chapters.find((c) => c.slug === chapterParam) : null) ??
    chapters[0] ??
    null

  // Topics for active chapter
  const chapterTopics = activeChapter
    ? allTopics.filter((t) => t.chapter_id === activeChapter.id)
    : []

  // Resolve active topic (must belong to active chapter)
  const activeTopic = topicParam
    ? (chapterTopics.find((t) => t.slug === topicParam) ?? null)
    : null

  // Load all clusters for the active chapter (needed for both sidebar counts and tile loading)
  const allChapterClusters =
    chapterTopics.length > 0
      ? await loadClustersForTopics(supabase, chapterTopics.map((t) => t.id))
      : []

  // Group clusters by topic for sidebar and filtering
  const clustersByTopic = new Map<string, ClusterInfo[]>()
  for (const cl of allChapterClusters) {
    const arr = clustersByTopic.get(cl.topic_id) ?? []
    arr.push(cl)
    clustersByTopic.set(cl.topic_id, arr)
  }

  // Clusters for active topic
  const clusters = activeTopic
    ? (clustersByTopic.get(activeTopic.id) ?? [])
    : []

  // Resolve active cluster
  const activeCluster = clusterParam
    ? (clusters.find((c) => c.slug === clusterParam) ?? null)
    : null

  // Determine which cluster IDs to load tiles for based on selection depth
  const tileClusterIds: string[] = activeCluster
    ? [activeCluster.id]
    : activeTopic
      ? clusters.map((c) => c.id)
      : allChapterClusters.map((c) => c.id)

  const tiles = await loadTilesForClusters(supabase, tileClusterIds)

  // Build display sections (groups by topic → cluster at chapter level,
  // by cluster at topic level, flat at cluster level)
  const tileSections: TileSection[] = (() => {
    if (activeCluster) {
      return [{ subSections: [{ label: '', tiles }] }]
    }

    const clusterInfoById = new Map(allChapterClusters.map((cl) => [cl.id, cl]))

    if (activeTopic) {
      // One sub-section per cluster
      return clusters
        .map((cl) => ({
          subSections: [{
            label: cl.title,
            tiles: tiles.filter((t) => t.clusterId === cl.id),
          }],
        }))
        .filter((s) => s.subSections[0].tiles.length > 0)
    }

    // Chapter level: one section per topic, sub-sections per cluster
    return chapterTopics
      .map((tp) => {
        const tpClusters = clustersByTopic.get(tp.id) ?? []
        const subSections = tpClusters
          .map((cl) => ({
            label: tpClusters.length > 1 ? cl.title : '',
            tiles: tiles.filter((t) => t.clusterId === cl.id),
          }))
          .filter((ss) => ss.tiles.length > 0)
        return { label: tp.title, subSections }
      })
      .filter((s) => s.subSections.length > 0)
  })()

  // Load active question — only if it's in the current tile set
  const validQuestionIds = new Set(tiles.map((t) => t.questionId))
  const question =
    qParam && validQuestionIds.has(qParam)
      ? await loadQuestionNew(supabase, qParam)
      : null

  // Build base URL for tile hrefs
  const baseHref = [
    `/oefenen?chapter=${encodeURIComponent(activeChapter?.slug ?? '')}`,
    activeTopic ? `topic=${encodeURIComponent(activeTopic.slug)}` : null,
    activeCluster ? `cluster=${encodeURIComponent(activeCluster.slug)}` : null,
  ]
    .filter(Boolean)
    .join('&')

  // Next tile for auto-advance
  const currentIdx = question
    ? tiles.findIndex((tile) => tile.questionId === question.id)
    : -1
  const nextTile = tiles[(currentIdx + 1) % tiles.length] ?? tiles[0]
  const nextHref = nextTile
    ? `${baseHref}&q=${encodeURIComponent(nextTile.questionId)}#oefenen-practice`
    : baseHref

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="border-b border-border bg-surface p-4 lg:w-64 lg:border-b-0 lg:border-r lg:overflow-y-auto lg:py-8">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('chapterLabel')}
        </p>
        <ul className="mt-3 space-y-0.5">
          {chapters.map((ch) => {
            const chActive = ch.id === activeChapter?.id
            const chTopics = allTopics.filter((tp) => tp.chapter_id === ch.id)
            const hasTopics = chTopics.length > 0
            return (
              <li key={ch.id}>
                {/* Chapter row */}
                <Link
                  href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}`}
                  className={
                    chActive
                      ? 'flex items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                      : 'flex items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                  }
                >
                  {hasTopics && (
                    <svg
                      className={`hidden size-3 shrink-0 transition-transform lg:block ${chActive ? 'rotate-90' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8 5l8 7-8 7V5z" />
                    </svg>
                  )}
                  {!hasTopics && <span className="hidden size-3 lg:block" />}
                  <span className="truncate">
                    <span className="font-mono font-semibold">{ch.slug.toUpperCase()}</span>
                    {' – '}{ch.title}
                  </span>
                </Link>

                {/* Topics under active chapter */}
                {chActive && chTopics.length > 0 && (
                  <ul className="mt-0.5 mb-1">
                    {chTopics.map((tp) => {
                      const tpActive = tp.id === activeTopic?.id
                      const tpClusters = clustersByTopic.get(tp.id) ?? []

                      // Single-cluster topic: render the cluster directly at topic level
                      if (tpClusters.length === 1) {
                        const onlyCluster = tpClusters[0]!
                        const isActive = tpActive && activeCluster?.id === onlyCluster.id
                        return (
                          <li key={tp.id}>
                            <Link
                              href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}&topic=${encodeURIComponent(tp.slug)}&cluster=${encodeURIComponent(onlyCluster.slug)}`}
                              className={
                                isActive
                                  ? 'flex items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                  : 'flex items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
                              }
                            >
                              <span
                                className={`size-1.5 shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-border'}`}
                              />
                              <span className="truncate">{onlyCluster.title}</span>
                            </Link>
                          </li>
                        )
                      }

                      const hasClusters = tpClusters.length > 0
                      return (
                        <li key={tp.id}>
                          <Link
                            href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}&topic=${encodeURIComponent(tp.slug)}`}
                            className={
                              tpActive
                                ? 'flex items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                : 'flex items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
                            }
                          >
                            {hasClusters ? (
                              <svg
                                className={`size-2.5 shrink-0 transition-transform ${tpActive ? 'rotate-90' : ''}`}
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                aria-hidden
                              >
                                <path d="M8 5l8 7-8 7V5z" />
                              </svg>
                            ) : (
                              <span className="size-2.5 shrink-0" />
                            )}
                            <span className="truncate">{tp.title}</span>
                          </Link>

                          {/* Clusters under active topic */}
                          {tpActive && tpClusters.length > 0 && (
                            <ul className="mb-0.5">
                              {tpClusters.map((cl) => {
                                const clActive = cl.id === activeCluster?.id
                                return (
                                  <li key={cl.id}>
                                    <Link
                                      href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}&topic=${encodeURIComponent(tp.slug)}&cluster=${encodeURIComponent(cl.slug)}`}
                                      className={
                                        clActive
                                          ? 'flex items-center gap-2 rounded-md py-1 pl-12 pr-3 text-xs font-medium text-accent'
                                          : 'flex items-center gap-2 rounded-md py-1 pl-12 pr-3 text-xs text-text-muted hover:text-text'
                                      }
                                    >
                                      <span
                                        className={`size-1.5 shrink-0 rounded-full ${clActive ? 'bg-accent' : 'bg-border'}`}
                                      />
                                      <span className="truncate">{cl.title}</span>
                                    </Link>
                                  </li>
                                )
                              })}
                            </ul>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </aside>

      {/* ── Main content ────────────────────────────────────────────── */}
      <div className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {t('h1')}
          </p>
          <h1 className="font-serif text-2xl text-text">
            {activeCluster?.title ??
              activeTopic?.title ??
              activeChapter?.title ??
              t('h1')}
          </h1>
          {tiles.length > 0 && !question && (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">
              {t('difficultyHint')}
            </p>
          )}

          {/* Tile grid — shown whenever there are tiles and no question is open */}
          {tiles.length > 0 && (
            <ExerciseTileGrid
              baseHref={baseHref}
              sections={tileSections}
              activeQuestionId={question?.id ?? null}
              labels={{
                heading: t('tilesHeading'),
                sortedBy: t('tilesSortedBy'),
                easy: t('easy'),
                medium: t('medium'),
                hard: t('hard'),
                lastCorrect: t('tileLastCorrect'),
                lastWrong: t('tileLastWrong'),
                notTried: t('tileNotTried'),
                exercise: t('tileExercise'),
                level: t('tileLevel'),
              }}
            />
          )}

          {/* Practice card */}
          {question ? (
            <section
              id="oefenen-practice"
              className="mt-10 scroll-mt-[var(--sticky-offset,6rem)]"
            >
              <div className="mb-4">
                <Link
                  href={baseHref as '/oefenen'}
                  className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                >
                  {t('backToAll')}
                </Link>
              </div>
              <StudyCard
                key={question.id}
                question={question}
                steps={question.steps}
                nextHref={nextHref}
                questionNumber={currentIdx >= 0 ? tiles[currentIdx].ordinal : undefined}
              />
            </section>
          ) : qParam && !question ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{t('notFound')}</p>
              <Link
                href={baseHref as '/oefenen'}
                className="mt-4 inline-block text-sm font-medium text-accent underline-offset-2 hover:underline"
              >
                {t('backToAll')}
              </Link>
            </Card>
          ) : tiles.length === 0 && activeChapter ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{t('noExercises')}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
