'use client'

import { unstable_rethrow } from 'next/navigation'
import {
  memo,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

import { DeelKnop } from '@/components/deel-knop'
import { KlikLink } from '@/components/klik-link'
import { Link, useRouter } from '@/i18n/navigation'
import { Card, cn } from '@/components/ui'
import type {
  ChapterInfo,
  ClusterInfo,
  NewExerciseTile,
  ParagraphInfo,
  TheoryBlockInfo,
  TopicInfo,
} from '@/lib/practice/chapter-overview'
import {
  ankerUitAdres,
  bouwBlokBoom,
  bouwOefenOverzicht,
  bouwOnderwerpBoom,
  kopjesVoorSelectie,
  losSelectieOp,
  naamVanSelectie,
  queryVoorSelectie,
  type Adres,
  type Kopje,
  type OverzichtHoofdstuk,
} from '@/lib/practice/oefenen-indeling'

import { hoofdstukCode } from '@/lib/hoofdstuk-code'
import {
  leesSoort,
  pastBijSoort,
  teltSoorten,
  toonSoortFilter,
  type SoortKeuze,
} from '@/lib/practice/soort-filter'
import { volgendeTegel } from '@/lib/practice/volgende-tegel'
import { getVideoForCluster } from '@/lib/videos'

import { ExerciseTileGrid, modifierVrijeKlik, type TileSection } from './exercise-tile-grid'
import { laadOpgave } from './laad-opgave'
import { SoortFilter } from './soort-filter'
import { StudyCard } from './study-card'

const SOORT_SLEUTEL = 'oefenen-soort'
const SOORT_EVENT = 'oefenen-soort'

function subscribeSoort(onChange: () => void) {
  window.addEventListener('popstate', onChange)
  window.addEventListener(SOORT_EVENT, onChange)
  return () => {
    window.removeEventListener('popstate', onChange)
    window.removeEventListener(SOORT_EVENT, onChange)
  }
}

/** Adres gaat voor. Staat daar niets, dan de keuze van de vorige keer. */
function leesSoortNu(): SoortKeuze {
  const uitAdres = leesSoort(new URLSearchParams(window.location.search).get('soort'))
  if (uitAdres) return uitAdres
  try {
    return leesSoort(localStorage.getItem(SOORT_SLEUTEL)) ?? 'alles'
  } catch {
    return 'alles'
  }
}

function useSoortKeuze(): [SoortKeuze, (soort: SoortKeuze) => void] {
  const soort = useSyncExternalStore(subscribeSoort, leesSoortNu, () => 'alles' as const)
  const kies = useCallback((volgende: SoortKeuze) => {
    try {
      localStorage.setItem(SOORT_SLEUTEL, volgende)
    } catch {
      // Privémodus kan opslaan weigeren. Het adres houdt de keuze dan bij.
    }
    const sp = new URLSearchParams(window.location.search)
    if (volgende === 'alles') sp.delete('soort')
    else sp.set('soort', volgende)
    const query = sp.toString()
    const pad = window.location.pathname
    const doel = query ? `${pad}?${query}` : pad
    if (`${pad}${window.location.search}` !== doel) {
      window.history.pushState(null, '', doel)
    }
    window.dispatchEvent(new Event(SOORT_EVENT))
  }, [])
  return [soort, kies]
}

const desktopQuery = '(min-width: 1024px)'

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(desktopQuery)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Op de server (en bij de eerste paint) dicht, zodat een telefoon de opgave ziet. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  )
}

type Question = {
  id: string
  cluster_id: string | null
  latex_body: string | null
  answer_prefix: string | null
  difficulty: 1 | 2 | 3
  source_label: string | null
  source_url: string | null
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
  indeling: 'onderwerp'
  chapters: ChapterInfo[]
  allTopics: TopicInfo[]
  allClusters: ClusterInfo[]
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

function tegelsVanKopjes(kopjes: Kopje[], alle: NewExerciseTile[]): NewExerciseTile[] {
  const ids = kopjes.flatMap((kop) => kop.sub.map((sub) => sub.clusterId))
  const rank = new Map(ids.map((id, i) => [id, i]))
  return alle
    .filter((t) => rank.has(t.clusterId))
    .sort((a, b) => {
      const verschil = (rank.get(a.clusterId) ?? 0) - (rank.get(b.clusterId) ?? 0)
      if (verschil !== 0) return verschil
      return a.difficulty - b.difficulty
    })
    .map((t, i) => ({ ...t, ordinal: i + 1 }))
}

function sectiesVan(kopjes: Kopje[], tegels: NewExerciseTile[]): TileSection[] {
  return kopjes.map((kop) => ({
    id: kop.id,
    label: kop.label,
    subSections: kop.sub.map((sub) => ({
      id: sub.id,
      label: sub.label,
      tiles: tegels.filter((t) => t.clusterId === sub.clusterId),
    })),
  }))
}

function gefilterdeSecties(
  kopjes: Kopje[],
  alle: NewExerciseTile[],
  soort: SoortKeuze,
): TileSection[] {
  const gekozen = tegelsVanKopjes(kopjes, alle).filter((tegel) =>
    pastBijSoort(tegel.verhaal, soort),
  )
  return sectiesVan(kopjes, gekozen)
    .map((sectie) => ({
      ...sectie,
      subSections: sectie.subSections.filter((sub) => sub.tiles.length > 0),
    }))
    .filter((sectie) => sectie.subSections.length > 0)
}

/** Alle sommen die op de oefenpagina staan, niet alleen van één onderdeel. */
function totaalOpPagina(overzicht: OverzichtHoofdstuk[], alle: NewExerciseTile[]) {
  const kopjes = overzicht.flatMap((h) => [
    ...h.kopjes,
    ...h.paragrafen.flatMap((p) => p.blokken.flatMap((blok) => blok.kopjes)),
  ])
  return teltSoorten(tegelsVanKopjes(kopjes, alle))
}

function hrefMetSoort(basis: string, soort: SoortKeuze): string {
  if (soort === 'alles') return basis
  return `${basis}${basis.includes('?') ? '&' : '?'}soort=${soort}`
}

function OnderwerpWeergave({
  chapters,
  allTopics,
  allClusters,
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
  const onderwerpBoom = useMemo(
    () => bouwOnderwerpBoom(chapters, allTopics, allClusters),
    [chapters, allTopics, allClusters],
  )

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
  const isDesktop = useIsDesktop()
  // null = volg het scherm: dicht op een telefoon, open op een computer.
  const [sidebarChoice, setSidebarChoice] = useState<boolean | null>(null)
  const sidebarOpen = sidebarChoice ?? isDesktop
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

  const baseHref = `/oefenen?chapter=${encodeURIComponent(selectedChapter?.slug ?? '')}${
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

  // In deze weergave staat geen soort-filter: de zichtbare tegels zijn ook de
  // volgorde van het boek.
  const nextTile = volgendeTegel(tiles, tiles, question?.id ?? null)
  const nextHref = nextTile
    ? `${baseHref}&q=${encodeURIComponent(nextTile.questionId)}`
    : baseHref

  function chapterHref(slug: string): string {
    return `/oefenen?chapter=${encodeURIComponent(slug)}`
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
    <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar (staat vast; content scrolt zelf) ───────────────── */}
      <aside
        className={cn(
          'nice-scrollbar shrink-0 border-b border-border bg-surface lg:h-full lg:min-h-0 lg:shrink lg:border-b-0 lg:border-r',
          sidebarOpen
            ? 'overflow-x-auto p-4 lg:w-64 lg:overflow-x-visible lg:overflow-y-auto lg:py-8'
            : 'px-0 py-2 lg:w-11 lg:py-4',
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
            onClick={() => setSidebarChoice(!sidebarOpen)}
            data-meet="oefenen-zijbalk"
            aria-expanded={sidebarOpen}
            aria-label={
              sidebarOpen ? labels.collapseSidebar : `${labels.chapterLabel} — ${labels.expandSidebar}`
            }
            title={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            className={
              sidebarOpen
                ? 'inline-flex size-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text'
                : 'inline-flex h-11 w-full shrink-0 items-center justify-center gap-2 rounded-md px-3 text-text-muted hover:bg-surface-2 hover:text-text lg:size-11 lg:w-11 lg:px-0'
            }
          >
            {!sidebarOpen && (
              <span className="text-sm font-medium text-text lg:hidden">{labels.chapterLabel}</span>
            )}
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
          {onderwerpBoom.map(({ chapter: ch, onderwerpen: chTopics }) => {
            const chActive = ch.id === selectedChapter?.id
            const chOpen = isChapterExpanded(ch.id)
            return (
              <li key={ch.id}>
                <button
                  type="button"
                  onClick={() => handleChapterClick(ch)}
                  data-meet="oefenen-hoofdstuk"
                  className={
                    chActive
                      ? 'flex min-h-11 w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                      : 'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
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
                    <span
                      title={ch.title}
                      className="inline-block w-9 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono font-semibold"
                    >
                      {hoofdstukCode(ch.slug)}
                    </span>
                    {' – '}
                    {ch.title}
                  </span>
                </button>

                {chOpen && chTopics.length > 0 && (
                  <ul className="mb-1 mt-0.5">
                    {chTopics.map((tp) => {
                      const tpActive = tp.id === selectedTopic?.id
                      const tpClusters = tp.clusters

                      if (tpClusters.length === 1) {
                        const onlyCluster = tpClusters[0]!
                        const isActive = tpActive && selectedCluster?.id === onlyCluster.id
                        return (
                          <li key={tp.id}>
                            <button
                              type="button"
                              onClick={() => handleClusterClick(onlyCluster, tp)}
                              data-meet="oefenen-soort-som"
                              className={
                                isActive
                                  ? 'flex min-h-11 w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                  : 'flex min-h-11 w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
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
                            data-meet="oefenen-onderwerp"
                            className={
                              tpActive
                                ? 'flex min-h-11 w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs font-semibold text-accent'
                                : 'flex min-h-11 w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
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
                                      data-meet="oefenen-soort-som"
                                      className={
                                        clActive
                                          ? 'flex min-h-11 w-full items-center gap-2 rounded-md py-1 pl-8 pr-3 text-xs font-medium text-accent'
                                          : 'flex min-h-11 w-full items-center gap-2 rounded-md py-1 pl-8 pr-3 text-xs text-text-muted hover:text-text'
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
        className="nice-scrollbar lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain"
      >
        <div className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="font-serif text-2xl text-text">{labels.h1}</h1>
            <DeelKnop compact />
          </div>

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
                  <span
                    title={g.chapter.title}
                    className="inline-block w-9 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono font-semibold"
                  >
                    {hoofdstukCode(g.chapter.slug)}
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
                      data-meet="oefenen-terug"
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
                    clusterName={
                      allClusters.find((c) => c.id === question.cluster_id)?.title
                    }
                    video={getVideoForCluster(question.cluster_id)}
                    questionNumber={
                      chapterGroups
                        .flatMap((g) => g.tiles)
                        .find((t) => t.questionId === question.id)?.ordinal ??
                      tiles.find((t) => t.questionId === question.id)?.ordinal
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
                        <span
                          title={g.chapter.title}
                          className="inline-block w-9 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono font-semibold"
                        >
                          {hoofdstukCode(g.chapter.slug)}
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
                            <KlikLink
                              key={q.questionId}
                              href={href as '/oefenen'}
                              prefetch={false}
                              data-meet="oefenen-opgavenummer"
                              bezigTekst="Opgave openen"
                              aria-current={active ? 'page' : undefined}
                              aria-label={`${g.chapter.title} ${labels.tileExercise} ${q.ordinal}${q.lastCorrect === true ? ` ${labels.tileLastCorrect}` : ''}${q.lastCorrect === false ? ` ${labels.tileLastWrong}` : ''}`}
                              className={cn(
                                'flex size-11 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition',
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
                            </KlikLink>
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

type BlokLabels = Labels & {
  oudeOpgaven: string
  kiesOnderdeel: string
  sluiten: string
}

type BlokProps = {
  indeling: 'blok'
  chapters: ChapterInfo[]
  paragraphs: ParagraphInfo[]
  blocks: TheoryBlockInfo[]
  allTopics: TopicInfo[]
  allClusters: ClusterInfo[]
  adres: Adres
  allTiles: NewExerciseTile[]
  question: Question | null
  /** Anker als het adres leeg is en de leerling al geoefend heeft. */
  startBij: string | null
  labels: BlokLabels
  /** Op de telefoon scrolt hij mee onderaan dit scrollgebied — zie AFG-595. */
  voettekst: React.ReactNode
}

/**
 * De tegels blijven dit onderdeel. Een andere som openen verandert hier
 * niets aan, dus de formules worden niet opnieuw getekend.
 */
const OverzichtBlokken = memo(function OverzichtBlokken({
  overzicht,
  allTiles,
  soort,
  labels,
  onKies,
}: {
  overzicht: OverzichtHoofdstuk[]
  allTiles: NewExerciseTile[]
  soort: SoortKeuze
  labels: {
    heading: string
    lastCorrect: string
    lastWrong: string
    notTried: string
    exercise: string
  }
  onKies: (questionId: string, basis: string) => void
}) {
  return (
    <>
      {overzicht.map((h) => {
        const hoofdstukInhoud =
          h.kopjes.length > 0 ? gefilterdeSecties(h.kopjes, allTiles, soort) : []
        const paragrafen = h.paragrafen.map((p) => ({
          p,
          blokken: p.blokken.map((blok) => ({
            blok,
            inhoud: gefilterdeSecties(blok.kopjes, allTiles, soort),
          })),
        }))
        const heeftZichtbaar =
          hoofdstukInhoud.length > 0 ||
          paragrafen.some((p) => p.blokken.some((b) => b.inhoud.length > 0))
        const voorbeeld = h.chapter.slug === 'h2'
        const eersteBlokId = paragrafen
          .flatMap((p) => p.blokken)
          .find((b) => b.inhoud.length > 0)?.blok.id
        return (
          <section
            key={h.chapter.id}
            id={`hoofdstuk-${h.chapter.slug}`}
            className={heeftZichtbaar ? 'mt-10 scroll-mt-14 first:mt-4 lg:scroll-mt-4' : undefined}
          >
            {heeftZichtbaar && (
              <h2 className="border-b border-border pb-3 font-serif text-2xl text-text">
                {hoofdstukNaam(h.chapter)}
              </h2>
            )}
            {paragrafen.map(({ p, blokken }) => {
              const paragraafZichtbaar = blokken.some((b) => b.inhoud.length > 0)
              return (
                <div
                  key={p.id}
                  id={`paragraaf-${p.slug}`}
                  className={paragraafZichtbaar ? 'scroll-mt-14 lg:scroll-mt-4' : undefined}
                >
                  {paragraafZichtbaar &&
                    (() => {
                      const paragraafTekst = (
                        <>
                          <span className="font-mono font-semibold">{p.label}</span> {p.title}
                        </>
                      )
                      const eersteBlokMetInhoud = blokken.find((b) => b.inhoud.length > 0)
                      const eersteTegel = eersteBlokMetInhoud?.inhoud
                        .flatMap((s) => s.subSections.flatMap((sub) => sub.tiles))
                        .at(0)
                      if (!eersteBlokMetInhoud || !eersteTegel) {
                        return (
                          <h3 className="mt-8 font-serif text-xl text-text">{paragraafTekst}</h3>
                        )
                      }
                      const basis = hrefMetSoort(
                        `/oefenen?blok=${encodeURIComponent(eersteBlokMetInhoud.blok.slug)}`,
                        soort,
                      )
                      return (
                        <h3 className="mt-8">
                          <KlikLink
                            href={
                              `${basis}&q=${encodeURIComponent(eersteTegel.questionId)}` as '/oefenen'
                            }
                            prefetch={false}
                            data-meet="oefenen-kopje"
                            bezigTekst="Opgave openen"
                            onClick={modifierVrijeKlik(() => onKies(eersteTegel.questionId, basis))}
                            className="font-serif text-xl text-text hover:text-accent"
                          >
                            {paragraafTekst}
                          </KlikLink>
                        </h3>
                      )
                    })()}
                  {blokken.map(({ blok, inhoud }) => {
                    const basis = hrefMetSoort(
                      `/oefenen?blok=${encodeURIComponent(blok.slug)}`,
                      soort,
                    )
                    const eersteTegel = inhoud
                      .flatMap((s) => s.subSections.flatMap((sub) => sub.tiles))
                      .at(0)
                    const blokTekst = (
                      <>
                        <span className="font-mono font-semibold">
                          {p.label} {blok.letter}
                        </span>
                        {' – '}
                        {blok.title}
                      </>
                    )
                    return (
                      <div
                        key={blok.id}
                        id={`blok-${blok.slug}`}
                        className={
                          inhoud.length > 0 ? 'scroll-mt-14 lg:scroll-mt-4' : undefined
                        }
                      >
                        {inhoud.length > 0 && (
                          <>
                            {eersteTegel ? (
                              <h3 className="mt-6">
                                <KlikLink
                                  href={
                                    `${basis}&q=${encodeURIComponent(eersteTegel.questionId)}` as '/oefenen'
                                  }
                                  prefetch={false}
                                  data-meet="oefenen-kopje"
                                  bezigTekst="Opgave openen"
                                  onClick={modifierVrijeKlik(() =>
                                    onKies(eersteTegel.questionId, basis),
                                  )}
                                  className="font-serif text-lg text-text hover:text-accent"
                                >
                                  {blokTekst}
                                </KlikLink>
                              </h3>
                            ) : (
                              <h3 className="mt-6 font-serif text-lg text-text">{blokTekst}</h3>
                            )}
                            <ExerciseTileGrid
                              baseHref={basis}
                              sections={inhoud}
                              activeQuestionId={null}
                              onKies={(id) => onKies(id, basis)}
                              labels={labels}
                              rondleiding={voorbeeld && blok.id === eersteBlokId}
                            />
                          </>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
            {hoofdstukInhoud.length > 0 && (
              <>
                <ExerciseTileGrid
                  baseHref={hrefMetSoort(
                    `/oefenen?chapter=${encodeURIComponent(h.chapter.slug)}`,
                    soort,
                  )}
                  sections={hoofdstukInhoud}
                  activeQuestionId={null}
                  onKies={(id) =>
                    onKies(
                      id,
                      hrefMetSoort(
                        `/oefenen?chapter=${encodeURIComponent(h.chapter.slug)}`,
                        soort,
                      ),
                    )
                  }
                  labels={labels}
                  rondleiding={voorbeeld && !eersteBlokId}
                />
              </>
            )}
          </section>
        )
      })}
    </>
  )
})

function BlokWeergave({
  chapters,
  paragraphs,
  blocks,
  allTopics,
  allClusters,
  adres: adresVanServer,
  allTiles,
  question,
  startBij,
  labels,
  voettekst,
}: BlokProps) {
  const [adres, setAdres] = useState(adresVanServer)
  const [allTilesState, setAllTilesState] = useState(allTiles)
  const [vraag, setVraag] = useState(question)
  const [bezigId, setBezigId] = useState<string | null>(null)
  const [laadFout, setLaadFout] = useState<string | null>(null)
  // Het overzicht blijft in de pagina zodra het getekend is. Een tegel
  // openen verbergt het alleen, zodat de formules niet opnieuw gebouwd worden.
  const [overzichtInDom, setOverzichtInDom] = useState(question == null)
  const [scrollVersie, setScrollVersie] = useState(0)
  const scrollDoel = useRef<string | null>(null)
  const aanvraag = useRef(0)
  const openVraagRef = useRef<(questionId: string, basis: string) => void>(() => {})
  const kiesOpgave = useCallback((questionId: string, basis: string) => {
    openVraagRef.current(questionId, basis)
  }, [])
  const [bekendeVragen, setBekendeVragen] = useState<Map<string, Question>>(() => {
    const map = new Map<string, Question>()
    if (question) map.set(question.id, question)
    return map
  })

  function bewaarScroll(id: string) {
    scrollDoel.current = id
    setScrollVersie((n) => n + 1)
  }
  const serverVraagId = question?.id ?? null
  const [gezienServerVraag, setGezienServerVraag] = useState(serverVraagId)
  if (serverVraagId !== gezienServerVraag) {
    setGezienServerVraag(serverVraagId)
    setVraag(question)
    setBezigId(null)
    setLaadFout(null)
    if (question) {
      setBekendeVragen((prev) => {
        const next = new Map(prev)
        next.set(question.id, question)
        return next
      })
    }
  }
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [boomOpen, setBoomOpen] = useState(false)
  const [soort, kiesSoort] = useSoortKeuze()

  const data = useMemo(
    () => ({
      chapters,
      paragraphs,
      blocks,
      topics: allTopics,
      clusters: allClusters,
      tiles: allTilesState,
    }),
    [chapters, paragraphs, blocks, allTopics, allClusters, allTilesState],
  )

  const urlKey = `${adresVanServer.blok ?? ''}|${adresVanServer.topic ?? ''}|${adresVanServer.cluster ?? ''}|${adresVanServer.chapter ?? ''}`
  const [syncedUrlKey, setSyncedUrlKey] = useState(urlKey)
  if (urlKey !== syncedUrlKey) {
    setSyncedUrlKey(urlKey)
    setAdres(adresVanServer)
  }

  const selectie = useMemo(() => losSelectieOp(adres, data), [adres, data])
  const boom = useMemo(() => bouwBlokBoom(data), [data])
  const overzicht = useMemo(() => bouwOefenOverzicht(data), [data])
  const [inBeeld, setInBeeld] = useState<string | null>(() => ankerUitAdres(adresVanServer, null))
  const [geopendLand, setGeopendLand] = useState<string | null>(null)
  const mainScrollRef = useRef<HTMLDivElement | null>(null)
  const paginaRef = useRef<HTMLDivElement | null>(null)

  const [openHoofdstukken, setOpenHoofdstukken] = useState<Set<string>>(
    () => new Set(selectie ? [selectie.chapter.id] : []),
  )
  const [openParagrafen, setOpenParagrafen] = useState<Set<string>>(
    () => new Set(selectie?.soort === 'blok' ? [selectie.paragraph.id] : []),
  )
  const [oudeOpen, setOudeOpen] = useState(selectie?.soort === 'hoofdstuk')

  const padSleutel = selectie
    ? selectie.soort === 'blok'
      ? selectie.blok.id
      : selectie.chapter.id
    : ''
  const [openPad, setOpenPad] = useState(padSleutel)
  if (padSleutel !== openPad) {
    setOpenPad(padSleutel)
    if (selectie) {
      setOpenHoofdstukken((prev) => new Set(prev).add(selectie.chapter.id))
      if (selectie.soort === 'blok') {
        setOpenParagrafen((prev) => new Set(prev).add(selectie.paragraph.id))
      } else {
        setOudeOpen(true)
      }
    }
  }

  useEffect(() => {
    if (!boomOpen) return
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setBoomOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [boomOpen])

  const vraagKopjes = useMemo(
    () => (selectie ? kopjesVoorSelectie(selectie, allTopics, allClusters, allTilesState) : []),
    [selectie, allTopics, allClusters, allTilesState],
  )
  // Alle tegels van dit onderdeel in boekvolgorde; `tiles` is daarvan het deel
  // dat het soort-filter doorlaat.
  const alleTegelsVanOnderdeel = useMemo(
    () => tegelsVanKopjes(vraagKopjes, allTilesState),
    [vraagKopjes, allTilesState],
  )
  const tiles = useMemo(
    () => alleTegelsVanOnderdeel.filter((tegel) => pastBijSoort(tegel.verhaal, soort)),
    [alleTegelsVanOnderdeel, soort],
  )

  const baseHref = selectie
    ? hrefMetSoort(`/oefenen?${queryVoorSelectie(selectie)}`, soort)
    : hrefMetSoort('/oefenen', soort)
  const huidigeVraag = bezigId && vraag?.id !== bezigId ? null : vraag
  const nextTile = volgendeTegel(tiles, alleTegelsVanOnderdeel, huidigeVraag?.id ?? null)
  const vraagOpen = vraag !== null || bezigId !== null || laadFout !== null

  function openVoorAnker(id: string) {
    if (id.startsWith('blok-')) {
      const slug = id.slice('blok-'.length)
      for (const h of boom.hoofdstukken) {
        for (const p of h.paragrafen) {
          if (!p.blokken.some((b) => b.slug === slug)) continue
          setOpenHoofdstukken((prev) => new Set(prev).add(h.chapter.id))
          setOpenParagrafen((prev) => new Set(prev).add(p.id))
          return
        }
      }
    }
    if (id.startsWith('hoofdstuk-')) {
      const slug = id.slice('hoofdstuk-'.length)
      const h = boom.hoofdstukken.find((node) => node.chapter.slug === slug)
      if (h) setOpenHoofdstukken((prev) => new Set(prev).add(h.chapter.id))
    }
    if (id.startsWith('paragraaf-')) {
      const slug = id.slice('paragraaf-'.length)
      for (const h of boom.hoofdstukken) {
        const p = h.paragrafen.find((node) => node.slug === slug)
        if (!p) continue
        setOpenHoofdstukken((prev) => new Set(prev).add(h.chapter.id))
        setOpenParagrafen((prev) => new Set(prev).add(p.id))
        return
      }
    }
  }

  function queryVanAdres(volgend: Adres): string {
    const sp = new URLSearchParams()
    if (volgend.blok) sp.set('blok', volgend.blok)
    else if (volgend.chapter) sp.set('chapter', volgend.chapter)
    else if (volgend.topic) sp.set('topic', volgend.topic)
    if (volgend.cluster) sp.set('cluster', volgend.cluster)
    const gekozen = leesSoortNu()
    if (gekozen !== 'alles') sp.set('soort', gekozen)
    return sp.toString()
  }

  function zetAdresInBalk(volgend: Adres) {
    setAdres(volgend)
    const query = queryVanAdres(volgend)
    const pad = window.location.pathname
    const doel = query ? `${pad}?${query}` : pad
    if (`${pad}${window.location.search}` !== doel) {
      window.history.pushState(null, '', doel)
    }
  }

  const laad = useCallback(async (id: string) => {
    if (!allTilesState.some((tegel) => tegel.questionId === id)) {
      aanvraag.current += 1
      setBezigId(null)
      setVraag(null)
      setLaadFout('Deze opgave is er niet.')
      return
    }
    const bekend = bekendeVragen.get(id)
    if (bekend) {
      aanvraag.current += 1
      setBezigId(null)
      setLaadFout(null)
      setVraag(bekend)
      return
    }
    const n = ++aanvraag.current
    setBezigId(id)
    setLaadFout(null)
    try {
      const geladen = await laadOpgave(id)
      if (aanvraag.current !== n) return
      setBezigId(null)
      if (!geladen) {
        setVraag(null)
        setLaadFout('Deze opgave is er niet.')
        return
      }
      setBekendeVragen((prev) => {
        const next = new Map(prev)
        next.set(id, geladen)
        return next
      })
      setVraag(geladen)
    } catch (e) {
      unstable_rethrow(e)
      if (aanvraag.current !== n) return
      setBezigId(null)
      setLaadFout('De opgave kon niet geladen worden. Probeer het nog eens.')
    }
  }, [allTilesState, bekendeVragen])

  const openVraag = useCallback((questionId: string, basis: string) => {
    const params = new URLSearchParams(basis.includes('?') ? basis.slice(basis.indexOf('?') + 1) : '')
    params.set('q', questionId)
    const pad = window.location.pathname
    const doel = `${pad}?${params.toString()}`
    if (`${pad}${window.location.search}` !== doel) {
      window.history.pushState(null, '', doel)
    }
    setAdres({
      blok: params.get('blok'),
      topic: params.get('topic'),
      cluster: params.get('cluster'),
      chapter: params.get('chapter'),
    })
    mainScrollRef.current?.scrollTo({ top: 0 })
    window.scrollTo({ top: 0 })
    if (vraag?.id === questionId && bezigId == null && !laadFout) return
    void laad(questionId)
  }, [vraag, bezigId, laadFout, laad])

  useEffect(() => {
    openVraagRef.current = openVraag
  }, [openVraag])

  const bijGeschiedenis = useEffectEvent(() => {
    const sp = new URLSearchParams(window.location.search)
    const volgende = {
      blok: sp.get('blok'),
      topic: sp.get('topic'),
      cluster: sp.get('cluster'),
      chapter: sp.get('chapter'),
    }
    setAdres(volgende)
    setBoomOpen(false)
    const q = sp.get('q')
    const id = ankerUitAdres(volgende, losSelectieOp(volgende, data))
    if (!q) {
      aanvraag.current += 1
      setBezigId(null)
      setLaadFout(null)
      setVraag(null)
      setOverzichtInDom(true)
      if (id) {
        setInBeeld(id)
        bewaarScroll(id)
      }
      return
    }
    if (id) setInBeeld(id)
    void laad(q)
  })

  useEffect(() => {
    window.addEventListener('popstate', bijGeschiedenis)
    return () => window.removeEventListener('popstate', bijGeschiedenis)
  }, [])

  function sluitVraag() {
    aanvraag.current += 1
    setBezigId(null)
    setLaadFout(null)
    setVraag(null)
    setOverzichtInDom(true)
    zetAdresInBalk(adres)
    const anker = ankerUitAdres(adres, selectie)
    if (anker) {
      setInBeeld(anker)
      openVoorAnker(anker)
      bewaarScroll(anker)
    }
  }

  function scrollNaar(id: string, volgend: Adres | null, houdMenu = false) {
    if (!houdMenu) setBoomOpen(false)
    const open = vraag !== null || bezigId !== null || laadFout !== null
    if (open) {
      aanvraag.current += 1
      setBezigId(null)
      setLaadFout(null)
      setVraag(null)
      setOverzichtInDom(true)
    }
    if (volgend) zetAdresInBalk(volgend)
    setInBeeld(id)
    openVoorAnker(id)
    if (open || !document.getElementById(id)) bewaarScroll(id)
    else document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const landAnker = question ? null : (ankerUitAdres(adresVanServer, selectie) ?? startBij)
  if (landAnker && landAnker !== geopendLand) {
    setGeopendLand(landAnker)
    setInBeeld(landAnker)
    openVoorAnker(landAnker)
  }

  // Pas na het aankoppelen, zodat een klik niet op een dode knop landt.
  useEffect(() => {
    paginaRef.current?.setAttribute('data-hydrated', 'ja')
  }, [])

  useEffect(() => {
    if (!landAnker || question) return
    document.getElementById(landAnker)?.scrollIntoView({ block: 'start' })
  }, [landAnker, question])

  useEffect(() => {
    if (vraag || bezigId || laadFout) return
    const id = scrollDoel.current
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    scrollDoel.current = null
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [scrollVersie, vraag, bezigId, laadFout, overzichtInDom])

  useEffect(() => {
    if (vraag || bezigId) return
    const root = mainScrollRef.current
    function zichtbaar(): string | null {
      const grens = root && root.scrollHeight > root.clientHeight + 8
        ? root.getBoundingClientRect().top
        : 0
      let huidige: string | null = null
      for (const h of overzicht) {
        const hoofdstuk = document.getElementById(`hoofdstuk-${h.chapter.slug}`)
        if (hoofdstuk && hoofdstuk.getBoundingClientRect().top - grens <= 80) {
          huidige = `hoofdstuk-${h.chapter.slug}`
        }
        for (const p of h.paragrafen) {
          for (const blok of p.blokken) {
            const el = document.getElementById(`blok-${blok.slug}`)
            if (el && el.getBoundingClientRect().top - grens <= 120) {
              huidige = `blok-${blok.slug}`
            }
          }
        }
      }
      return huidige
    }
    function onScroll() {
      const id = zichtbaar()
      if (!id) return
      setInBeeld((prev) => (prev === id ? prev : id))
    }
    root?.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      root?.removeEventListener('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [overzicht, vraag, bezigId])

  function boomLijst() {
    return (
      <div>
        <ul className="space-y-0.5">
          {boom.hoofdstukken.map((h) => {
            const naam = hoofdstukNaam(h.chapter)
            const paragrafen = h.paragrafen
              .map((p) => ({
                ...p,
                blokken: p.blokken.filter((blok) => blok.heeftOpgaven),
              }))
              .filter((p) => p.blokken.length > 0)
            // Geen boekparagrafen (Beweging): alleen tonen als er opgaven zijn.
            if (h.paragrafen.length === 0) {
              if (!overzicht.some((node) => node.chapter.id === h.chapter.id)) return null
              const actief = inBeeld === `hoofdstuk-${h.chapter.slug}`
              return (
                <li key={h.chapter.id}>
                  <button
                    type="button"
                    data-meet="oefenen-hoofdstuk"
                    onClick={() =>
                      scrollNaar(`hoofdstuk-${h.chapter.slug}`, {
                        blok: null,
                        topic: null,
                        cluster: null,
                        chapter: h.chapter.slug,
                      })
                    }
                    data-tour={h.chapter.slug === 'h2' ? 'hoofdstukken' : undefined}
                    aria-current={actief ? 'true' : undefined}
                    className={
                      actief
                        ? 'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold text-accent'
                        : 'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-text hover:bg-surface-2'
                    }
                  >
                    <span className="min-w-0 break-words">{naam}</span>
                  </button>
                </li>
              )
            }
            if (paragrafen.length === 0) return null
            const open = openHoofdstukken.has(h.chapter.id)
            return (
              <li key={h.chapter.id}>
                <button
                  type="button"
                  data-meet="oefenen-hoofdstuk"
                  onClick={() => {
                    // Dichtklappen mag niet meteen weer open door scrollNaar.
                    if (open) {
                      setOpenHoofdstukken((prev) => {
                        const next = new Set(prev)
                        next.delete(h.chapter.id)
                        return next
                      })
                      return
                    }
                    setOpenHoofdstukken((prev) => new Set(prev).add(h.chapter.id))
                    scrollNaar(`hoofdstuk-${h.chapter.slug}`, {
                      blok: null,
                      topic: null,
                      cluster: null,
                      chapter: h.chapter.slug,
                    })
                  }}
                  data-tour={h.chapter.slug === 'h2' ? 'hoofdstukken' : undefined}
                  className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-text hover:bg-surface-2"
                  aria-expanded={open}
                >
                  <Chevron open={open} />
                  <span className="min-w-0 break-words">{naam}</span>
                </button>
                {open && (
                  <ul className="mb-1">
                    {paragrafen.map((p) => {
                      const pOpen = openParagrafen.has(p.id)
                      return (
                        <li key={p.id}>
                          <button
                            type="button"
                            data-meet="oefenen-paragraaf"
                            onClick={() => {
                              if (pOpen) {
                                setOpenParagrafen((prev) => {
                                  const next = new Set(prev)
                                  next.delete(p.id)
                                  return next
                                })
                                return
                              }
                              setOpenParagrafen((prev) => new Set(prev).add(p.id))
                              const id = `paragraaf-${p.slug}`
                              if (document.getElementById(id) || vraag || bezigId) {
                                scrollNaar(
                                  id,
                                  {
                                    blok: null,
                                    topic: null,
                                    cluster: null,
                                    chapter: h.chapter.slug,
                                  },
                                  true,
                                )
                              }
                            }}
                            className="flex min-h-11 w-full items-center gap-2 rounded-md py-2 pl-7 pr-3 text-left text-sm text-text hover:bg-surface-2"
                            aria-expanded={pOpen}
                          >
                            <Chevron open={pOpen} />
                            <span className="min-w-0 break-words">
                              <span className="font-mono font-semibold">{p.label}</span> {p.title}
                            </span>
                          </button>
                          {pOpen && (
                            <ul>
                              {p.blokken.map((blok) => (
                                <li key={blok.id}>
                                  <button
                                    type="button"
                                    data-meet="oefenen-theorieblok"
                                    onClick={() =>
                                      scrollNaar(`blok-${blok.slug}`, {
                                        blok: blok.slug,
                                        topic: null,
                                        cluster: null,
                                        chapter: null,
                                      })
                                    }
                                    aria-current={
                                      inBeeld === `blok-${blok.slug}` ? 'true' : undefined
                                    }
                                    className={
                                      inBeeld === `blok-${blok.slug}`
                                        ? 'flex min-h-11 w-full cursor-pointer items-start gap-2 rounded-md py-2 pl-12 pr-3 text-left text-sm font-semibold text-accent hover:bg-surface-2'
                                        : 'flex min-h-11 w-full cursor-pointer items-start gap-2 rounded-md py-2 pl-12 pr-3 text-left text-sm text-text hover:bg-surface-2'
                                    }
                                  >
                                    <span className="font-mono">{blok.letter}</span>
                                    <span className="min-w-0 flex-1 break-words">{blok.title}</span>
                                    <span className="shrink-0 tabular-nums text-xs text-text-muted">
                                      {blok.aantalOpgaven}
                                      <span className="sr-only"> opgaven</span>
                                    </span>
                                  </button>
                                </li>
                              ))}
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

        {boom.oudeOpgaven.length > 0 && (
          <div className="mt-4 border-t border-border pt-3">
            <button
              type="button"
              onClick={() => setOudeOpen((v) => !v)}
              data-meet="oefenen-oude-opgaven"
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-text hover:bg-surface-2"
              aria-expanded={oudeOpen}
            >
              <Chevron open={oudeOpen} />
              <span>{labels.oudeOpgaven}</span>
            </button>
            {oudeOpen && (
              <ul>
                {boom.oudeOpgaven.map((ch) => {
                  const actief = inBeeld === `hoofdstuk-${ch.slug}`
                  return (
                    <li key={ch.id}>
                      <button
                        type="button"
                        data-meet="oefenen-hoofdstuk"
                        onClick={() =>
                          scrollNaar(`hoofdstuk-${ch.slug}`, {
                            blok: null,
                            topic: null,
                            cluster: null,
                            chapter: ch.slug,
                          })
                        }
                        aria-current={actief ? 'true' : undefined}
                        className={
                          actief
                            ? 'flex min-h-11 w-full items-start rounded-md py-2 pl-9 pr-3 text-left text-sm font-semibold text-accent'
                            : 'flex min-h-11 w-full items-start rounded-md py-2 pl-9 pr-3 text-left text-sm text-text-muted hover:text-text'
                        }
                      >
                        <span className="min-w-0 break-words">{hoofdstukNaam(ch)}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        )}
      </div>
    )
  }

  function naamVanAnker(id: string | null): string {
    if (!id) return labels.h1
    if (id.startsWith('blok-')) {
      const slug = id.slice('blok-'.length)
      for (const h of overzicht) {
        for (const p of h.paragrafen) {
          const blok = p.blokken.find((b) => b.slug === slug)
          if (blok) return `${p.label} ${blok.letter} · ${blok.title}`
        }
      }
    }
    if (id.startsWith('paragraaf-')) {
      const slug = id.slice('paragraaf-'.length)
      for (const h of overzicht) {
        const p = h.paragrafen.find((node) => node.slug === slug)
        if (p) return `${p.label} ${p.title}`
      }
    }
    if (id.startsWith('hoofdstuk-')) {
      const slug = id.slice('hoofdstuk-'.length)
      const h = overzicht.find((node) => node.chapter.slug === slug)
      if (h) return hoofdstukNaam(h.chapter)
    }
    return labels.h1
  }

  const kop = vraagOpen
    ? selectie?.soort === 'blok'
      ? naamVanSelectie(selectie)
      : selectie
        ? hoofdstukNaam(selectie.chapter)
        : labels.kiesOnderdeel
    : naamVanAnker(inBeeld)

  const tegelLabels = useMemo(
    () => ({
      heading: labels.tilesHeading,
      lastCorrect: labels.tileLastCorrect,
      lastWrong: labels.tileLastWrong,
      notTried: labels.tileNotTried,
      exercise: labels.tileExercise,
    }),
    [labels],
  )
  const paginaAantal = useMemo(
    () => totaalOpPagina(overzicht, allTilesState),
    [overzicht, allTilesState],
  )

  return (
    <div
      ref={paginaRef}
      data-oefen-volledig=""
      className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row"
    >
      <aside
        className={cn(
          'nice-scrollbar hidden min-h-0 border-border bg-surface lg:block lg:h-full lg:overflow-y-auto lg:border-r',
          sidebarOpen ? 'lg:w-80 lg:overflow-y-auto lg:p-4 lg:py-8' : 'lg:w-12 lg:py-4',
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
            data-meet="oefenen-zijbalk"
            aria-expanded={sidebarOpen}
            aria-label={
              sidebarOpen ? labels.collapseSidebar : `${labels.chapterLabel} — ${labels.expandSidebar}`
            }
            title={sidebarOpen ? labels.collapseSidebar : labels.expandSidebar}
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
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
        {sidebarOpen && <div className="mt-3">{boomLijst()}</div>}
      </aside>

      <div
        ref={mainScrollRef}
        data-oefen-scroll=""
        className="nice-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
      >
        <button
          type="button"
          onClick={() => setBoomOpen(true)}
          data-tour="hoofdstukken"
          data-meet="oefenen-kies-onderdeel"
          className="sticky top-0 z-20 flex min-h-11 w-full items-center justify-between gap-3 border-b border-border bg-surface px-4 text-left text-sm font-medium [overflow-anchor:none] lg:hidden"
        >
          <span className="min-w-0 truncate">{kop}</span>
          <svg viewBox="0 0 24 24" className="size-4 shrink-0" fill="currentColor" aria-hidden>
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>

        <div className="mx-auto max-w-6xl px-4 py-8">
          {vraagOpen ? (
            <h1 className="sr-only">{labels.h1}</h1>
          ) : (
            <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
              <h1 className="font-serif text-2xl text-text">{labels.h1}</h1>
              <DeelKnop compact />
            </div>
          )}

          {!vraagOpen && toonSoortFilter(paginaAantal) && (
            <SoortFilter
              gewoon={paginaAantal.gewoon}
              verhaal={paginaAantal.verhaal}
              waarde={soort}
              onKies={kiesSoort}
              rondleiding={overzicht.some((h) => h.chapter.slug === 'h2')}
            />
          )}

          {!vraagOpen && overzicht.length > 0 && (
            <p className="mt-2 max-w-2xl text-sm text-text-muted">{labels.difficultyHint}</p>
          )}

          {overzichtInDom && overzicht.length > 0 && (
            <div hidden={vraagOpen || undefined}>
              <OverzichtBlokken
                overzicht={overzicht}
                allTiles={allTilesState}
                soort={soort}
                labels={tegelLabels}
                onKies={kiesOpgave}
              />
            </div>
          )}

          {vraagOpen ? (
            <div className="mt-8 flex flex-col gap-8 lg:flex-row">
              <div className="min-w-0 flex-1">
                <div className="mx-auto max-w-3xl">
                  <div className="mb-5">
                    <Link
                      id="terug-naar-overzicht"
                      href={baseHref as '/oefenen'}
                      data-meet="oefenen-terug"
                      aria-label={labels.backToAll}
                      title={labels.backToAll}
                      onClick={(event) => {
                        if (
                          event.metaKey ||
                          event.ctrlKey ||
                          event.shiftKey ||
                          event.altKey ||
                          event.button !== 0
                        ) {
                          return
                        }
                        event.preventDefault()
                        sluitVraag()
                      }}
                      className="inline-flex size-11 items-center text-text-muted transition hover:-translate-x-0.5 hover:text-text"
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
                  {huidigeVraag ? (
                  <StudyCard
                    key={huidigeVraag.id}
                    question={huidigeVraag}
                    steps={huidigeVraag.steps}
                    onVolgende={
                      nextTile
                        ? () => openVraag(nextTile.questionId, baseHref)
                        : undefined
                    }
                    video={getVideoForCluster(huidigeVraag.cluster_id)}
                    questionNumber={
                      alleTegelsVanOnderdeel.find((t) => t.questionId === huidigeVraag.id)?.ordinal
                    }
                    onAnswered={(questionId, isCorrect) => {
                      setAllTilesState((prev) =>
                        prev.map((t) =>
                          t.questionId === questionId ? { ...t, lastCorrect: isCorrect } : t,
                        ),
                      )
                    }}
                  />
                  ) : laadFout ? (
                    <Card>
                      <p className="font-medium text-text">{laadFout}</p>
                    </Card>
                  ) : (
                    <p role="status" className="text-sm text-text-muted">
                      Opgave openen…
                    </p>
                  )}
                </div>
              </div>
              <aside className="shrink-0 lg:sticky lg:top-0 lg:w-64 lg:self-start">
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {labels.questionsNav}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tiles.map((q) => {
                    const active = q.questionId === (bezigId ?? huidigeVraag?.id)
                    return (
                      <KlikLink
                        key={q.questionId}
                        href={`${baseHref}&q=${encodeURIComponent(q.questionId)}` as '/oefenen'}
                        prefetch={false}
                        data-meet="oefenen-opgavenummer"
                        bezigTekst="Opgave openen"
                        onClick={(event) => {
                          if (
                            event.metaKey ||
                            event.ctrlKey ||
                            event.shiftKey ||
                            event.altKey ||
                            event.button !== 0
                          ) {
                            return
                          }
                          event.preventDefault()
                          openVraag(q.questionId, baseHref)
                        }}
                        aria-current={active ? 'page' : undefined}
                        aria-label={`${labels.tileExercise} ${q.ordinal}${q.lastCorrect === true ? ` ${labels.tileLastCorrect}` : ''}${q.lastCorrect === false ? ` ${labels.tileLastWrong}` : ''}`}
                        className={cn(
                          'flex size-11 items-center justify-center rounded-lg border text-sm font-medium tabular-nums transition',
                          active && 'ring-2 ring-offset-1 ring-offset-[var(--color-bg)]',
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
                      </KlikLink>
                    )
                  })}
                </div>
              </aside>
            </div>
          ) : overzicht.length === 0 ? (
            <Card className="mt-8">
              <p className="font-medium text-text">{labels.noExercises}</p>
            </Card>
          ) : null}
        </div>
        {voettekst}
      </div>

      {boomOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-surface lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={labels.kiesOnderdeel}
        >
          <div className="flex items-center justify-between border-b border-border px-4">
            <p className="text-sm font-medium">{labels.kiesOnderdeel}</p>
            <button
              type="button"
              onClick={() => setBoomOpen(false)}
              data-meet="oefenen-kies-onderdeel-sluiten"
              className="min-h-11 px-3 text-sm font-medium text-text"
            >
              {labels.sluiten}
            </button>
          </div>
          <div className="nice-scrollbar flex-1 overflow-y-auto p-4">{boomLijst()}</div>
        </div>
      )}
    </div>
  )
}

function hoofdstukNaam(chapter: { slug: string; title: string }): string {
  return `${hoofdstukCode(chapter.slug)} – ${chapter.title}`
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={`size-3 shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 5l8 7-8 7V5z" />
    </svg>
  )
}

export function OefenenClient(props: (Props & { indeling: 'onderwerp' }) | BlokProps) {
  if (props.indeling === 'blok') return <BlokWeergave {...props} />
  return <OnderwerpWeergave {...props} />
}
