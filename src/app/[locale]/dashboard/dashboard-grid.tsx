'use client'

import { useMemo } from 'react'

import { cn } from '@/components/ui'

import { TopicBlock, type TopicData } from './topic-block'

export type ActivityDay = { date: string; count: number }
export type Stumble = { slug: string; label: string; topic: string; count: number }

export function DashboardGrid({
  topicData,
  streakDays = 0,
  activity = [],
  stumbles = [],
  totalAnswered = 0,
  totalCorrect = 0,
}: {
  topicData: TopicData[]
  streakDays?: number
  activity?: ActivityDay[]
  stumbles?: Stumble[]
  totalAnswered?: number
  totalCorrect?: number
}) {
  const allClusters = useMemo(() => topicData.flatMap((t) => t.clusters), [topicData])
  const mastered = allClusters.filter((c) => c.isKnown).length
  const total = allClusters.length
  const pctOverall = total > 0 ? Math.round((mastered / total) * 100) : 0
  const pctAccuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0

  return (
    <>
      {/* KPI row */}
      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiHero pct={pctOverall} mastered={mastered} total={total} />
        <KpiCard label="Streak" value={String(streakDays)} sub="dagen op rij" tone="warn" />
        <KpiCard label="Accuracy" value={`${pctAccuracy}%`} sub={`${totalCorrect} van ${totalAnswered}`} tone="accent" />
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
            {topicData.map((topic) => (
              <TopicBlock key={topic.id} topic={topic} />
            ))}
          </div>
        </div>

        {/* Right: activity + stumbles */}
        <div className="space-y-3">
          <ActivityCard activity={activity} />
          <StumbleCard stumbles={stumbles} />
        </div>
      </div>
    </>
  )
}

function KpiHero({ pct, mastered, total }: { pct: number; mastered: number; total: number }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-4">
        <Ring pct={pct} size={76} stroke={8} />
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
  sub: string
  tone: 'accent' | 'warn' | 'neutral'
}) {
  const valueColor =
    tone === 'accent' ? 'text-accent' : tone === 'warn' ? 'text-accent-2' : 'text-text'
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</div>
      <div className={cn('font-serif text-2xl', valueColor)}>{value}</div>
      <div className="text-xs text-text-muted">{sub}</div>
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

function StumbleCard({ stumbles }: { stumbles: Stumble[] }) {
  const max = Math.max(1, ...stumbles.map((s) => s.count))
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
        Waar struikel je het vaakst?
      </div>
      {stumbles.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">Nog geen foutpatroon zichtbaar — blijf oefenen.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {stumbles.slice(0, 5).map((s) => (
            <li key={s.slug} className="flex items-center gap-3 text-sm">
              <div className="min-w-0 flex-1">
                <div className="truncate text-text">{s.label}</div>
                {s.topic && <div className="text-[10px] text-text-muted">{s.topic}</div>}
              </div>
              <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-accent-2"
                  style={{ width: `${(s.count / max) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-text-muted">{s.count}×</span>
            </li>
          ))}
        </ul>
      )}
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
