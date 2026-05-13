'use client'

import { useRouter } from 'next/navigation'
import { useMemo, useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'

import { Button, ErrorBanner } from '@/components/ui'
import type {
  ConfigData,
  QuestionSource,
} from '@/lib/practice/custom-test'

import { createCustomTestAction } from './actions'

type CheckState = 'all' | 'none' | 'some'

function checkStateFromCounts(selected: number, total: number): CheckState {
  if (total === 0) return 'none'
  if (selected === 0) return 'none'
  if (selected >= total) return 'all'
  return 'some'
}

function TriCheckbox({
  state,
  onToggle,
  ariaLabel,
}: {
  state: CheckState
  onToggle: () => void
  ariaLabel: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'all' ? 'true' : state === 'some' ? 'mixed' : 'false'}
      aria-label={ariaLabel}
      onClick={onToggle}
      className={`flex size-5 shrink-0 items-center justify-center rounded border transition ${
        state === 'all'
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

export function ConfigForm({
  config,
  defaultName,
}: {
  config: ConfigData
  defaultName: string
}) {
  const t = useTranslations('ZelfToets')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [name, setName] = useState(defaultName)
  const [selectedClusters, setSelectedClusters] = useState<Set<string>>(new Set())
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set(config.chapters.map((c) => c.id)),
  )
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set())
  const [count, setCount] = useState(10)
  const [source, setSource] = useState<QuestionSource>('new')
  const [showAnswers, setShowAnswers] = useState<'immediate' | 'end'>('immediate')
  const [error, setError] = useState<string | null>(null)

  // Build lookups
  const clustersByTopic = useMemo(() => {
    const m = new Map<string, typeof config.clusters>()
    for (const cl of config.clusters) {
      const arr = m.get(cl.topic_id) ?? []
      arr.push(cl)
      m.set(cl.topic_id, arr)
    }
    return m
  }, [config.clusters])

  const topicsByChapter = useMemo(() => {
    const m = new Map<string, typeof config.topics>()
    for (const tp of config.topics) {
      const arr = m.get(tp.chapter_id) ?? []
      arr.push(tp)
      m.set(tp.chapter_id, arr)
    }
    return m
  }, [config.topics])

  // Pool size for selected clusters based on source
  const availableInScope = useMemo(() => {
    let total = 0
    for (const cl of config.clusters) {
      if (!selectedClusters.has(cl.id)) continue
      if (source === 'new') total += cl.newCount
      else if (source === 'wrong') total += cl.wrongCount
      else total += cl.questionCount
    }
    return total
  }, [config.clusters, selectedClusters, source])

  function toggleCluster(id: string) {
    setSelectedClusters((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function setClustersFor(ids: string[], on: boolean) {
    setSelectedClusters((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (on) next.add(id)
        else next.delete(id)
      }
      return next
    })
  }

  function toggleTopic(topicId: string) {
    const clusters = clustersByTopic.get(topicId) ?? []
    const selectedCount = clusters.filter((c) => selectedClusters.has(c.id)).length
    const state = checkStateFromCounts(selectedCount, clusters.length)
    setClustersFor(
      clusters.map((c) => c.id),
      state !== 'all',
    )
  }

  function toggleChapter(chapterId: string) {
    const topics = topicsByChapter.get(chapterId) ?? []
    const allClusterIds = topics.flatMap((tp) =>
      (clustersByTopic.get(tp.id) ?? []).map((c) => c.id),
    )
    const selectedCount = allClusterIds.filter((id) => selectedClusters.has(id)).length
    const state = checkStateFromCounts(selectedCount, allClusterIds.length)
    setClustersFor(allClusterIds, state !== 'all')
  }

  function toggleExpand(set: Set<string>, setter: (s: Set<string>) => void, id: string) {
    const next = new Set(set)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setter(next)
  }

  function chapterState(chapterId: string): CheckState {
    const topics = topicsByChapter.get(chapterId) ?? []
    const all = topics.flatMap((tp) =>
      (clustersByTopic.get(tp.id) ?? []).map((c) => c.id),
    )
    const sel = all.filter((id) => selectedClusters.has(id)).length
    return checkStateFromCounts(sel, all.length)
  }

  function topicState(topicId: string): CheckState {
    const clusters = clustersByTopic.get(topicId) ?? []
    const sel = clusters.filter((c) => selectedClusters.has(c.id)).length
    return checkStateFromCounts(sel, clusters.length)
  }

  function clusterCountLabel(cl: ConfigData['clusters'][number]): string {
    if (source === 'new') return `${cl.newCount}`
    if (source === 'wrong') return `${cl.wrongCount}`
    return `${cl.questionCount}`
  }

  const effectiveCount = Math.min(count, availableInScope)
  const canSubmit = selectedClusters.size > 0 && availableInScope > 0 && count > 0

  function submit() {
    setError(null)
    if (!canSubmit) {
      setError(t('errorEmpty'))
      return
    }
    startTransition(async () => {
      const res = await createCustomTestAction({
        clusterIds: Array.from(selectedClusters),
        count: effectiveCount,
        source,
        name: name.trim() || defaultName,
        showAnswers,
      })
      if ('error' in res) {
        setError(res.error)
        return
      }
      router.push(`/zelf-toets/loop/${res.sessionId}`)
    })
  }

  return (
    <div className="space-y-8">
      {/* Name */}
      <div>
        <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('nameLabel')}
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={80}
          className="w-full max-w-sm rounded-md border border-border bg-surface px-3 py-2 text-sm text-text placeholder:text-text-muted/50"
          placeholder={defaultName}
        />
      </div>

      {/* Tree */}
      <div className="rounded-2xl border border-border bg-surface p-3">
        <p className="px-2 pb-2 pt-1 text-xs font-medium uppercase tracking-wider text-text-muted">
          {t('scopeLabel')}
        </p>
        <ul className="space-y-0.5">
          {config.chapters.map((ch) => {
            const topics = topicsByChapter.get(ch.id) ?? []
            const chExpanded = expandedChapters.has(ch.id)
            const chState = chapterState(ch.id)
            return (
              <li key={ch.id}>
                <div className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-surface-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(expandedChapters, setExpandedChapters, ch.id)}
                    className="flex size-5 shrink-0 items-center justify-center text-text-muted hover:text-text"
                    aria-label={chExpanded ? t('collapse') : t('expand')}
                    disabled={topics.length === 0}
                  >
                    {topics.length > 0 && (
                      <svg
                        viewBox="0 0 24 24"
                        className={`size-3 transition-transform ${chExpanded ? 'rotate-90' : ''}`}
                        fill="currentColor"
                      >
                        <path d="M8 5l8 7-8 7V5z" />
                      </svg>
                    )}
                  </button>
                  <TriCheckbox
                    state={chState}
                    onToggle={() => toggleChapter(ch.id)}
                    ariaLabel={ch.title}
                  />
                  <span className="flex-1 truncate">
                    <span className="font-mono font-semibold">
                      {ch.slug.toUpperCase()}
                    </span>
                    {' – '}
                    {ch.title}
                  </span>
                </div>

                {chExpanded && topics.length > 0 && (
                  <ul className="ml-7 space-y-0.5 border-l border-border pl-2">
                    {topics.map((tp) => {
                      const clusters = clustersByTopic.get(tp.id) ?? []
                      const isSingle = clusters.length === 1
                      const tpExpanded = expandedTopics.has(tp.id)
                      const tpState = topicState(tp.id)

                      // Single-cluster topic: collapse to cluster row using topic label
                      if (isSingle) {
                        const onlyCluster = clusters[0]!
                        const checked = selectedClusters.has(onlyCluster.id)
                        return (
                          <li key={tp.id}>
                            <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2">
                              <span className="size-5 shrink-0" />
                              <TriCheckbox
                                state={checked ? 'all' : 'none'}
                                onToggle={() => toggleCluster(onlyCluster.id)}
                                ariaLabel={onlyCluster.title}
                              />
                              <span className="flex-1 truncate">{onlyCluster.title}</span>
                              <span className="shrink-0 text-text-muted tabular-nums">
                                {clusterCountLabel(onlyCluster)}
                              </span>
                            </label>
                          </li>
                        )
                      }

                      return (
                        <li key={tp.id}>
                          <div className="flex items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2">
                            <button
                              type="button"
                              onClick={() => toggleExpand(expandedTopics, setExpandedTopics, tp.id)}
                              className="flex size-5 shrink-0 items-center justify-center text-text-muted hover:text-text"
                              aria-label={tpExpanded ? t('collapse') : t('expand')}
                              disabled={clusters.length === 0}
                            >
                              {clusters.length > 0 && (
                                <svg
                                  viewBox="0 0 24 24"
                                  className={`size-3 transition-transform ${tpExpanded ? 'rotate-90' : ''}`}
                                  fill="currentColor"
                                >
                                  <path d="M8 5l8 7-8 7V5z" />
                                </svg>
                              )}
                            </button>
                            <TriCheckbox
                              state={tpState}
                              onToggle={() => toggleTopic(tp.id)}
                              ariaLabel={tp.title}
                            />
                            <span className="flex-1 truncate">{tp.title}</span>
                          </div>

                          {tpExpanded && clusters.length > 0 && (
                            <ul className="ml-7 space-y-0.5 border-l border-border pl-2">
                              {clusters.map((cl) => {
                                const checked = selectedClusters.has(cl.id)
                                return (
                                  <li key={cl.id}>
                                    <label className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs hover:bg-surface-2">
                                      <span className="size-5 shrink-0" />
                                      <TriCheckbox
                                        state={checked ? 'all' : 'none'}
                                        onToggle={() => toggleCluster(cl.id)}
                                        ariaLabel={cl.title}
                                      />
                                      <span className="flex-1 truncate">{cl.title}</span>
                                      <span className="shrink-0 text-text-muted tabular-nums">
                                        {clusterCountLabel(cl)}
                                      </span>
                                    </label>
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
      </div>

      {/* Filters */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('sourceLabel')}
          </p>
          <div className="space-y-2">
            {(['new', 'all', 'wrong'] as const).map((s) => (
              <label key={s} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="source"
                  value={s}
                  checked={source === s}
                  onChange={() => setSource(s)}
                  className="mt-1 accent-accent"
                />
                <span>
                  <span className="font-medium text-text">{t(`source.${s}`)}</span>
                  <span className="block text-xs text-text-muted">
                    {t(`source.${s}Hint`)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('showAnswersLabel')}
          </p>
          <div className="space-y-2">
            {(['immediate', 'end'] as const).map((m) => (
              <label key={m} className="flex cursor-pointer items-start gap-2 text-sm">
                <input
                  type="radio"
                  name="showAnswers"
                  value={m}
                  checked={showAnswers === m}
                  onChange={() => setShowAnswers(m)}
                  className="mt-1 accent-accent"
                />
                <span>
                  <span className="font-medium text-text">{t(`showAnswers.${m}`)}</span>
                  <span className="block text-xs text-text-muted">
                    {t(`showAnswers.${m}Hint`)}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-text-muted">
            {t('countLabel')}
          </p>
          <input
            type="number"
            min={1}
            max={Math.max(1, availableInScope)}
            value={count}
            onChange={(e) => setCount(Math.max(1, Number(e.target.value) || 1))}
            className="w-32 rounded-md border border-border bg-surface px-3 py-2 text-sm"
          />
          <p className="mt-2 text-xs text-text-muted">
            {t('availableLabel', { n: availableInScope })}
          </p>
          {count > availableInScope && availableInScope > 0 && (
            <p className="mt-1 text-xs text-accent-2">
              {t('cappedHint', { n: availableInScope })}
            </p>
          )}
        </div>
      </div>

      <ErrorBanner>{error}</ErrorBanner>

      <div className="flex items-center gap-3">
        <Button onClick={submit} disabled={!canSubmit || pending}>
          {pending ? t('startPending') : t('startLabel')}
        </Button>
        <span className="text-sm text-text-muted">
          {availableInScope === 0 && selectedClusters.size > 0
            ? t('noQuestionsHint')
            : null}
        </span>
      </div>
    </div>
  )
}
