'use client'

import { useMemo } from 'react'

import { cn } from '@/components/ui'

import { ChapterBlock, type ChapterData } from './topic-block'

export type ActivityDay = { date: string; count: number }

export function DashboardGrid({
  chapterData,
  streakDays = 0,
  activity = [],
  totalAnswered = 0,
  totalCorrect = 0,
}: {
  chapterData: ChapterData[]
  streakDays?: number
  activity?: ActivityDay[]
  totalAnswered?: number
  totalCorrect?: number
}) {
  const allClusters = useMemo(
    () => chapterData.flatMap((ch) => ch.topics.flatMap((t) => t.clusters)),
    [chapterData],
  )
  const mastered = allClusters.filter((c) => c.isKnown).length
  const total = allClusters.length
  const weightedProgress = allClusters.reduce((sum, c) => {
    if (c.isKnown) return sum + 1
    if (c.totalAnswered > 0) return sum + c.totalCorrect / c.totalAnswered
    return sum
  }, 0)
  const pctOverall = total > 0 ? Math.round((weightedProgress / total) * 100) : 0
  const pctAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <>
      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiHero pct={pctOverall} mastered={mastered} total={total} />
        <KpiCard label="Streak" value={String(streakDays)} sub="dagen op rij" tone="warn" />
        <KpiCard label="Accuracy" value={`${pctAccuracy}%`} tone="accent" />
        <KpiCard label="Vragen" value={String(totalAnswered)} sub="totaal beantwoord" tone="neutral" />
      </div>

      {/* 2-column layout */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: topic accordions */}
        <div className="lg:col-span-2">
          <p className="mb-3 text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Voortgang per hoofdstuk
          </p>
          <div className="space-y-2">
            {chapterData.map((chapter) => (
              <ChapterBlock key={chapter.id} chapter={chapter} />
            ))}
          </div>
        </div>

        {/* Right: activity */}
        <div className="space-y-3">
          <ActivityCard activity={activity} />
        </div>
      </div>
    </>
  )
}

function KpiHero({ pct, mastered, total }: { pct: number; mastered: number; total: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-3">
        <Ring pct={pct} size={60} stroke={7} />
        <div>
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">Mastery</div>
          <div className="font-serif text-xl text-text">
            {mastered} <span className="text-text-muted">/ {total}</span>
          </div>
          <div className="text-xs text-text-muted">
            onderdelen gemasterd
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string
  value: string
  sub?: string
  tone: 'accent' | 'warn' | 'neutral'
}) {
  const valueColor =
    tone === 'accent' ? 'text-accent' : tone === 'warn' ? 'text-accent-2' : 'text-text'
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={cn('font-serif text-2xl', valueColor)}>{value}</div>
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  )
}

function ActivityCard({ activity }: { activity: ActivityDay[] }) {
  const max = Math.max(1, ...activity.map((a) => a.count))
  const padded =
    activity.length >= 14
      ? activity.slice(-14)
      : [...Array(14 - activity.length).fill({ date: '', count: 0 } as ActivityDay), ...activity]
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        Afgelopen 14 dagen
      </div>
      <div className="mt-3 flex h-20 items-end gap-1">
        {padded.map((d, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm"
            style={{
              height: `${(d.count / max) * 92 + 6}%`,
              backgroundColor:
                d.count === 0 ? 'var(--color-border)' : `rgba(45, 106, 79, ${0.25 + (d.count / max) * 0.65})`,
            }}
            title={d.date ? `${d.date}: ${d.count}` : undefined}
          />
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[10px] text-text-muted">
        <span>14 dgn geleden</span>
        <span>vandaag</span>
      </div>
    </div>
  )
}

function Ring({ pct, size = 92, stroke = 9 }: { pct: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const dash = (pct / 100) * c
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-2)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--color-accent)"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${dash} ${c - dash}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="var(--font-serif)"
        fontSize={size * 0.26}
        fill="var(--color-text)"
      >
        {pct}%
      </text>
    </svg>
  )
}
