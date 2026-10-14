'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

import { Link } from '@/i18n/navigation'

import { cn } from '@/components/ui'
import {
  hrefVoorBlok,
  hrefVoorOnderwerp,
  weegClusters,
  type ClusterVoortgang,
  type NieuwHoofdstuk,
  type OnderwerpRij,
} from '@/lib/dashboard/indeling'
import { hoofdstukCode } from '@/lib/hoofdstuk-code'

export type ClusterData = {
  id: string
  slug: string
  title: string
  topicId: string
  totalAnswered: number
  totalCorrect: number
  isKnown: boolean
}

export type TopicData = {
  id: string
  slug: string
  title: string
  chapterSlug: string
  clusters: ClusterData[]
}

export type ChapterData = {
  id: string
  slug: string
  title: string
  topics: TopicData[]
}

function computeProgress(clusters: ClusterData[]) {
  const mastered = clusters.filter((c) => c.isKnown).length
  const total = clusters.length
  const weighted = clusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pct = total > 0 ? Math.round((weighted / total) * 100) : 0
  return { mastered, total, pct }
}

export function ChapterBlock({
  chapter,
  defaultOpen = false,
}: {
  chapter: ChapterData
  /** Bij een kersverse leerling staat het eerste hoofdstuk alvast open. */
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  const allClusters = chapter.topics.flatMap((t) => t.clusters)
  const { mastered, total, pct } = computeProgress(allClusters)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <svg
          className={cn('size-3 shrink-0 text-text-muted transition-transform', open && 'rotate-90')}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
        <span
          title={chapter.title}
          className="w-9 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono text-[11px] font-semibold text-text-muted"
        >
          {hoofdstukCode(chapter.slug)}
        </span>
        <span className="flex-1 font-serif text-[15px] text-text">{chapter.title}</span>
        <span className="tabular-nums text-xs text-text-muted">{mastered}/{total}</span>
        <span
          className={cn(
            'w-10 text-right text-sm font-medium tabular-nums',
            pct === 100 ? 'text-accent' : 'text-text-muted',
          )}
        >
          {pct}%
        </span>
      </button>

      <div className="mx-4 mb-1 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      {open && (
        <ul className="pb-2 pt-1">
          {chapter.topics.map((topic) => {
            const { mastered: tMastered, total: tTotal, pct: tPct } = computeProgress(topic.clusters)
            return (
              <li key={topic.id} className="flex items-center gap-3 px-4 py-2 text-sm">
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    tPct === 100 ? 'bg-accent' : 'bg-border',
                  )}
                />
                <Link
                  href={`/oefenen?chapter=${encodeURIComponent(topic.chapterSlug)}&topic=${encodeURIComponent(topic.slug)}`}
                  className="min-w-0 flex-1 truncate text-text hover:text-accent hover:underline"
                >
                  {topic.title}
                </Link>
                <span className="shrink-0 tabular-nums text-xs text-text-muted">
                  {tMastered}/{tTotal}
                </span>
                <span
                  className={cn(
                    'w-9 shrink-0 text-right tabular-nums text-xs',
                    tPct === 100 ? 'font-medium text-accent' : 'text-text-muted',
                  )}
                >
                  {tPct}%
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function VoortgangCijfers({ clusters }: { clusters: ClusterVoortgang[] }) {
  const { mastered, total, pct } = weegClusters(clusters)
  if (total === 0) return null
  return (
    <>
      <span className="shrink-0 tabular-nums text-xs text-text-muted">
        {mastered}/{total}
      </span>
      <span
        className={cn(
          'w-9 shrink-0 text-right tabular-nums text-xs',
          pct === 100 ? 'font-medium text-accent' : 'text-text-muted',
        )}
      >
        {pct}%
      </span>
    </>
  )
}

function OnderwerpRegel({ onderwerp }: { onderwerp: OnderwerpRij }) {
  const { pct } = weegClusters(onderwerp.clusters)
  return (
    <li className="flex min-h-11 items-center gap-3 px-4 py-2 text-sm">
      <span
        className={cn('size-1.5 shrink-0 rounded-full', pct === 100 ? 'bg-accent' : 'bg-border')}
      />
      <Link
        href={hrefVoorOnderwerp(onderwerp.chapterSlug, onderwerp.slug)}
        className="min-w-0 flex-1 break-words text-text hover:text-accent hover:underline"
      >
        {onderwerp.title}
      </Link>
      <VoortgangCijfers clusters={onderwerp.clusters} />
    </li>
  )
}

/** Hoofdstuk met paragrafen en theorieblokken. Zonder paragrafen de onderwerpen. */
export function NieuwHoofdstukBlock({
  chapter,
  defaultOpen = false,
}: {
  chapter: NieuwHoofdstuk
  defaultOpen?: boolean
}) {
  const t = useTranslations('Dashboard')
  const [open, setOpen] = useState(defaultOpen)
  const { mastered, total, pct } = weegClusters(chapter.clusters)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((waarde) => !waarde)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-2"
      >
        <svg
          className={cn('size-3 shrink-0 text-text-muted transition-transform', open && 'rotate-90')}
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M8 5l8 7-8 7V5z" />
        </svg>
        <span
          title={chapter.title}
          className="w-9 shrink-0 overflow-hidden text-ellipsis whitespace-nowrap text-center font-mono text-[11px] font-semibold text-text-muted"
        >
          {hoofdstukCode(chapter.slug)}
        </span>
        <span className="min-w-0 flex-1 break-words font-serif text-[15px] text-text">
          {chapter.title}
        </span>
        <span className="shrink-0 tabular-nums text-xs text-text-muted">
          {mastered}/{total}
        </span>
        <span
          className={cn(
            'w-10 shrink-0 text-right text-sm font-medium tabular-nums',
            pct === 100 ? 'text-accent' : 'text-text-muted',
          )}
        >
          {pct}%
        </span>
      </button>

      <div className="mx-4 mb-1 h-1 overflow-hidden rounded-full bg-surface-2">
        <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
      </div>

      {open && (
        <ul className="pb-2 pt-1">
          {chapter.paragrafen.map((paragraaf) => {
            const clusters = paragraaf.blokken.flatMap((blok) => blok.clusters)
            return (
              <li key={paragraaf.id}>
                <div className="flex min-h-11 items-center gap-3 py-2 pl-8 pr-4 text-sm">
                  <span className="shrink-0 font-mono text-xs font-semibold text-text-muted">
                    {paragraaf.label}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium text-text">
                    {paragraaf.title}
                  </span>
                  <VoortgangCijfers clusters={clusters} />
                </div>
                <ul>
                  {paragraaf.blokken.map((blok) =>
                    blok.heeftOpgaven ? (
                      <li key={blok.id}>
                        <Link
                          href={hrefVoorBlok(blok.slug)}
                          className="group flex min-h-11 items-center gap-3 py-2 pl-12 pr-4 text-sm text-text hover:text-accent"
                        >
                          <span className="shrink-0 font-mono text-text-muted">{blok.letter}</span>
                          <span className="min-w-0 flex-1 break-words group-hover:underline">
                            {blok.title}
                          </span>
                          <VoortgangCijfers clusters={blok.clusters} />
                        </Link>
                      </li>
                    ) : (
                      <li
                        key={blok.id}
                        className="flex min-h-11 items-center gap-3 py-2 pl-12 pr-4 text-sm text-text-muted"
                      >
                        <span className="shrink-0 font-mono">{blok.letter}</span>
                        <span className="min-w-0 flex-1 break-words">{blok.title}</span>
                        <span className="shrink-0 text-xs">{t('nogGeenOpgaven')}</span>
                      </li>
                    ),
                  )}
                </ul>
              </li>
            )
          })}
          {chapter.losseOnderwerpen.map((onderwerp) => (
            <OnderwerpRegel key={onderwerp.id} onderwerp={onderwerp} />
          ))}
        </ul>
      )}
    </div>
  )
}
