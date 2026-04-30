import Link from 'next/link'

import { cn } from '@/components/ui'
import type { ExerciseTile } from '@/lib/practice/free-topic-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

const DIFF_LABEL: Record<1 | 2 | 3, string> = {
  1: 'Makkelijk',
  2: 'Medium',
  3: 'Lastig',
}

export function ExerciseTileGrid({
  topicSlug,
  tiles,
  activeQuestionId,
}: {
  topicSlug: string
  tiles: ExerciseTile[]
  activeQuestionId: string | null
}) {
  if (!tiles.length) return null

  return (
    <section className="mt-10" aria-labelledby="oefenen-overzicht">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <h2 id="oefenen-overzicht" className="font-serif text-xl text-text">
          Opgaven-overzicht
        </h2>
        <p className="text-xs text-text-muted">
          Gesorteerd op niveau (1→3); groen/rood uit je laatste poging bij deze site.
        </p>
      </div>
      <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {tiles.map((t) => {
          const topicQ = `/oefenen?topic=${encodeURIComponent(topicSlug)}&q=${encodeURIComponent(t.questionId)}`
          const active = activeQuestionId === t.questionId
          return (
            <li key={t.questionId}>
              <Link
                href={`${topicQ}#oefenen-practice`}
                scroll
                prefetch={false}
                className={cn(
                  'block min-h-[6.75rem] rounded-xl border px-3 py-3 transition',
                  active &&
                    'ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-bg)]',
                  t.lastCorrect === true &&
                    'border-emerald-300/70 bg-emerald-50 hover:border-emerald-400',
                  t.lastCorrect === false &&
                    'border-rose-300/70 bg-rose-50/90 hover:border-rose-400',
                  t.lastCorrect == null &&
                    'border-border bg-surface hover:bg-surface-2',
                )}
                aria-current={active ? 'page' : undefined}
                aria-label={`Opgave ${t.ordinal}, niveau ${t.difficulty}, ${DIFF_LABEL[t.difficulty]}.${t.preview ? ` ${t.preview}` : ''}${t.lastCorrect === true ? ' Laatste keer goed.' : ''}${t.lastCorrect === false ? ' Laatste keer fout.' : ''}${t.lastCorrect == null ? ' Nog niet geprobeerd.' : ''}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-text-muted">
                    #{t.ordinal}
                  </span>
                  <span
                    title={DIFF_LABEL[t.difficulty]}
                    className={cn(
                      'shrink-0 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums',
                      t.difficulty === 1 &&
                        'bg-accent-light text-accent',
                      t.difficulty === 2 &&
                        'bg-surface-2 text-text-muted',
                      t.difficulty === 3 &&
                        'border border-accent-2/30 bg-accent-2-light text-accent-2',
                    )}
                  >
                    {DIFF_LABEL[t.difficulty]}
                  </span>
                </div>
                <ExerciseTileMathPreview
                  latex_body={t.latex_body}
                  body={t.body}
                />
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
