'use client'

import { useState } from 'react'

import { KlikLink } from '@/components/klik-link'

import { cn } from '@/components/ui'
import {
  hrefVoorBlok,
  hrefVoorOnderwerp,
  telBeheerst,
  type ClusterVoortgang,
  type NieuwHoofdstuk,
  type OnderwerpRij,
} from '@/lib/dashboard/indeling'
import { hoofdstukCode } from '@/lib/hoofdstuk-code'
import { nogEenGoedZin } from '@/lib/practice/nog-een-goed'

export type ClusterData = {
  id: string
  slug: string
  title: string
  topicId: string
  isKnown: boolean
  /** Goed op rij voor deze soort. Ontbreekt het, dan is de reeks 0. */
  correctStreak?: number
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
  const { mastered, total, pct } = telBeheerst(allClusters)

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
            const { mastered: tMastered, total: tTotal, pct: tPct } = telBeheerst(topic.clusters)
            return (
              <li key={topic.id} className="px-4 py-2 text-sm">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      'size-1.5 shrink-0 rounded-full',
                      tPct === 100 ? 'bg-accent' : 'bg-border',
                    )}
                  />
                  <KlikLink
                    href={`/oefenen?chapter=${encodeURIComponent(topic.chapterSlug)}&topic=${encodeURIComponent(topic.slug)}`}
                    bezigTekst="Oefenen openen"
                    className="min-w-0 flex-1 truncate text-text hover:text-accent hover:underline"
                  >
                    {topic.title}
                  </KlikLink>
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
                </div>
                {topic.clusters.map((cluster) => {
                  const zin = nogEenGoedZin(cluster.correctStreak ?? 0, cluster.title)
                  if (!zin) return null
                  return (
                    <p key={cluster.id} className="mt-1 pl-5 text-xs text-accent">
                      {zin}
                    </p>
                  )
                })}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ReeksZinnen({
  clusters,
  inspringen,
}: {
  clusters: Array<Pick<ClusterVoortgang, 'id' | 'title' | 'correctStreak'>>
  inspringen: string
}) {
  const zinnen = clusters.flatMap((cluster) => {
    const zin = nogEenGoedZin(cluster.correctStreak ?? 0, cluster.title)
    return zin ? [{ id: cluster.id, zin }] : []
  })
  if (zinnen.length === 0) return null
  return (
    <>
      {zinnen.map((regel) => (
        <p key={regel.id} className={`pb-1 pr-4 text-xs text-accent ${inspringen}`}>
          {regel.zin}
        </p>
      ))}
    </>
  )
}

function VoortgangCijfers({ clusters }: { clusters: ClusterVoortgang[] }) {
  const { mastered, total, pct } = telBeheerst(clusters)
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
  const { pct } = telBeheerst(onderwerp.clusters)
  return (
    <li className="px-4 py-2 text-sm">
      <div className="flex min-h-11 items-center gap-3">
        <span
          className={cn('size-1.5 shrink-0 rounded-full', pct === 100 ? 'bg-accent' : 'bg-border')}
        />
        <KlikLink
          href={hrefVoorOnderwerp(onderwerp.chapterSlug, onderwerp.slug)}
          bezigTekst="Oefenen openen"
          className="min-w-0 flex-1 break-words text-text hover:text-accent hover:underline"
        >
          {onderwerp.title}
        </KlikLink>
        <VoortgangCijfers clusters={onderwerp.clusters} />
      </div>
      <ReeksZinnen clusters={onderwerp.clusters} inspringen="pl-5" />
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
  const [open, setOpen] = useState(defaultOpen)
  const { mastered, total, pct } = telBeheerst(chapter.clusters)
  const paragrafen = chapter.paragrafen
    .map((paragraaf) => ({
      ...paragraaf,
      blokken: paragraaf.blokken.filter((blok) => blok.heeftOpgaven),
    }))
    .filter((paragraaf) => paragraaf.blokken.length > 0)
  if (paragrafen.length === 0 && chapter.losseOnderwerpen.length === 0) return null

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
          {paragrafen.map((paragraaf) => {
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
                  {paragraaf.blokken.map((blok) => (
                    <li key={blok.id}>
                      <KlikLink
                        href={hrefVoorBlok(blok.slug)}
                        bezigTekst="Oefenen openen"
                        className="group flex min-h-11 items-center gap-3 py-2 pl-12 pr-4 text-sm text-text hover:text-accent"
                      >
                        <span className="shrink-0 font-mono text-text-muted">{blok.letter}</span>
                        <span className="min-w-0 flex-1 break-words group-hover:underline">
                          {blok.title}
                        </span>
                        <VoortgangCijfers clusters={blok.clusters} />
                      </KlikLink>
                      <ReeksZinnen clusters={blok.clusters} inspringen="pl-16" />
                    </li>
                  ))}
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
