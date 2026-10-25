'use client'

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from 'react'

import { DeelKnop } from '@/components/deel-knop'
import { ProbeerKnop } from '@/components/probeer-knop'
import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import type { OverviewCard } from '@/content/theory/afgeleiden'
import { DIFFERENTIEERREGELS_PAD } from '@/content/theory/differentieerregels'
import { heeftSessiekoekje } from '@/lib/supabase/sessie-koekje'

export type TheorieChapter = {
  slug: string
  title: string
  /** Vooraf op de server geformatteerd, bv. "Oefen De afgeleide functie →" */
  practiceLabel: string
  cards: OverviewCard[]
}

type Labels = {
  h1: string
  chapterLabel: string
  collapseSidebar: string
  expandSidebar: string
  exampleLabel: string
  detailsLabel: string
  showSteps: string
  answerLabel: string
  practiceSelf: string
  practiceChapter: string
  freeAccount: string
}

const desktopQuery = '(min-width: 1024px)'

function subscribeDesktop(onChange: () => void) {
  const mq = window.matchMedia(desktopQuery)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** Het sessiekoekje staat pas in de browser. De server leest het niet, zodat de pagina statisch blijft. */
function leesIngelogd() {
  const koekjes = document.cookie.split(';').map((deel) => ({
    name: (deel.trim().split('=')[0] ?? '').trim(),
  }))
  return heeftSessiekoekje(koekjes)
}

function subscribeIngelogd(onChange: () => void) {
  window.addEventListener('focus', onChange)
  return () => window.removeEventListener('focus', onChange)
}

function useIngelogd() {
  return useSyncExternalStore(subscribeIngelogd, leesIngelogd, () => false)
}

/** Op de server (en bij de eerste paint) dicht, zodat een telefoon de formule ziet. */
function useIsDesktop() {
  return useSyncExternalStore(
    subscribeDesktop,
    () => window.matchMedia(desktopQuery).matches,
    () => false,
  )
}

/** "H2 — De afgeleide functie" → { code: "H2", short: "De afgeleide functie" } */
function splitTitle(title: string): { code: string | null; short: string } {
  const m = title.match(/^(H\d+)\s*[—–-]\s*(.+)$/)
  return m ? { code: m[1]!, short: m[2]! } : { code: null, short: title }
}

/**
 * `#hoofdstuk-h7` of `#kaart-h2-machtsregel` → welk hoofdstuk (en welke kaart).
 * De losse links in de kop en op de startpagina gebruiken deze ankers.
 */
function leesAnker(
  hash: string,
  chapters: TheorieChapter[],
): { slug: string; kaartId: string | null } | null {
  let raw = hash.startsWith('#') ? hash.slice(1) : hash
  if (!raw) return null
  try {
    raw = decodeURIComponent(raw)
  } catch {
    return null
  }
  if (raw.startsWith('hoofdstuk-')) {
    const slug = raw.slice('hoofdstuk-'.length)
    return chapters.some((ch) => ch.slug === slug) ? { slug, kaartId: null } : null
  }
  if (raw.startsWith('kaart-')) {
    const rest = raw.slice('kaart-'.length)
    const chapter = chapters.find((ch) => rest.startsWith(`${ch.slug}-`))
    if (!chapter) return null
    const kaartId = rest.slice(chapter.slug.length + 1)
    return chapter.cards.some((card) => card.id === kaartId) ? { slug: chapter.slug, kaartId } : null
  }
  return null
}

export function TheorieClient({
  chapters,
  labels,
}: {
  chapters: TheorieChapter[]
  labels: Labels
}) {
  const isDesktop = useIsDesktop()
  // null = volg het scherm: dicht op een telefoon, open op een computer.
  const [sidebarChoice, setSidebarChoice] = useState<boolean | null>(null)
  const sidebarOpen = sidebarChoice ?? isDesktop
  const [activeSlug, setActiveSlug] = useState<string | null>(chapters[0]?.slug ?? null)
  const [activeCardId, setActiveCardId] = useState<string | null>(null)
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())
  const chaptersRef = useRef(chapters)
  const activeRef = useRef(activeSlug)
  const inhoudRef = useRef<HTMLDivElement>(null)
  const chapterBtnRefs = useRef(new Map<string, HTMLButtonElement>())
  const cardBtnRefs = useRef(new Map<string, HTMLButtonElement>())
  // Zolang dit aan staat (vlak na een klik, tot het scrollen stil ligt),
  // laat de IntersectionObserver de markering met rust — anders springt hij
  // tijdens het scrollen zelf even naar een hoofdstuk dat onderweg passeert.
  const programmatischRef = useRef(false)
  const scrollEindeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    chaptersRef.current = chapters
    activeRef.current = activeSlug
  })

  const markeerScrollEinde = useCallback(() => {
    if (scrollEindeTimerRef.current) clearTimeout(scrollEindeTimerRef.current)
    scrollEindeTimerRef.current = setTimeout(() => {
      programmatischRef.current = false
    }, 150)
  }, [])

  useEffect(() => () => {
    if (scrollEindeTimerRef.current) clearTimeout(scrollEindeTimerRef.current)
  }, [])

  function toggleCard(key: string) {
    setOpenCards((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  const toonHoofdstuk = useCallback((slug: string, kaartId: string | null) => {
    const mobiel = !window.matchMedia(desktopQuery).matches
    // Op een telefoon klapt de lijst eerst dicht. Scroll pas daarna, anders
    // schuift het hoofdstuk mee omhoog en verdwijnt de kop uit beeld.
    if (mobiel) setSidebarChoice(false)
    programmatischRef.current = true
    markeerScrollEinde()
    setActiveSlug(slug)
    setActiveCardId(kaartId)
    const elementId = kaartId ? `kaart-${slug}-${kaartId}` : `hoofdstuk-${slug}`
    const scroll = () => {
      document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
    if (mobiel) requestAnimationFrame(() => requestAnimationFrame(scroll))
    else scroll()
  }, [markeerScrollEinde])

  const pasAnkerToe = useCallback((hash: string) => {
    const anker = leesAnker(hash, chaptersRef.current)
    if (!anker) {
      const eerste = chaptersRef.current[0]?.slug
      if (!hash && eerste && eerste !== activeRef.current) setActiveSlug(eerste)
      return
    }
    toonHoofdstuk(anker.slug, anker.kaartId)
  }, [toonHoofdstuk])

  function zetAnker(hash: string) {
    const url = `${window.location.pathname}${window.location.search}${hash}`
    if (window.location.hash !== hash) history.pushState(null, '', url)
    pasAnkerToe(hash)
  }

  // Ankers uit de kop en de startpagina (`#hoofdstuk-…`, `#kaart-…`).
  // Next.js zet een hash vaak via pushState, en dat geeft geen hashchange.
  useEffect(() => {
    function vanuitUrl() {
      pasAnkerToe(window.location.hash)
    }
    function bijKlik(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof Element)) return
      const link = target.closest('a')
      if (!link) return
      let url: URL
      try {
        url = new URL(link.href, window.location.href)
      } catch {
        return
      }
      if (url.pathname !== window.location.pathname || !url.hash) return
      pasAnkerToe(url.hash)
    }
    vanuitUrl()
    window.addEventListener('hashchange', vanuitUrl)
    window.addEventListener('popstate', vanuitUrl)
    document.addEventListener('click', bijKlik, true)
    return () => {
      window.removeEventListener('hashchange', vanuitUrl)
      window.removeEventListener('popstate', vanuitUrl)
      document.removeEventListener('click', bijKlik, true)
    }
  }, [pasAnkerToe])

  // Een klik scrolt soepel naar het doel; zolang dat loopt, negeren we de
  // observer hieronder. Deze listener merkt op wanneer het scrollen stopt.
  // `capture: true` op window vangt ook het scrollen van `<main>` (telefoon)
  // en van de inhoud-div (computer) op, want scroll-events van onderliggende
  // elementen bubbelen niet, maar worden tijdens de capture-fase wel gezien.
  useEffect(() => {
    window.addEventListener('scroll', markeerScrollEinde, { passive: true, capture: true })
    return () => window.removeEventListener('scroll', markeerScrollEinde, { capture: true })
  }, [markeerScrollEinde])

  // Tijdens het scrollen licht het hoofdstuk én de kaart op die in het
  // bovenste derde van het scherm staan — zo loopt de markering netjes mee,
  // ook door de onderdelen van een hoofdstuk heen.
  useEffect(() => {
    const root = isDesktop ? inhoudRef.current : null
    type Doel = { el: HTMLElement; slug: string; kaartId: string | null }
    const doelen: Doel[] = []
    for (const ch of chapters) {
      // Niet de hele sectie observeren: die heeft `content-visibility: auto`
      // en dus de hoogte van het hele hoofdstuk (alle kaarten), waardoor hij
      // tot ver voorbij het hoofdstuk nog "zichtbaar" zou lijken. Alleen de
      // kop zelf heeft de juiste, kleine hoogte.
      const kop = document.getElementById(`hoofdstuk-${ch.slug}`)?.querySelector<HTMLElement>('h2')
      if (kop) doelen.push({ el: kop, slug: ch.slug, kaartId: null })
      for (const card of ch.cards) {
        const el = document.getElementById(`kaart-${ch.slug}-${card.id}`)
        if (el) doelen.push({ el, slug: ch.slug, kaartId: card.id })
      }
    }
    if (doelen.length === 0) return

    const zichtbaar = new Map<Element, { intersecting: boolean; top: number }>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          zichtbaar.set(entry.target, { intersecting: entry.isIntersecting, top: entry.boundingClientRect.top })
        }
        if (programmatischRef.current) return
        // Het verst doorgescrolde onderdeel wint. Bij twee kaarten naast
        // elkaar (desktop-raster) staan ze op dezelfde hoogte: dan telt de
        // eerste in de leesvolgorde (links), niet de laatste in de DOM.
        let actief: Doel | null = null
        let besteTop = -Infinity
        for (const kandidaat of doelen) {
          const info = zichtbaar.get(kandidaat.el)
          if (!info?.intersecting) continue
          if (info.top > besteTop + 4) {
            besteTop = info.top
            actief = kandidaat
          }
        }
        if (!actief) return
        setActiveSlug((huidig) => (huidig === actief!.slug ? huidig : actief!.slug))
        setActiveCardId((huidig) => (huidig === actief!.kaartId ? huidig : actief!.kaartId))
      },
      // Bovenste derde van het scherm telt als "actief".
      { root, rootMargin: '0% 0px -66% 0px', threshold: 0 },
    )
    for (const doel of doelen) observer.observe(doel.el)
    return () => observer.disconnect()
  }, [chapters, isDesktop])

  // De balk zelf scrolt mee zodat het actieve hoofdstuk/onderdeel in beeld blijft.
  useEffect(() => {
    if (!isDesktop || !sidebarOpen) return
    const el = activeCardId
      ? cardBtnRefs.current.get(`${activeSlug}/${activeCardId}`)
      : (activeSlug ? chapterBtnRefs.current.get(activeSlug) : null)
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [activeSlug, activeCardId, isDesktop, sidebarOpen])

  return (
    <div className="flex flex-col lg:min-h-0 lg:flex-1 lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
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
            data-meet="theorie-zijbalk"
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
            {chapters.map((ch) => {
              const active = ch.slug === activeSlug
              const { code, short } = splitTitle(ch.title)
              return (
                <li key={ch.slug}>
                  <button
                    ref={(el) => {
                      if (el) chapterBtnRefs.current.set(ch.slug, el)
                      else chapterBtnRefs.current.delete(ch.slug)
                    }}
                    type="button"
                    onClick={() => zetAnker(`#hoofdstuk-${ch.slug}`)}
                    data-meet="theorie-hoofdstuk"
                    className={
                      active
                        ? 'flex min-h-11 w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                        : 'flex min-h-11 w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
                    }
                  >
                    <span className="truncate text-left">
                      {code && (
                        <>
                          <span className="font-mono font-semibold">{code}</span>
                          {' – '}
                        </>
                      )}
                      {short}
                    </span>
                  </button>

                  {active && ch.cards.length > 0 && (
                    <ul className="mb-1 mt-0.5">
                      {ch.cards.map((card) => {
                        const cardActive = card.id === activeCardId
                        return (
                          <li key={card.id}>
                            <button
                              ref={(el) => {
                                const key = `${ch.slug}/${card.id}`
                                if (el) cardBtnRefs.current.set(key, el)
                                else cardBtnRefs.current.delete(key)
                              }}
                              type="button"
                              onClick={() => zetAnker(`#kaart-${ch.slug}-${card.id}`)}
                              data-meet="theorie-kaart-in-zijbalk"
                              aria-current={cardActive ? 'true' : undefined}
                              className={
                                cardActive
                                  ? 'flex min-h-11 w-full items-center gap-2 rounded-md bg-accent-light py-1.5 pl-7 pr-3 text-xs font-medium text-accent'
                                  : 'flex min-h-11 w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text'
                              }
                            >
                              <span
                                className={
                                  cardActive
                                    ? 'size-1.5 shrink-0 rounded-full bg-accent'
                                    : 'size-1.5 shrink-0 rounded-full bg-border'
                                }
                              />
                              <span className="truncate text-left">{card.title}</span>
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
      </aside>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        ref={inhoudRef}
        className="nice-scrollbar lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-y-contain"
      >
        <div className="mx-auto max-w-5xl space-y-12 px-4 py-8">
          <h1 className="sr-only">{labels.h1}</h1>
          <div className="flex flex-wrap items-center gap-4">
            <DeelKnop />
            <Link
              href={DIFFERENTIEERREGELS_PAD}
              data-meet="theorie-alle-differentieerregels"
              className="inline-flex min-h-11 items-center text-sm font-medium text-accent underline underline-offset-2"
            >
              Alle differentieerregels op een rij
            </Link>
          </div>

          {chapters.map((chapter) => (
            <ChapterSection
              key={chapter.slug}
              chapter={chapter}
              openCards={openCards}
              onToggle={toggleCard}
              labels={labels}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function HoofdstukKnoppen({ slug, labels }: { slug: string; labels: Labels }) {
  const ingelogd = useIngelogd()
  const oefenen = `/oefenen?chapter=${encodeURIComponent(slug)}`
  if (ingelogd) {
    return (
      <Link
        href={oefenen as '/oefenen'}
        data-meet="theorie-oefen-hoofdstuk"
        className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
      >
        {labels.practiceChapter}
      </Link>
    )
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <ProbeerKnop
        oefenen={oefenen}
        dataMeet="theorie-probeer"
        className="inline-flex min-h-11 items-center rounded-lg bg-accent px-4 text-sm font-medium text-white hover:bg-accent/90"
      />
      <Link
        href="/registreren"
        data-meet="theorie-registreren"
        className="inline-flex min-h-11 items-center rounded-lg border border-border px-4 text-sm text-text hover:bg-surface-2"
      >
        {labels.freeAccount}
      </Link>
    </div>
  )
}

function ChapterSection({
  chapter,
  openCards,
  onToggle,
  labels,
}: {
  chapter: TheorieChapter
  openCards: Set<string>
  onToggle: (key: string) => void
  labels: Labels
}) {
  const { code, short } = splitTitle(chapter.title)
  return (
    <section
      id={`hoofdstuk-${chapter.slug}`}
      className="scroll-mt-4 [content-visibility:auto] [contain-intrinsic-size:auto_48rem]"
    >
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <h2 className="font-serif text-2xl text-text">
          {code && (
            <>
              <span className="font-mono font-semibold">{code}</span>
              {' – '}
            </>
          )}
          {short}
        </h2>
        <HoofdstukKnoppen slug={chapter.slug} labels={labels} />
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {chapter.cards.map((card) => (
          <TheoryCard
            key={card.id}
            chapterSlug={chapter.slug}
            card={card}
            open={openCards.has(`${chapter.slug}/${card.id}`)}
            onToggle={() => onToggle(`${chapter.slug}/${card.id}`)}
            exampleLabel={labels.exampleLabel}
            detailsLabel={labels.detailsLabel}
            showSteps={labels.showSteps}
            answerLabel={labels.answerLabel}
          />
        ))}
      </div>
    </section>
  )
}

function ExampleSteps({ steps, label }: { steps: string[]; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2 border-t border-border pt-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((nu) => !nu)}
        data-meet="theorie-meer-uitleg"
        className="min-h-11 py-2 text-left font-medium text-accent"
      >
        {label}
      </button>
      {open && (
        <ol className="mt-1 space-y-1">
          {steps.map((stap, si) => (
            <li key={si} className="flex items-start gap-2">
              <span className="min-w-[1.1rem] shrink-0 font-semibold tabular-nums text-accent">
                {si + 1}.
              </span>
              <span className="min-w-0">
                <RichMath source={stap} />
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function TheoryCard({
  chapterSlug,
  card,
  open,
  onToggle,
  exampleLabel,
  detailsLabel,
  showSteps,
  answerLabel,
}: {
  chapterSlug: string
  card: OverviewCard
  open: boolean
  onToggle: () => void
  exampleLabel: string
  detailsLabel: string
  showSteps: string
  answerLabel: string
}) {
  const hasNotes = (card.notes?.length ?? 0) > 0
  const voorbeelden = (card.examples ?? []).slice(0, 3)

  // `min-w-0` op de kaart: zonder dat rekt een brede formule het rastervakje
  // op tot buiten het scherm, want een vakje is standaard minstens zo breed
  // als zijn inhoud.
  return (
    <article
      id={`kaart-${chapterSlug}-${card.id}`}
      className="flex min-w-0 scroll-mt-4 flex-col rounded-xl border border-border bg-surface"
    >
      {hasNotes ? (
        <button
          type="button"
          onClick={onToggle}
          data-meet="theorie-kaart"
          aria-expanded={open}
          aria-label={`${card.title} — ${detailsLabel}`}
          className="group flex w-full items-center justify-between gap-3 rounded-t-xl px-5 py-4 text-left"
        >
          <h3 className="font-serif text-lg text-text">{card.title}</h3>
          <span className="flex size-6 items-center justify-center rounded-full bg-accent-light text-accent transition group-hover:bg-accent group-hover:text-white">
            <svg
              viewBox="0 0 24 24"
              className={`size-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
      ) : (
        <div className="px-5 py-4">
          <h3 className="font-serif text-lg text-text">{card.title}</h3>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 px-5 pb-5">
        {card.formula && (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 overflow-x-auto rounded-lg bg-accent-light/60 px-4 py-4 text-center text-[0.9em] leading-loose">
            {(Array.isArray(card.formula) ? card.formula : [card.formula]).map((regel, i) => (
              <TeX key={i} tex={regel} wrap />
            ))}
          </div>
        )}

        {card.table && (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface-2">
                <tr>
                  {card.table.headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {card.table.rows.map((row, ri) => (
                  <tr key={ri} className={ri > 0 ? 'border-t border-border' : ''}>
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 align-middle text-text">
                        <RichMath source={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {voorbeelden.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
              {exampleLabel}
            </p>
            <ul className="space-y-2">
              {voorbeelden.map((ex, i) => (
                <li
                  key={i}
                  className="overflow-x-auto rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
                >
                  <TeX tex={ex.problem} />
                  {ex.steps && ex.steps.length > 0 && (
                    <ExampleSteps steps={ex.steps} label={showSteps} />
                  )}
                  <p className="mt-2 border-t border-border pt-2">
                    <span className="text-text-muted">{answerLabel}: </span>
                    <TeX tex={ex.answer} />
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {hasNotes && open && card.notes && (
          <ul className="space-y-1 pt-1 text-xs leading-relaxed text-text-muted">
            {card.notes.map((note, i) => (
              <li key={i}>
                <RichMath source={note} />
              </li>
            ))}
          </ul>
        )}

        {card.uitlegPad && (
          <Link
            href={card.uitlegPad as '/theorie'}
            data-meet="theorie-hele-uitleg"
            className="inline-flex min-h-11 items-center self-start text-sm font-medium text-accent underline underline-offset-2"
          >
            Lees de hele uitleg
          </Link>
        )}
      </div>
    </article>
  )
}
