import { Link } from '@/i18n/navigation'

import { cn } from '@/components/ui'
import type { ExerciseTile } from '@/lib/practice/free-topic-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

export function ExerciseTileGrid({
  topicSlug,
  tiles,
  activeQuestionId,
  labels,
}: {
  topicSlug: string
  tiles: ExerciseTile[]
  activeQuestionId: string | null
  labels: {
    heading: string
    sortedBy: string
    easy: string
    medium: string
    hard: string
    lastCorrect: string
    lastWrong: string
    notTried: string
    exercise: string
    level: string
  }
}) {
  if (!tiles.length) return null

  const DIFF_LABEL: Record<1 | 2 | 3, string> = {
    1: labels.easy,
    2: labels.medium,
    3: labels.hard,
  }

  return (
    <section className="mt-10" aria-labelledby="oefenen-overzicht">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <h2 id="oefenen-overzicht" className="font-serif text-xl text-text">
          {labels.heading}
        </h2>
        <p className="text-xs text-text-muted">{labels.sortedBy}</p>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tiles.map((tile) => {
          const topicQ = `/oefenen?topic=${encodeURIComponent(topicSlug)}&q=${encodeURIComponent(tile.questionId)}`
          const active = activeQuestionId === tile.questionId
          return (
            <li key={tile.questionId}>
              <Link
                href={`${topicQ}#oefenen-practice`}
                scroll
                prefetch={false}
                className={cn(
                  'block min-h-[6.75rem] rounded-xl border px-3 py-3 transition',
                  active &&
                    'ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-bg)]',
                  tile.lastCorrect === true &&
                    'border-emerald-300/70 bg-emerald-50 hover:border-emerald-400',
                  tile.lastCorrect === false &&
                    'border-rose-300/70 bg-rose-50/90 hover:border-rose-400',
                  tile.lastCorrect == null &&
                    'border-border bg-surface hover:bg-surface-2',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={`${labels.exercise} ${tile.ordinal}, ${labels.level} ${tile.difficulty}, ${DIFF_LABEL[tile.difficulty]}.${tile.preview ? ` ${tile.preview}` : ''}${tile.lastCorrect === true ? ` ${labels.lastCorrect}` : ''}${tile.lastCorrect === false ? ` ${labels.lastWrong}` : ''}${tile.lastCorrect == null ? ` ${labels.notTried}` : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-text-muted">
                    #{tile.ordinal}
                  </span>
                  <span
                    title={DIFF_LABEL[tile.difficulty]}
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                      tile.difficulty === 1 &&
                        'bg-accent-light text-accent',
                      tile.difficulty === 2 &&
                        'bg-surface-2 text-text-muted',
                      tile.difficulty === 3 &&
                        'border border-accent-2/30 bg-accent-2-light text-accent-2',
                    )}
                  >
                    {DIFF_LABEL[tile.difficulty]}
                  </span>
                </div>
                <ExerciseTileMathPreview
                  latex_body={tile.latex_body}
                  body={tile.body}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
