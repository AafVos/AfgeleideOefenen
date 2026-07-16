import { Link } from '@/i18n/navigation'

import { cn } from '@/components/ui'
import type { NewExerciseTile } from '@/lib/practice/chapter-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

export type TileSubSection = {
  label: string              // cluster name — empty string = no heading
  tiles: NewExerciseTile[]
}

export type TileSection = {
  id?: string                // anchor voor scroll-navigatie vanuit de zijbalk
  label?: string             // topic name — undefined = no heading
  subSections: TileSubSection[]
}

function TileGrid({
  baseHref,
  tiles,
  activeQuestionId,
  labels,
}: {
  baseHref: string
  tiles: NewExerciseTile[]
  activeQuestionId: string | null
  labels: {
    lastCorrect: string
    lastWrong: string
    notTried: string
    exercise: string
  }
}) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile) => {
        const tileHref = `${baseHref}&q=${encodeURIComponent(tile.questionId)}`
        const active = activeQuestionId === tile.questionId
        return (
          <li key={tile.questionId}>
            <Link
              href={tileHref as '/oefenen'}
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
              aria-label={`${labels.exercise} ${tile.ordinal}.${tile.preview ? ` ${tile.preview}` : ''}${tile.lastCorrect === true ? ` ${labels.lastCorrect}` : ''}${tile.lastCorrect === false ? ` ${labels.lastWrong}` : ''}${tile.lastCorrect == null ? ` ${labels.notTried}` : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-text-muted">
                  #{tile.ordinal}
                </span>
              </div>
              <ExerciseTileMathPreview latex_body={tile.latex_body} />
            </Link>
          </li>
        )
      })}
    </ul>
  )
}

export function ExerciseTileGrid({
  baseHref,
  sections,
  activeQuestionId,
  labels,
}: {
  baseHref: string
  sections: TileSection[]
  activeQuestionId: string | null
  labels: {
    heading: string
    lastCorrect: string
    lastWrong: string
    notTried: string
    exercise: string
  }
}) {
  const totalTiles = sections.flatMap((s) => s.subSections.flatMap((ss) => ss.tiles)).length
  if (!totalTiles) return null

  const tileLabels = {
    lastCorrect: labels.lastCorrect,
    lastWrong: labels.lastWrong,
    notTried: labels.notTried,
    exercise: labels.exercise,
  }

  return (
    <section className="mt-6" aria-label={labels.heading}>
      {sections.map((section, si) => (
        <div key={si} id={section.id} className={cn('scroll-mt-4', si > 0 && 'mt-10')}>
          {section.label && (
            <h3 className="mt-6 font-serif text-lg text-text">
              {section.label}
            </h3>
          )}
          {section.subSections.map((sub, ci) => (
            <div key={ci} className={ci > 0 || section.label ? 'mt-5' : ''}>
              {sub.label && (
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {sub.label}
                </p>
              )}
              <TileGrid
                baseHref={baseHref}
                tiles={sub.tiles}
                activeQuestionId={activeQuestionId}
                labels={tileLabels}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
