'use client'

import { useState } from 'react'

import { Link } from '@/i18n/navigation'

import { cn } from '@/components/ui'

export type ClusterData = {
  id: string
  slug: string
  title: string
  topicId: string
  totalAnswered: number
  totalCorrect: number
  isKnown: boolean
  isSkipped: boolean
}

export type TopicData = {
  id: string
  slug: string
  title: string
  chapterSlug: string
  clusters: ClusterData[]
}

export function TopicBlock({ topic }: { topic: TopicData }) {
  const [open, setOpen] = useState(false)

  const mastered = topic.clusters.filter((c) => c.isKnown).length
  const total = topic.clusters.length
  const weightedProgress = topic.clusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pct = total > 0 ? Math.round((weightedProgress / total) * 100) : 0

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
        <span className="flex-1 font-serif text-[15px] text-text">{topic.title}</span>
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
          {topic.clusters.map((cluster) => {
            const acc =
              cluster.totalAnswered > 0
                ? Math.round((cluster.totalCorrect / cluster.totalAnswered) * 100)
                : null
            return (
              <li key={cluster.id} className="flex items-center gap-3 px-4 py-1.5 text-sm">
                <span
                  className={cn(
                    'size-1.5 shrink-0 rounded-full',
                    cluster.isKnown ? 'bg-accent' : 'bg-border',
                  )}
                />
                <Link
                  href={`/oefenen?chapter=${encodeURIComponent(topic.chapterSlug)}&topic=${encodeURIComponent(topic.slug)}&cluster=${encodeURIComponent(cluster.slug)}`}
                  className="min-w-0 flex-1 truncate text-text hover:text-accent hover:underline"
                >
                  {cluster.title}
                </Link>
                <span
                  className={cn(
                    'shrink-0 tabular-nums text-xs',
                    acc === null ? 'text-text-muted/40' : acc >= 70 ? 'font-medium text-accent' : 'text-text-muted',
                  )}
                >
                  {acc === null ? '—' : `${acc}%`}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
