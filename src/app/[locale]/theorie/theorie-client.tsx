'use client'

import { useRef, useState } from 'react'

import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import { cn } from '@/components/ui'
import type { OverviewCard } from '@/lib/theory'

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
}

/** "H2 — De afgeleide functie" → { code: "H2", short: "De afgeleide functie" } */
function splitTitle(title: string): { code: string | null; short: string } {
  const m = title.match(/^(H\d+)\s*[—–-]\s*(.+)$/)
  return m ? { code: m[1]!, short: m[2]! } : { code: null, short: title }
}

export function TheorieClient({
  chapters,
  labels,
}: {
  chapters: TheorieChapter[]
  labels: Labels
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSlug, setActiveSlug] = useState<string | null>(chapters[0]?.slug ?? null)
  const [openCards, setOpenCards] = useState<Set<string>>(new Set())
  const mainScrollRef = useRef<HTMLDivElement | null>(null)

  function toggleCard(key: string) {
    setOpenCards((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function scrollToId(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Scroll-spy: markeer het hoofdstuk dat in beeld is
  function handleMainScroll() {
    const root = mainScrollRef.current
    if (!root) return
    const rootTop = root.getBoundingClientRect().top
    let current: string | null = null
    for (const ch of chapters) {
      const el = document.getElementById(`hoofdstuk-${ch.slug}`)
      if (!el) continue
      if (el.getBoundingClientRect().top - rootTop <= 140) current = ch.slug
    }
    if (current && current !== activeSlug) setActiveSlug(current)
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col lg:h-[calc(100vh-3.5rem)] lg:flex-row lg:overflow-hidden">
      {/* ── Sidebar ─────────────────────────────────────────────────── */}
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
              const active = ch.slug === activeSlug
              const { code, short } = splitTitle(ch.title)
              return (
                <li key={ch.slug}>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSlug(ch.slug)
                      scrollToId(`hoofdstuk-${ch.slug}`)
                    }}
                    className={
                      active
                        ? 'flex w-full items-center gap-2 rounded-md bg-accent px-3 py-2 text-sm font-medium text-white'
                        : 'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-text-muted hover:bg-surface-2 hover:text-text'
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
                      {ch.cards.map((card) => (
                        <li key={card.id}>
                          <button
                            type="button"
                            onClick={() => scrollToId(`kaart-${ch.slug}-${card.id}`)}
                            className="flex w-full items-center gap-2 rounded-md py-1.5 pl-7 pr-3 text-xs text-text-muted hover:text-text"
                          >
                            <span className="size-1.5 shrink-0 rounded-full bg-border" />
                            <span className="truncate text-left">{card.title}</span>
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
      </aside>

      {/* ── Content ─────────────────────────────────────────────────── */}
      <div
        ref={mainScrollRef}
        onScroll={handleMainScroll}
        className="nice-scrollbar flex-1 lg:h-full lg:overflow-y-auto"
      >
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="sr-only">{labels.h1}</h1>

          {chapters.map((ch) => {
            const { code, short } = splitTitle(ch.title)
            return (
              <section
                key={ch.slug}
                id={`hoofdstuk-${ch.slug}`}
                className="scroll-mt-4"
              >
                <div className="mt-20 flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3 first:mt-0">
                  <h2 className="font-serif text-2xl text-text">
                    {code && (
                      <>
                        <span className="font-mono font-semibold">{code}</span>
                        {' – '}
                      </>
                    )}
                    {short}
                  </h2>
                  <Link
                    href={`/oefenen?chapter=${encodeURIComponent(ch.slug)}` as '/oefenen'}
                    className="text-sm font-medium text-accent underline-offset-2 hover:underline"
                  >
                    {ch.practiceLabel}
                  </Link>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {ch.cards.map((card) => (
                    <TheoryCard
                      key={card.id}
                      chapterSlug={ch.slug}
                      card={card}
                      open={openCards.has(`${ch.slug}/${card.id}`)}
                      onToggle={() => toggleCard(`${ch.slug}/${card.id}`)}
                      exampleLabel={labels.exampleLabel}
                      detailsLabel={labels.detailsLabel}
                    />
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
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
}: {
  chapterSlug: string
  card: OverviewCard
  open: boolean
  onToggle: () => void
  exampleLabel: string
  detailsLabel: string
}) {
  const expandable = (card.examples?.length ?? 0) > 0 || (card.notes?.length ?? 0) > 0

  return (
    <article
      id={`kaart-${chapterSlug}-${card.id}`}
      className="flex scroll-mt-4 flex-col rounded-xl border border-border bg-surface"
    >
      {expandable ? (
        <button
          type="button"
          onClick={onToggle}
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
          <div className="flex flex-1 items-center justify-center overflow-x-auto rounded-lg bg-accent-light/60 px-4 py-4 text-[0.9em]">
            <TeX tex={card.formula} displayMode />
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

        {expandable && (
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
              open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            }`}
          >
            <div className="min-h-0 overflow-hidden">
              <div className="space-y-3 pt-1">
                {card.examples && card.examples.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
                      {exampleLabel}
                    </p>
                    <ul className="space-y-2">
                      {card.examples.map((ex, i) => (
                        <li
                          key={i}
                          className="overflow-x-auto rounded-lg border border-border bg-surface-2/60 px-3 py-2.5 text-sm"
                        >
                          <TeX tex={`${ex.problem} \\implies ${ex.answer}`} />
                          {ex.steps && ex.steps.length > 0 && (
                            <ol className="mt-2 space-y-1 border-t border-border pt-2">
                              {ex.steps.map((s, si) => (
                                <li key={si} className="flex items-start gap-2">
                                  <span className="min-w-[1.1rem] shrink-0 font-semibold tabular-nums text-accent">
                                    {si + 1}.
                                  </span>
                                  <span className="min-w-0">
                                    <RichMath source={s} />
                                  </span>
                                </li>
                              ))}
                            </ol>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {card.notes && card.notes.length > 0 && (
                  <ul className="space-y-1 text-xs leading-relaxed text-text-muted">
                    {card.notes.map((note, i) => (
                      <li key={i}>
                        <RichMath source={note} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  )
}
