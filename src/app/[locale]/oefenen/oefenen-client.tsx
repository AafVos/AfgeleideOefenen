'use client'

import { useMemo, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { Card } from '@/components/ui'
import type {
  ChapterInfo,
  ClusterInfo,
  NewExerciseTile,
  TopicCategory,
  TopicInfo,
} from '@/lib/practice/chapter-overview'

import { ExerciseTileGrid, type TileSection } from './exercise-tile-grid'
import { StudyCard } from './study-card'

type Question = {
  id: string
  latex_body: string | null
  difficulty: 1 | 2 | 3
  steps: Array<{ id: string; step_order: number; step_description: string }>
}

type Labels = {
  chapterLabel: string
  h1: string
  difficultyHint: string
  tilesHeading: string
  tilesSortedBy: string
  tileLastCorrect: string
  tileLastWrong: string
  tileNotTried: string
  tileExercise: string
  backToAll: string
  noExercises: string
}

type Props = {
  chapters: ChapterInfo[]
  allTopics: TopicInfo[]
  allClusters: ClusterInfo[]
  showCategories: boolean
  activeCategory: TopicCategory | null
  categoryOrder: TopicCategory[]
  categoryLabels: Record<TopicCategory, string>
  initialChapterSlug: string | null
  initialTopicSlug: string | null
  initialClusterSlug: string | null
  initialTiles: NewExerciseTile[]
  question: Question | null
  labels: Labels
}

function buildClustersByTopic(clusters: ClusterInfo[]): Map<string, ClusterInfo[]> {
  const map = new Map<string, ClusterInfo[]>()
  for (const cl of clusters) {
    const arr = map.get(cl.topic_id) ?? []
    arr.push(cl)
    map.set(cl.topic_id, arr)
  }
  return map
}

function computeSections(
  tiles: NewExerciseTile[],
  chapterTopics: TopicInfo[],
  clustersByTopic: Map<string, ClusterInfo[]>,
  selectedTopic: TopicInfo | null,
  selectedCluster: ClusterInfo | null,
): TileSection[] {
  if (selectedCluster) {
    return [{ subSections: [{ label: '', tiles }] }]
  }
  if (selectedTopic) {
    const clusters = clustersByTopic.get(selectedTopic.id) ?? []
    return clusters
      .map((cl) => ({
        subSections: [{ label: cl.title, tiles: tiles.filter((t) => t.clusterId === cl.id) }],
      }))
      .filter((s) => s.subSections[0].tiles.length > 0)
  }
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
}

export function OefenenClient({
  chapters,
  allTopics,
  allClusters,
  showCategories,
  activeCategory,
  categoryOrder,
  categoryLabels,
  initialChapterSlug,
  initialTopicSlug,
  initialClusterSlug,
  initialTiles,
  question,
  labels,
}: Props) {
  const clustersByTopic = useMemo(() => buildClustersByTopic(allClusters), [allClusters])

  const initChapter = useMemo(
    () =>
      (initialChapterSlug ? chapters.find((c) => c.slug === initialChapterSlug) : null) ??
      chapters[0] ??
      null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [selectedChapter, setSelectedChapter] = useState<ChapterInfo | null>(initChapter)
  const [selectedChapterIds, setExpandedChapterIds] = useState<Set<string>>(
    () => new Set(initChapter ? [initChapter.id] : []),
  )
  const [selectedTopicSlug, setSelectedTopicSlug] = useState<string | null>(
    initialTopicSlug ?? null,
  )
  const [selectedClusterSlug, setSelectedClusterSlug] = useState<string | null>(
    initialClusterSlug ?? null,
  )
  const [tiles, setTiles] = useState<NewExerciseTile[]>(initialTiles)
  const [loadingTiles, setLoadingTiles] = useState(false)

  function isChapterExpanded(chapterId: string): boolean {
    return selectedChapterIds.has(chapterId) || selectedChapter?.id === chapterId
  }

  function expandChapter(chapterId: string) {
    setExpandedChapterIds((prev) => {
      if (prev.has(chapterId)) return prev
      const next = new Set(prev)
      next.add(chapterId)
      return next
    })
  }

  function toggleChapterExpansion(chapterId: string) {
    if (selectedChapter?.id === chapterId) return
    setExpandedChapterIds((prev) => {
      const next = new Set(prev)
      if (next.has(chapterId)) next.delete(chapterId)
      else next.add(chapterId)
      return next
    })
  }

  const chapterTopics = useMemo(
    () => (selectedChapter ? allTopics.filter((t) => t.chapter_id === selectedChapter.id) : []),
    [allTopics, selectedChapter],
  )

  const selectedTopic = useMemo(
    () =>
      selectedTopicSlug ? (chapterTopics.find((t) => t.slug === selectedTopicSlug) ?? null) : null,
    [chapterTopics, selectedTopicSlug],
  )

  const topicClusters = useMemo(
    () => (selectedTopic ? (clustersByTopic.get(selectedTopic.id) ?? []) : []),
    [clustersByTopic, selectedTopic],
  )

  const selectedCluster = useMemo(
    () =>
      selectedClusterSlug
        ? (topicClusters.find((c) => c.slug === selectedClusterSlug) ?? null)
        : null,
    [topicClusters, selectedClusterSlug],
  )

  const catQS = activeCategory ? `category=${encodeURIComponent(activeCategory)}&` : ''
  const baseHref = `/oefenen?${catQS}chapter=${encodeURIComponent(selectedChapter?.slug ?? '')}${
    selectedTopic ? `&topic=${encodeURIComponent(selectedTopic.slug)}` : ''
  }${selectedCluster ? `&cluster=${encodeURIComponent(selectedCluster.slug)}` : ''}`

  const tileSections = useMemo(
    () => computeSections(tiles, chapterTopics, clustersByTopic, selectedTopic, selectedCluster),
    [tiles, chapterTopics, clustersByTopic, selectedTopic, selectedCluster],
  )

  const currentIdx = question ? tiles.findIndex((t) => t.questionId === question.id) : -1
  const nextTile = tiles[(currentIdx + 1) % tiles.length] ?? tiles[0] ?? null
  const nextHref = nextTile
    ? `${baseHref}&q=${encodeURIComponent(nextTile.questionId)}#oefenen-practice`
    : baseHref

  async function fetchTiles(clusterIds: string[]) {
    if (!clusterIds.length) {
      setTiles([])
      return
    }
    setLoadingTiles(true)
    try {
      const res = await fetch(`/api/oefenen/tiles?clusterIds=${clusterIds.join(',')}`)
      if (res.ok) setTiles(await res.json())
    } finally {
      setLoadingTiles(false)
    }
  }

  function clusterIdsFor(topicIds: string[]): string[] {
    return allClusters.filter((cl) => topicIds.includes(cl.topic_id)).map((cl) => cl.id)
  }

  function handleChapterClick(ch: ChapterInfo) {
    if (ch.id === selectedChapter?.id) {
      toggleChapterExpansion(ch.id)
      return
    }
    setSelectedChapter(ch)
    expandChapter(ch.id)
    setSelectedTopicSlug(null)
    setSelectedClusterSlug(null)
    const topics = allTopics.filter((t) => t.chapter_id === ch.id)
    fetchTiles(clusterIdsFor(topics.map((t) => t.id)))
  }

  function handleTopicClick(tp: TopicInfo) {
    const tpChapter = chapters.find((c) => c.id === tp.chapter_id) ?? null
    const sameChapter = tpChapter?.id === selectedChapter?.id

    if (tp.slug === selectedTopicSlug && sameChapter) {
      setSelectedTopicSlug(null)
      setSelectedClusterSlug(null)
      const topics = allTopics.filter((t) => t.chapter_id === selectedChapter!.id)
      fetchTiles(clusterIdsFor(topics.map((t) => t.id)))
      return
    }

    if (tpChapter && !sameChapter) {
      setSelectedChapter(tpChapter)
      expandChapter(tpChapter.id)
    }
    setSelectedTopicSlug(tp.slug)
    setSelectedClusterSlug(null)
    fetchTiles((clustersByTopic.get(tp.id) ?? []).map((cl) => cl.id))
  }

  function handleClusterClick(cl: ClusterInfo, tp: TopicInfo) {
    const tpChapter = chapters.find((c) => c.id === tp.chapter_id) ?? null
    const sameChapter = tpChapter?.id === selectedChapter?.id

    if (cl.slug === selectedClusterSlug && sameChapter) {
      setSelectedClusterSlug(null)
      fetchTiles((clustersByTopic.get(tp.id) ?? []).map((c) => c.id))
      return
    }

    if (tpChapter && !sameChapter) {
      setSelectedChapter(tpChapter)
      expandChapter(tpChapter.id)
    }
    setSelectedTopicSlug(tp.slug)
    setSelectedClusterSlug(cl.slug)
    fetchTiles([cl.id])
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:flex-row">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
      <aside className="overflow-x-auto border-b border-border bg-surface p-4 lg:w-64 lg:overflow-x-visible lg:border-b-0 lg:border-r lg:overflow-y-auto lg:py-8">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {labels.chapterLabel}
        </p>
        <ul className="mt-3 space-y-0.5">
          {chapters.map((ch) => {
            const chActive = ch.id === selectedChapter?.id
            const chOpen = isChapterExpanded(ch.id)
            const chTopics = allTopics.filter((tp) => tp.chapter_id === ch.id)
            return (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => handleChapterClick(ch)}
                  className={
                    chActive
                      ? 'flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                      : 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                  }
                >
                  {chTopics.length > 0 ? (
                    <svg
                      className={`hidden size-3 shrink-0 transition-transform lg:block ${chOpen ? 'rotate-90' : ''}`}
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden
                    >
                      <path d="M8 5l8 7-8 7V5z" />
                    </svg>
                  ) : (
                    <span className="hidden size-3 lg:block" />
                  )}
                  <span className="truncate text-left">
                    <span className="font-mono font-semibold">{ch.slug.toUpperCase()}</span>
                    {' – '}
                    {ch.title}
                  </span>
                </button>

                {chOpen && chTopics.length > 0 && (
                  <ul className="mb-1 mt-0.5">
                    {chTopics.map((tp) => {
                      const tpActive = tp.id === selectedTopic?.id
                      const tpClusters = clustersByTopic.get(tp.id) ?? []

                      if (tpClusters.length === 1) {
                        const onlyCluster = tpClusters[0]!
                        const isActive = tpActive && selectedCluster?.id === onlyCluster.id
                        return (
                          <li key={tp.id}>
                            <button
                              type="button"
                              onClick={() => handleClusterClick(onlyCluster, tp)}
                              className={
                                isActive
                                  ? 'flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                  : 'flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
                              }
                            >
                              <span
                                className={`size-1.5 shrink-0 rounded-full ${isActive ? 'bg-accent' : 'bg-border'}`}
                              />
                              <span className="truncate text-left">{onlyCluster.title}</span>
                            </button>
                          </li>
                        )
                      }

                      return (
                        <li key={tp.id}>
                          <button
                            type="button"
                            onClick={() => handleTopicClick(tp)}
                            className={
                              tpActive
                                ? 'flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                : 'flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
                            }
                          >
                            {tpClusters.length > 0 ? (
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
                            <span className="truncate text-left">{tp.title}</span>
                          </button>

                          {tpActive && tpClusters.length > 0 && (
                            <ul className="mb-0.5">
                              {tpClusters.map((cl) => {
                                const clActive = cl.id === selectedCluster?.id
                                return (
                                  <li key={cl.id}>
                                    <button
                                      type="button"
                                      onClick={() => handleClusterClick(cl, tp)}
                                      className={
                                        clActive
                                          ? 'flex w-full items-center gap-2 rounded-md py-1 pl-8 pr-3 text-xs font-medium text-accent'
                                          : 'flex w-full items-center gap-2 rounded-md py-1 pl-8 pr-3 text-xs text-text-muted hover:text-text'
                                      }
                                    >
                                      <span
                                        className={`size-1.5 shrink-0 rounded-full ${clActive ? 'bg-accent' : 'bg-border'}`}
                                      />
                                      <span className="truncate text-left">{cl.title}</span>
                                    </button>
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
        {showCategories && (
          <nav className="border-b border-border bg-surface">
            <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4">
              {categoryOrder.map((cat) => {
                const catActive = cat === activeCategory
                return (
                  <Link
                    key={cat}
                    href={`/oefenen?category=${encodeURIComponent(cat)}` as '/oefenen'}
                    className={
                      catActive
                        ? 'border-b-2 border-accent px-4 py-3 text-sm font-medium text-accent'
                        : 'border-b-2 border-transparent px-4 py-3 text-sm text-text-muted hover:text-text'
                    }
                  >
                    {categoryLabels[cat]}
                  </Link>
                )
              })}
            </div>
          </nav>
        )}

        <div className="mx-auto max-w-6xl px-4 py-8">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">{labels.h1}</p>
          <h1 className="font-serif text-2xl text-text">
            {selectedCluster?.title ?? selectedTopic?.title ?? selectedChapter?.title ?? labels.h1}
          </h1>

          {!question && !loadingTiles && tiles.length > 0 && (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">{labels.difficultyHint}</p>
          )}

          {loadingTiles && (
            <p className="mt-10 text-sm text-text-muted" aria-live="polite">
              Laden…
            </p>
          )}

          {!loadingTiles && tiles.length > 0 && (
            <ExerciseTileGrid
              baseHref={baseHref}
              sections={tileSections}
              activeQuestionId={question?.id ?? null}
              labels={{
                heading: labels.tilesHeading,
                sortedBy: labels.tilesSortedBy,
                lastCorrect: labels.tileLastCorrect,
                lastWrong: labels.tileLastWrong,
                notTried: labels.tileNotTried,
                exercise: labels.tileExercise,
              }}
            />
          )}

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
                  {labels.backToAll}
                </Link>
              </div>
              <StudyCard
                key={question.id}
                question={question}
                steps={question.steps}
                nextHref={nextHref}
                questionNumber={currentIdx >= 0 ? (tiles[currentIdx]?.ordinal ?? undefined) : undefined}
                onAnswered={(questionId, isCorrect) =>
                  setTiles((prev) =>
                    prev.map((t) =>
                      t.questionId === questionId ? { ...t, lastCorrect: isCorrect } : t,
                    ),
                  )
                }
              />
            </section>
          ) : !loadingTiles && tiles.length === 0 && selectedChapter ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{labels.noExercises}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
