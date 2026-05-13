'use client'

import { useEffect, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'

import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'

import type { TopicWithClustersNew } from '@/lib/practice/engine'

// Duolingo-style quest path — drop-in replacement for PracticeSidebar.
// Same props (path, activeClusterId). Renders a vertical, alternating path of
// nodes; each node is a cluster, each section header is a topic.
//
// Node states:
//   - mastered           → solid coloured pill with check
//   - in_progress        → outlined pill with current cluster percentage
//   - active (current)   → "start hier" tooltip, animated
//   - locked             → muted pill with lock
//   - skipped            → dashed pill, struck through

const TOPIC_TINTS = [
  '#2d6a4f', // accent
  '#3a7e6e',
  '#a8552d',
  '#7a4a8a',
  '#1f5d5d',
]

export function QuestPath({
  path,
  activeClusterId,
}: {
  path: TopicWithClustersNew[]
  activeClusterId: string | null
}) {
  const params = useSearchParams()
  const topicParam = params.get('topic')
  const clusterParam = params.get('cluster')
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    setLoadingId(null)
  }, [clusterParam])

  const nodes = useMemo(() => {
    const out: Array<{
      cluster: TopicWithClustersNew['clusters'][number]
      topic: TopicWithClustersNew
      topicIdx: number
      chapterIdx: number
      clusterIdx: number
      isFirstInTopic: boolean
      isFirstInChapter: boolean
    }> = []
    let prevChapterSlug: string | null = null
    let chapterIdx = -1
    path.forEach((topic, topicIdx) => {
      topic.clusters.forEach((cluster, clusterIdx) => {
        const isFirstInChapter = clusterIdx === 0 && topic.chapter_slug !== prevChapterSlug
        if (isFirstInChapter) {
          chapterIdx++
          prevChapterSlug = topic.chapter_slug
        }
        out.push({
          cluster,
          topic,
          topicIdx,
          chapterIdx,
          clusterIdx,
          isFirstInTopic: clusterIdx === 0,
          isFirstInChapter,
        })
      })
    })
    return out
  }, [path])

  // Active cluster fallback: first non-mastered, non-locked-topic cluster.
  const computedActiveId = useMemo(() => {
    if (activeClusterId) return activeClusterId
    if (topicParam) {
      const t = path.find((x) => x.slug === topicParam && !x.isLocked)
      const c =
        t?.clusters.find((x) => x.status !== 'mastered') ??
        t?.clusters[t.clusters.length - 1]
      if (c) return c.id
    }
    for (const t of path) {
      if (t.isLocked) continue
      for (const c of t.clusters) {
        if (c.status !== 'mastered') return c.id
      }
    }
    return null
  }, [activeClusterId, path, topicParam])

  const renderNodes = (onSelect?: () => void) =>
    nodes.map((node, i) => (
      <PathRow
        key={node.cluster.id}
        node={node}
        index={i}
        prev={nodes[i - 1] ?? null}
        isActive={node.cluster.id === computedActiveId}
        isLoading={loadingId === node.cluster.id}
        onLoadStart={() => {
          setLoadingId(node.cluster.id)
          onSelect?.()
        }}
        tint={TOPIC_TINTS[node.chapterIdx % TOPIC_TINTS.length]}
      />
    ))

  return (
    <>
      {/* Mobile trigger bar */}
      <div className="sticky top-14 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-2 backdrop-blur lg:hidden">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Leerpad
        </span>
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-surface-2 px-3 py-1.5 text-sm font-medium text-text"
        >
          <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Overzicht
        </button>
      </div>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 flex w-[min(22rem,90vw)] flex-col overflow-hidden bg-surface shadow-2xl lg:hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-text-muted">Leerpad</p>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="flex size-7 items-center justify-center rounded-md text-text-muted hover:bg-surface-2 hover:text-text"
                aria-label="Sluiten"
              >
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="overflow-y-auto px-4 py-6">
              <div className="flex flex-col">
                {renderNodes(() => setDrawerOpen(false))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden border-r border-border bg-surface lg:block lg:w-[22rem] lg:shrink-0">
        <div className="sticky top-[3.5rem] max-h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-8">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Leerpad
          </p>
          <div className="mt-4 flex flex-col">
            {renderNodes()}
          </div>
        </div>
      </aside>
    </>
  )
}

function PathRow({
  node,
  index,
  prev,
  isActive,
  isLoading,
  onLoadStart,
  tint,
}: {
  node: {
    cluster: TopicWithClustersNew['clusters'][number]
    topic: TopicWithClustersNew
    topicIdx: number
    clusterIdx: number
    isFirstInTopic: boolean
    isFirstInChapter: boolean
  }
  index: number
  prev: {
    cluster: TopicWithClustersNew['clusters'][number]
    topic: TopicWithClustersNew
  } | null
  isActive: boolean
  isLoading: boolean
  onLoadStart: () => void
  tint: string
}) {
  const offsetPx = Math.round(Math.sin(index * 0.55) * 60)
  const isMastered = node.cluster.status === 'mastered'
  const isLocked = node.topic.isLocked || node.cluster.status === 'locked'

  return (
    <div>
      {/* Chapter header — shown when the chapter changes */}
      {node.isFirstInChapter && (
        <div className="mt-8 mb-4 first:mt-0">
          <div className="rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-text-muted">
              {node.topic.chapter_slug.toUpperCase()}
            </p>
            <p className="mt-0.5 font-serif text-base font-medium leading-snug text-text">
              {node.topic.chapter_title}
            </p>
          </div>
        </div>
      )}

      <div className="relative flex min-h-[3.25rem] items-center justify-center">
        {prev && !node.isFirstInChapter && (
          <Connector
            prevOffset={Math.round(Math.sin((index - 1) * 0.55) * 60)}
            currOffset={offsetPx}
            mastered={isMastered && prev.cluster.status === 'mastered'}
            tint={tint}
          />
        )}
        <div style={{ transform: `translateX(${offsetPx}px)` }}>
          <NodePill
            cluster={node.cluster}
            topicSlug={node.topic.slug}
            tint={tint}
            isMastered={isMastered}
            isLocked={isLocked}
            isActive={isActive}
            isLoading={isLoading}
            onLoadStart={onLoadStart}
          />
        </div>
      </div>
    </div>
  )
}

function Connector({
  prevOffset,
  currOffset,
  mastered,
  tint,
}: {
  prevOffset: number
  currOffset: number
  mastered: boolean
  tint: string
}) {
  return (
    <svg
      className="pointer-events-none absolute -top-6 left-1/2 -translate-x-1/2"
      width="200"
      height="48"
      viewBox="-100 -24 200 48"
      aria-hidden
    >
      <path
        d={`M ${prevOffset},-20 Q 0,0 ${currOffset},20`}
        fill="none"
        stroke={mastered ? tint : 'var(--color-border)'}
        strokeWidth="2.25"
        strokeDasharray={mastered ? '0' : '3 5'}
      />
    </svg>
  )
}

function NodePill({
  cluster,
  topicSlug,
  tint,
  isMastered,
  isLocked,
  isActive,
  isLoading,
  onLoadStart,
}: {
  cluster: TopicWithClustersNew['clusters'][number]
  topicSlug: string
  tint: string
  isMastered: boolean
  isLocked: boolean
  isActive: boolean
  isLoading: boolean
  onLoadStart: () => void
}) {
  // Locked
  if (isLocked) {
    return (
      <span className="flex cursor-default items-center gap-2 rounded-full border border-border bg-surface-2 px-4 py-1.5 text-sm text-text-muted/60">
        <span className="flex size-6 items-center justify-center rounded-full bg-border text-[10px]">🔒</span>
        {cluster.title}
      </span>
    )
  }

  const href = `/leerpad?topic=${encodeURIComponent(topicSlug)}&cluster=${cluster.id}`

  // Mastered
  if (isMastered) {
    return (
      <Link
        href={href}
        onClick={onLoadStart}
        className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium text-white transition-transform hover:-translate-y-0.5"
        style={{ backgroundColor: tint, boxShadow: `0 3px 0 ${shade(tint, -22)}`, opacity: isLoading ? 0.7 : 1 }}
      >
        <span
          className="flex size-6 items-center justify-center rounded-full bg-white"
          style={{ color: tint }}
        >
          {isLoading ? <SpinnerIcon /> : <CheckIcon />}
        </span>
        {cluster.title}
      </Link>
    )
  }

  // Active / next-up
  if (isActive) {
    return (
      <div className="relative">
        {!isLoading && (
          <span
            className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-text px-2.5 py-0.5 text-[11px] font-medium text-white"
            aria-hidden
          >
            ▼ start hier
          </span>
        )}
        <Link
          href={href}
          onClick={onLoadStart}
          className="inline-flex items-center gap-2 rounded-full border-2 bg-surface px-4 py-2 text-sm font-medium animate-[questPulse_1.6s_ease-in-out_infinite]"
          style={{
            borderColor: tint,
            color: tint,
            boxShadow: `0 3px 0 ${tint}, 0 0 0 5px ${tint}22`,
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          <span
            className="flex size-7 items-center justify-center rounded-full text-white"
            style={{ backgroundColor: tint }}
          >
            {isLoading ? <SpinnerIcon /> : '▶'}
          </span>
          {cluster.title}
        </Link>
        <style>{`@keyframes questPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.03); } }`}</style>
      </div>
    )
  }

  // In-progress (not active)
  return (
    <Link
      href={href}
      onClick={onLoadStart}
      className="inline-flex items-center gap-2 rounded-full border-2 border-dashed bg-surface px-4 py-1.5 text-sm transition hover:bg-surface-2"
      style={{ borderColor: tint, color: tint, opacity: isLoading ? 0.7 : 1 }}
    >
      {isLoading ? (
        <SpinnerIcon style={{ color: tint }} />
      ) : (
        <span className="size-2 rounded-full" style={{ backgroundColor: tint }} />
      )}
      {cluster.title}
    </Link>
  )
}

function SpinnerIcon({ style }: { style?: CSSProperties }) {
  return (
    <svg
      className="size-3.5 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden
      style={style}
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      className="size-3.5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function romanize(n: number) {
  return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n - 1] ?? String(n)
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16)
  let r = (n >> 16) + amt
  let g = ((n >> 8) & 0xff) + amt
  let b = (n & 0xff) + amt
  r = Math.max(0, Math.min(255, r))
  g = Math.max(0, Math.min(255, g))
  b = Math.max(0, Math.min(255, b))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
