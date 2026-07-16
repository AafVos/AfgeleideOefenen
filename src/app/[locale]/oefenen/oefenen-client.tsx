'use client'

import { useMemo, useRef, useState } from 'react'

import { Link, useRouter } from '@/i18n/navigation'
import { Card, cn } from '@/components/ui'
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

type ChapterGroup = {
  chapter: ChapterInfo
  tiles: NewExerciseTile[]
  sections: TileSection[]
}

type Labels = {
  chapterLabel: string
  h1: string
  difficultyHint: string
  tilesHeading: string
  tileLastCorrect: string
  tileLastWrong: string
  tileNotTried: string
  tileExercise: string
  backToAll: string
  noExercises: string
  questionsNav: string
  collapseSidebar: string
  expandSidebar: string
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
  allTiles: NewExerciseTile[]
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

function sectionId(chapterSlug: string, topicSlug: string): string {
  return `sect-${chapterSlug}-${topicSlug}`
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
  allTiles,
  question,
  labels,
}: Props) {
  const router = useRouter()
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
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [allTilesState, setAllTilesState] = useState<NewExerciseTile[]>(allTiles)

  // URL-navigatie (bijv. via de opgaven-navigator naar een ander hoofdstuk)
  // is leidend: synchroniseer de client-selectie met de nieuwe props.
  const urlKey = `${initialChapterSlug}|${initialTopicSlug}|${initialClusterSlug}`
  const [syncedUrlKey, setSyncedUrlKey] = useState(urlKey)
  if (urlKey !== syncedUrlKey) {
    setSyncedUrlKey(urlKey)
    const ch = initialChapterSlug
      ? (chapters.find((c) => c.slug === initialChapterSlug) ?? null)
      : null
    if (ch && ch.id !== selectedChapter?.id) {
      setSelectedChapter(ch)
      expandChapter(ch.id)
    }
    setSelectedTopicSlug(initialTopicSlug ?? null)
    setSelectedClusterSlug(initialClusterSlug ?? null)
    setTiles(initialTiles)
  }

  function isChapterExpanded(chapterId: string): boolean {
    return selectedChapterIds.has(chapterId)
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

  // Alle opgaven, gegroepeerd per hoofdstuk en per hoofdstuk genummerd
  const chapterGroups: ChapterGroup[] = useMemo(() => {
    const chapterIdByClusterId = new Map<string, string>()
    for (const cl of allClusters) {
      const tp = allTopics.find((t) => t.id === cl.topic_id)
      if (tp) chapterIdByClusterId.set(cl.id, tp.chapter_id)
    }
    return chapters
      .map((ch) => {
        const chTopics = allTopics.filter((t) => t.chapter_id === ch.id)
        const chTiles = allTilesState
          .filter((t) => chapterIdByClusterId.get(t.clusterId) === ch.id)
          .map((t, i) => ({ ...t, ordinal: i + 1 }))
        const sections: TileSection[] = chTopics
          .map((tp) => {
            const tpClusters = clustersByTopic.get(tp.id) ?? []
            const subSections = tpClusters
              .map((cl) => ({
                label: tpClusters.length > 1 ? cl.title : '',
                tiles: chTiles.filter((t) => t.clusterId === cl.id),
              }))
              .filter((ss) => ss.tiles.length > 0)
            return { id: sectionId(ch.slug, tp.slug), label: tp.title, subSections }
          })
          .filter((s) => s.subSections.length > 0)
        return { chapter: ch, tiles: chTiles, sections }
      })
      .filter((g) => g.tiles.length > 0)
  }, [chapters, allTopics, allClusters, allTilesState, clustersByTopic])

  const currentIdx = question ? tiles.findIndex((t) => t.questionId === question.id) : -1
  const nextTile = tiles[(currentIdx + 1) % tiles.length] ?? tiles[0] ?? null
  const nextHref = nextTile
    ? `${baseHref}&q=${encodeURIComponent(nextTile.questionId)}`
    : baseHref

  function chapterHref(slug: string): string {
    return `/oefenen?${catQS}chapter=${encodeURIComponent(slug)}`
  }

  // Scroll-spy: markeer in de zijbalk het hoofdstuk dat in beeld is
  const mainScrollRef = useRef<HTMLDivElement | null>(null)
  function handleMainScroll() {
    if (question) return
    const root = mainScrollRef.current
    if (!root) return
    const rootTop = root.getBoundingClientRect().top
    let current: ChapterInfo | null = null
    for (const g of chapterGroups) {
      const el = document.getElementById(`hoofdstuk-${g.chapter.slug}`)
      if (!el) continue
      if (el.getBoundingClientRect().top - rootTop <= 140) current = g.chapter
    }
    if (current && current.id !== selectedChapter?.id) {
      setSelectedChapter(current)
      setSelectedTopicSlug(null)
      setSelectedClusterSlug(null)
    }
  }

  /** Scroll naar een sectie in het overzicht; vanuit een vraag eerst terug navigeren. */
  function goToSection(id: string, chapterSlug: string) {
    if (question) {
      router.push(`${chapterHref(chapterSlug)}#${id}` as '/oefenen')
      return
    }
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleChapterClick(ch: ChapterInfo) {
    if (ch.id === selectedChapter?.id) {
      toggleChapterExpansion(ch.id)
    } else {
      setSelectedChapter(ch)
      expandChapter(ch.id)
      setSelectedTopicSlug(null)
      setSelectedClusterSlug(null)
    }
    goToSection(`hoofdstuk-${ch.slug}`, ch.slug)
  }

  function handleTopicClick(tp: TopicInfo) {
    const tpChapter = chapters.find((c) => c.id === tp.chapter_id) ?? null
    const sameChapter = tpChapter?.id === selectedChapter?.id

    if (tp.slug === selectedTopicSlug && sameChapter) {
      // Actief onderwerp opnieuw aanklikken: alleen inklappen in de zijbalk
      setSelectedTopicSlug(null)
      setSelectedClusterSlug(null)
      return
    }

    if (tpChapter && !sameChapter) {
      setSelectedChapter(tpChapter)
      expandChapter(tpChapter.id)
    }
    setSelectedTopicSlug(tp.slug)
    setSelectedClusterSlug(null)
    if (tpChapter) goToSection(sectionId(tpChapter.slug, tp.slug), tpChapter.slug)
  }

  function handleClusterClick(cl: ClusterInfo, tp: TopicInfo) {
    const tpChapter = chapters.find((c) => c.id === tp.chapter_id) ?? null
    const sameChapter = tpChapter?.id === selectedChapter?.id

    if (tpChapter && !sameChapter) {
      setSelectedChapter(tpChapter)
      expandChapter(tpChapter.id)
    }
    setSelectedTopicSlug(tp.slug)
    setSelectedClusterSlug(cl.slug === selectedClusterSlug && sameChapter ? null : cl.slug)
    if (tpChapter) goToSection(sectionId(tpChapter.slug, tp.slug), tpChapter.slug)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar (staat vast; content scrolt zelf) ───────────────── */}
      <aside
        className={cn(
          'nice-scrollbar border-b border-border bg-surface lg:h-full lg:border-b-0 lg:border-r',
          sidebarOpen
            ? 'overflow-x-auto p-4 lg:w-64 lg:overflow-x-visible lg:overflow-y-auto lg:py-8'
            : 'p-2 lg:w-12 lg:py-4',
        )}
      >
        <div className={sidebarOpen ? 'flex items-center justify-between gap-2' : 'flex justify-center'}>
          {sidebarOpen && (
            <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {labels.chapterLabel}
            </p>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            title={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            className="rounded-md p-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
          >
            <svg
              viewBox="0 0 24 24"
              className={`size-4 transition-transform ${sidebarOpen ? '' : 'rotate-180'}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m11 17-5-5 5-5" />
              <path d="m18 17-5-5 5-5" />
            </svg>
          </button>
        </div>
        {sidebarOpen && (
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
        )}
      </aside>

      {/* ── Main content (eigen scroll-gebied) ──────────────────────── */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto"
      >
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
          <h1 className="sr-only">{labels.h1}</h1>

          {!question && chapterGroups.length > 0 && (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">{labels.difficultyHint}</p>
          )}

          {!question &&
            chapterGroups.map((g) => (
              <section
                key={g.chapter.id}
                id={`hoofdstuk-${g.chapter.slug}`}
                className="scroll-mt-4"
              >
                <h2 className="mt-20 border-b border-border pb-3 font-serif text-2xl text-text first:mt-6">
                  <span className="font-mono font-semibold">
                    {g.chapter.slug.toUpperCase()}
                  </span>
                  {' – '}
                  {g.chapter.title}
                </h2>
                <ExerciseTileGrid
                  baseHref={chapterHref(g.chapter.slug)}
                  sections={g.sections}
                  activeQuestionId={null}
                  labels={{
                    heading: labels.tilesHeading,
                    lastCorrect: labels.tileLastCorrect,
                    lastWrong: labels.tileLastWrong,
                    notTried: labels.tileNotTried,
                    exercise: labels.tileExercise,
                  }}
                />
              </section>
            ))}

          {question ? (
            <div className="mt-8 flex flex-col gap-8 lg:flex-row">
              {/* Vraag centraal */}
              <div className="min-w-0 flex-1">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-5">
                    <Link
                      href={baseHref as '/oefenen'}
                      aria-label={labels.backToAll}
                      title={labels.backToAll}
                      className="inline-flex text-text-muted transition hover:-translate-x-0.5 hover:text-text"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        className="size-7"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden
                      >
                        <path d="M19 12H5" />
                        <path d="m12 19-7-7 7-7" />
                      </svg>
                    </Link>
                  </div>
                  <StudyCard
                    key={question.id}
                    question={question}
                    steps={question.steps}
                    nextHref={nextHref}
                    questionNumber={
                      chapterGroups
                        .flatMap((g) => g.tiles)
                        .find((t) => t.questionId === question.id)?.ordinal ??
                      (currentIdx >= 0 ? (tiles[currentIdx]?.ordinal ?? undefined) : undefined)
                    }
                    onAnswered={(questionId, isCorrect) => {
                      setTiles((prev) =>
                        prev.map((t) =>
                          t.questionId === questionId ? { ...t, lastCorrect: isCorrect } : t,
                        ),
                      )
                      setAllTilesState((prev) =>
                        prev.map((t) =>
                          t.questionId === questionId ? { ...t, lastCorrect: isCorrect } : t,
                        ),
                      )
                    }}
                  />
                </div>
              </div>

              {/* Opgaven-navigatie rechts: alle hoofdstukken, scrollbaar */}
              <aside className="shrink-0 lg:sticky lg:top-0 lg:w-64 lg:self-start">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {labels.questionsNav}
                </p>
                <div className="nice-scrollbar mt-2 space-y-5 pt-1 lg:max-h-[calc(100vh-10rem)] lg:overflow-y-auto lg:pb-4 lg:pl-1 lg:pr-3">
                  {chapterGroups.map((g) => (
                    <div key={g.chapter.slug}>
                      <p className="text-xs font-medium text-text-muted">
                        <span className="font-mono font-semibold">
                          {g.chapter.slug.toUpperCase()}
                        </span>
                        {' – '}
                        {g.chapter.title}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {g.tiles.map((q) => {
                          const active = q.questionId === question.id
                          const inCurrentScope =
                            g.chapter.slug === selectedChapter?.slug &&
                            tiles.some((t) => t.questionId === q.questionId)
                          const href = inCurrentScope
                            ? `${baseHref}&q=${encodeURIComponent(q.questionId)}`
                            : `${chapterHref(g.chapter.slug)}&q=${encodeURIComponent(q.questionId)}`
                          return (
                            <Link
                              key={q.questionId}
                              href={href as '/oefenen'}
                              prefetch={false}
                              aria-current={active ? 'page' : undefined}
                              aria-label={`${g.chapter.slug.toUpperCase()} ${labels.tileExercise} ${q.ordinal}${q.lastCorrect === true ? ` ${labels.tileLastCorrect}` : ''}${q.lastCorrect === false ? ` ${labels.tileLastWrong}` : ''}`}
                              className={cn(
                                'flex size-9 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition',
                                active &&
                                  'ring-2 ring-offset-1 ring-offset-[var(--color-bg)]',
                                active &&
                                  (q.lastCorrect === true
                                    ? 'ring-emerald-500/80'
                                    : q.lastCorrect === false
                                      ? 'ring-rose-500/80'
                                      : 'ring-neutral-400'),
                                q.lastCorrect === true &&
                                  'border-emerald-300/70 bg-emerald-50 text-emerald-900 hover:border-emerald-400',
                                q.lastCorrect === false &&
                                  'border-rose-300/70 bg-rose-50/90 text-rose-900 hover:border-rose-400',
                                q.lastCorrect == null &&
                                  'border-border bg-surface text-text-muted hover:bg-surface-2 hover:text-text',
                              )}
                            >
                              {q.ordinal}
                            </Link>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </aside>
            </div>
          ) : chapterGroups.length === 0 ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{labels.noExercises}</p>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  )
}
