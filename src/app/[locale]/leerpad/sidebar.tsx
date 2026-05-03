'use client'

import { Link } from '@/i18n/navigation'
import { useSearchParams } from 'next/navigation'

import type { TopicWithClusters } from '@/lib/practice/engine'

export function PracticeSidebar({
  path,
  activeClusterId,
}: {
  path: TopicWithClusters[]
  activeClusterId: string | null
}) {
  const params = useSearchParams()
  const topicParam = params.get('topic')

  return (
    <aside className="hidden border-r border-border bg-surface lg:block lg:w-64 lg:shrink-0">
      <div className="sticky top-[3.5rem] max-h-[calc(100vh-3.5rem)] overflow-y-auto py-8 pr-2 pl-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          Leerpad
        </p>
        <ul className="mt-3 flex flex-col gap-0.5">
          {path.map((topic) => {
            const isTopicActive = topicParam
              ? topic.slug === topicParam
              : topic.clusters.some((c) => c.id === activeClusterId)

            return (
              <li key={topic.id}>
                {topic.isLocked ? (
                  <span className="flex cursor-default items-center gap-2 rounded-md px-3 py-1.5 text-sm text-text-muted/40">
                    <span className="shrink-0 text-[10px]">🔒</span>
                    {topic.title}
                  </span>
                ) : (
                  <Link
                    href={`/leerpad?topic=${encodeURIComponent(topic.slug)}`}
                    className={
                      isTopicActive
                        ? 'flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1.5 text-sm font-semibold text-accent'
                        : 'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-2'
                    }
                  >
                    {topic.isMastered && (
                      <span className="shrink-0 text-[10px] text-green-500">✓</span>
                    )}
                    {topic.title}
                  </Link>
                )}

                {!topic.isLocked && isTopicActive && (
                  <ul className="mb-1 ml-3 flex flex-col gap-0.5 border-l border-border pl-3">
                    {topic.clusters.map((cluster) => {
                      const isClusterActive = cluster.id === activeClusterId
                      const isMastered = cluster.status === 'mastered'

                      return (
                        <li key={cluster.id}>
                          <Link
                            href={`/leerpad?topic=${encodeURIComponent(topic.slug)}&cluster=${cluster.id}`}
                            className={
                              isClusterActive
                                ? 'flex items-center gap-1.5 rounded-md bg-accent px-2 py-1 text-xs font-medium text-white'
                                : isMastered
                                  ? 'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-muted hover:bg-surface-2 hover:text-text'
                                  : 'flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-text-muted hover:bg-surface-2 hover:text-text'
                            }
                          >
                            {isMastered ? (
                              <span className="shrink-0 text-[9px] text-green-500">✓</span>
                            ) : isClusterActive ? null : (
                              <span className="size-1.5 shrink-0 rounded-full bg-current opacity-30" />
                            )}
                            {cluster.title}
                          </Link>
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
    </aside>
  )
}
