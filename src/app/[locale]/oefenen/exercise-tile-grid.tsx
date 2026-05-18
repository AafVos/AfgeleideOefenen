import { Link } from '@/i18n/navigation'

import { cn } from '@/components/ui'
import type { NewExerciseTile } from '@/lib/practice/chapter-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

export type TileSubSection = {
  label: string              // cluster name — empty string = no heading
  tiles: NewExerciseTile[]
}

export type TileSection = {
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
              href={`${tileHref}#oefenen-practice`}
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
    sortedBy: string
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
    <section className="mt-10" aria-labelledby="oefenen-overzicht">
      <div className="flex flex-wrap items-end justify-between gap-2 border-b border-border pb-3">
        <h2 id="oefenen-overzicht" className="font-serif text-xl text-text">
          {labels.heading}
        </h2>
        <p className="text-xs text-text-muted">{labels.sortedBy}</p>
      </div>

      {sections.map((section, si) => (
        <div key={si} className={si > 0 ? 'mt-10' : ''}>
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
