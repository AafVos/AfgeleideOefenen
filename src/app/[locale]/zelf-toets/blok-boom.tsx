'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'

import { hoofdstukCode } from '@/lib/hoofdstuk-code'
import type { ConfigData, QuestionSource } from '@/lib/practice/custom-test'
import {
  bouwZelfToetsBoom,
  clusterIdsVanHoofdstuk,
  type ToetsBlok,
  type ToetsCluster,
  type ToetsHoofdstuk,
  type ToetsOnderwerp,
} from '@/lib/practice/zelf-toets-indeling'

type CheckState = 'all' | 'none' | 'some'

function checkStateFromCounts(selected: number, total: number): CheckState {
  if (total === 0 || selected === 0) return 'none'
  if (selected >= total) return 'all'
  return 'some'
}

function TriCheckbox({
  state,
  onToggle,
  ariaLabel,
  disabled = false,
}: {
  state: CheckState
  onToggle: () => void
  ariaLabel: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'all' ? 'true' : state === 'some' ? 'mixed' : 'false'}
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={disabled}
      className={`flex size-11 shrink-0 items-center justify-center rounded border transition md:size-5 ${
        disabled
          ? 'cursor-default border-border bg-surface-2 text-text-muted'
          : state === 'all'
            ? 'border-accent bg-accent text-white'
            : state === 'some'
              ? 'border-accent bg-accent-light text-accent'
              : 'border-border bg-surface hover:border-accent'
      }`}
    >
      {state === 'all' && (
        <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
          <path d="M6.4 11.6L3 8.2l1.1-1.1 2.3 2.3 5.5-5.5 1.1 1.1z" />
        </svg>
      )}
      {state === 'some' && (
        <svg viewBox="0 0 16 16" className="size-3.5" fill="currentColor" aria-hidden>
          <rect x="3.5" y="7.25" width="9" height="1.5" rx="0.75" />
        </svg>
      )}
    </button>
  )
}

function ExpandButton({
  open,
  label,
  onClick,
}: {
  open: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex size-11 shrink-0 items-center justify-center text-text-muted hover:text-text md:size-5"
      aria-label={label}
      aria-expanded={open}
    >
      <svg
        viewBox="0 0 24 24"
        className={`size-3 transition-transform ${open ? 'rotate-90' : ''}`}
        fill="currentColor"
      >
        <path d="M8 5l8 7-8 7V5z" />
      </svg>
    </button>
  )
}

export function BlokBoom({
  config,
  selected,
  source,
  onToggleCluster,
  onSetClusters,
}: {
  config: ConfigData
  selected: Set<string>
  source: QuestionSource
  onToggleCluster: (id: string) => void
  onSetClusters: (ids: string[], on: boolean) => void
}) {
  const t = useTranslations('ZelfToets')
  const boom = useMemo(() => bouwZelfToetsBoom(config), [config])
  const [openChapters, setOpenChapters] = useState<Set<string>>(
    () => new Set(config.chapters.map((chapter) => chapter.id)),
  )
  const [openBlocks, setOpenBlocks] = useState<Set<string>>(new Set())
  const [openTopics, setOpenTopics] = useState<Set<string>>(new Set())

  function staatVan(ids: string[]): CheckState {
    return checkStateFromCounts(ids.filter((id) => selected.has(id)).length, ids.length)
  }

  function toggleIds(ids: string[]) {
    onSetClusters(ids, staatVan(ids) !== 'all')
  }

  function wissel(set: Set<string>, id: string, zet: (volgende: Set<string>) => void) {
    const volgende = new Set(set)
    if (volgende.has(id)) volgende.delete(id)
    else volgende.add(id)
    zet(volgende)
  }

  function aantal(clusters: ToetsCluster[]): string {
    const n = clusters.reduce((sum, cluster) => {
      if (source === 'new') return sum + cluster.newCount
      if (source === 'wrong') return sum + cluster.wrongCount
      return sum + cluster.questionCount
    }, 0)
    return `${n}`
  }

  function clusterKeuze(cluster: ToetsCluster) {
    return (
      <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2 md:min-h-0">
        <span className="size-11 shrink-0 md:size-5" />
        <TriCheckbox
          state={selected.has(cluster.id) ? 'all' : 'none'}
          onToggle={() => onToggleCluster(cluster.id)}
          ariaLabel={cluster.title}
        />
        <span className="min-w-0 flex-1 break-words">{cluster.title}</span>
        <span className="shrink-0 tabular-nums text-text-muted">{aantal([cluster])}</span>
      </div>
    )
  }

  function onderwerpRij(onderwerp: ToetsOnderwerp) {
    const ids = onderwerp.clusters.map((cluster) => cluster.id)
    const open = openTopics.has(onderwerp.id)
    if (onderwerp.clusters.length <= 1) {
      const enige = onderwerp.clusters[0]
      if (!enige) return null
      return (
        <li key={onderwerp.id}>
          <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2 md:min-h-0">
            <span className="size-11 shrink-0 md:size-5" />
            <TriCheckbox
              state={selected.has(enige.id) ? 'all' : 'none'}
              onToggle={() => onToggleCluster(enige.id)}
              ariaLabel={enige.title}
            />
            <span className="min-w-0 flex-1 break-words">{enige.title}</span>
            <span className="shrink-0 tabular-nums text-text-muted">{aantal([enige])}</span>
          </div>
        </li>
      )
    }
    return (
      <li key={onderwerp.id}>
        <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2 md:min-h-0">
          <ExpandButton
            open={open}
            label={open ? t('collapse') : t('expand')}
            onClick={() => wissel(openTopics, onderwerp.id, setOpenTopics)}
          />
          <TriCheckbox
            state={staatVan(ids)}
            onToggle={() => toggleIds(ids)}
            ariaLabel={onderwerp.title}
          />
          <span className="min-w-0 flex-1 break-words">{onderwerp.title}</span>
        </div>
        {open && (
          <ul className="ml-7 space-y-0.5 border-l border-border pl-2">
            {onderwerp.clusters.map((cluster) => (
              <li key={cluster.id}>{clusterKeuze(cluster)}</li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  function blokRij(blok: ToetsBlok) {
    if (!blok.heeftOpgaven) return null
    const ids = blok.clusters.map((cluster) => cluster.id)
    const open = openBlocks.has(blok.id)
    const meerdere = blok.clusters.length > 1
    const metKop = blok.onderwerpen.filter((onderwerp) => onderwerp.clusters.length > 0)

    return (
      <li key={blok.id}>
        <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1 text-sm hover:bg-surface-2 md:min-h-0">
          {meerdere ? (
            <ExpandButton
              open={open}
              label={open ? t('collapse') : t('expand')}
              onClick={() => wissel(openBlocks, blok.id, setOpenBlocks)}
            />
          ) : (
            <span className="size-11 shrink-0 md:size-5" />
          )}
          <TriCheckbox
            state={staatVan(ids)}
            onToggle={() => toggleIds(ids)}
            ariaLabel={blok.naam}
          />
          <span className="shrink-0 font-mono text-text-muted">{blok.letter}</span>
          <span className="min-w-0 flex-1 break-words">{blok.title}</span>
          <span className="shrink-0 tabular-nums text-text-muted">{aantal(blok.clusters)}</span>
        </div>
        {open && meerdere && (
          <ul className="ml-7 space-y-0.5 border-l border-border pl-2">
            {metKop.length > 1
              ? metKop.map((onderwerp) => (
                  <li key={onderwerp.id}>
                    <p className="px-2 pt-2 text-xs font-medium text-text-muted">{onderwerp.title}</p>
                    <ul>
                      {onderwerp.clusters.map((cluster) => (
                        <li key={cluster.id}>{clusterKeuze(cluster)}</li>
                      ))}
                    </ul>
                  </li>
                ))
              : blok.clusters.map((cluster) => <li key={cluster.id}>{clusterKeuze(cluster)}</li>)}
          </ul>
        )}
      </li>
    )
  }

  function hoofdstukLijst(hoofdstuk: ToetsHoofdstuk) {
    const ids = clusterIdsVanHoofdstuk(hoofdstuk)
    const open = openChapters.has(hoofdstuk.id)
    const heeftKinderen =
      hoofdstuk.paragrafen.some((paragraaf) =>
        paragraaf.blokken.some((blok) => blok.heeftOpgaven),
      ) || hoofdstuk.losseOnderwerpen.length > 0
    if (!heeftKinderen && ids.length === 0) return null
    return (
      <li key={hoofdstuk.id}>
        <div className="flex min-h-11 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2 md:min-h-0">
          {heeftKinderen ? (
            <ExpandButton
              open={open}
              label={open ? t('collapse') : t('expand')}
              onClick={() => wissel(openChapters, hoofdstuk.id, setOpenChapters)}
            />
          ) : (
            <span className="size-11 shrink-0 md:size-5" />
          )}
          <TriCheckbox
            state={staatVan(ids)}
            onToggle={() => toggleIds(ids)}
            ariaLabel={hoofdstuk.title}
            disabled={ids.length === 0}
          />
          <span className="min-w-0 flex-1 break-words">
            <span className="inline-block w-9 text-center font-mono font-semibold">
              {hoofdstukCode(hoofdstuk.slug)}
            </span>
            {' – '}
            {hoofdstuk.title}
          </span>
        </div>
        {open && heeftKinderen && (
          <ul className="ml-7 space-y-0.5 border-l border-border pl-2">
            {hoofdstuk.paragrafen
              .filter((paragraaf) => paragraaf.blokken.some((blok) => blok.heeftOpgaven))
              .map((paragraaf) => (
              <li key={paragraaf.id}>
                <div className="flex min-h-11 items-center gap-2 px-2 text-sm">
                  <span className="shrink-0 font-mono text-xs font-semibold text-text-muted">
                    {paragraaf.label}
                  </span>
                  <span className="min-w-0 flex-1 break-words font-medium">{paragraaf.title}</span>
                </div>
                <ul>{paragraaf.blokken.map((blok) => blokRij(blok))}</ul>
              </li>
            ))}
            {hoofdstuk.losseOnderwerpen.map((onderwerp) => onderwerpRij(onderwerp))}
          </ul>
        )}
      </li>
    )
  }

  return <ul className="space-y-0.5">{boom.map((hoofdstuk) => hoofdstukLijst(hoofdstuk))}</ul>
}
