import type { TopicWithClusters } from '@/lib/practice/engine'
import { cn } from '@/components/ui'

export function PracticeSidebar({
  path,
  activeClusterId,
}: {
  path: TopicWithClusters[]
  activeClusterId: string | null
}) {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-border bg-surface lg:block">
      <div className="sticky top-14 max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
        <p className="mb-3 text-xs font-medium uppercase tracking-wider text-text-muted">
          Leerlijn
        </p>
        <ol className="space-y-4">
          {path.map((topic) => (
            <li key={topic.id}>
              <TopicHeader topic={topic} />
              <ul className="mt-2 space-y-1 pl-1">
                {topic.clusters.map((c) => (
                  <li
                    key={c.id}
                    className={cn(
                      'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                      c.id === activeClusterId
                        ? 'bg-accent-light font-medium text-accent'
                        : 'text-text-muted',
                    )}
                  >
                    <ClusterDot status={c.status} />
                    <span className="flex-1 truncate">{c.title}</span>
                    {c.status === 'mastered' && (
                      <span className="text-xs">✓</span>
                    )}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </aside>
  )
}

function TopicHeader({ topic }: { topic: TopicWithClusters }) {
  const masteredCount = topic.clusters.filter(
    (c) => c.status === 'mastered',
  ).length
  return (
    <div className="flex items-baseline justify-between">
      <p
        className={cn(
          'font-serif text-sm',
          topic.isLocked ? 'text-text-muted' : 'text-text',
        )}
      >
        {topic.title}
        {topic.isLocked && (
          <span className="ml-1 text-xs text-text-muted">🔒</span>
        )}
      </p>
      <span className="text-xs text-text-muted">
        {masteredCount}/{topic.clusters.length}
      </span>
    </div>
  )
}

function ClusterDot({ status }: { status: string }) {
  if (status === 'mastered') {
    return <span className="inline-block size-2 rounded-full bg-accent" />
  }
  if (status === 'in_progress') {
    return <span className="inline-block size-2 rounded-full bg-warn" />
  }
  return (
    <span className="inline-block size-2 rounded-full border border-border bg-surface-2" />
  )
}
