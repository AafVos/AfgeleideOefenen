import { KlikLink } from '@/components/klik-link'
import { cn } from '@/components/ui'
import type { NewExerciseTile } from '@/lib/practice/chapter-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

export type TileSubSection = {
  id?: string
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
  onKies,
  labels,
}: {
  baseHref: string
  tiles: NewExerciseTile[]
  activeQuestionId: string | null
  onKies?: (questionId: string) => void
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
        const kaart = cn(
          'overflow-hidden rounded-xl border transition',
          active && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-bg)]',
          tile.lastCorrect === true && 'border-emerald-300/70 bg-emerald-50',
          tile.lastCorrect === false && 'border-rose-300/70 bg-rose-50/90',
          tile.lastCorrect == null && 'border-border bg-surface',
        )
        const bron = tile.sourceLabel
        return (
          <li key={tile.questionId} className={kaart}>
            {bron ? (
              <div className="px-3 pt-2">
                {tile.sourceUrl ? (
                  <a
                    href={tile.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center text-left text-xs leading-snug text-accent underline-offset-2 hover:underline"
                  >
                    {bron}
                  </a>
                ) : (
                  <p className="py-2 text-xs leading-snug text-text-muted">{bron}</p>
                )}
              </div>
            ) : null}
            <KlikLink
              href={tileHref as '/oefenen'}
              prefetch={false}
              bezigTekst="Opgave openen"
              onClick={
                onKies
                  ? (event) => {
                      if (
                        event.metaKey ||
                        event.ctrlKey ||
                        event.shiftKey ||
                        event.altKey ||
                        event.button !== 0
                      ) {
                        return
                      }
                      event.preventDefault()
                      onKies(tile.questionId)
                    }
                  : undefined
              }
              className={cn(
                'block min-h-[6.75rem] px-3 py-3',
                tile.lastCorrect === true && 'hover:bg-emerald-100/60',
                tile.lastCorrect === false && 'hover:bg-rose-100/70',
                tile.lastCorrect == null && 'hover:bg-surface-2',
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={`${labels.exercise} ${tile.ordinal}.${bron ? ` ${bron}.` : ''}${tile.preview ? ` ${tile.preview}` : ''}${tile.lastCorrect === true ? ` ${labels.lastCorrect}` : ''}${tile.lastCorrect === false ? ` ${labels.lastWrong}` : ''}${tile.lastCorrect == null ? ` ${labels.notTried}` : ''}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs font-medium text-text-muted">
                  #{tile.ordinal}
                </span>
              </div>
              <ExerciseTileMathPreview latex_body={tile.latex_body} />
            </KlikLink>
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
  onKies,
  labels,
}: {
  baseHref: string
  sections: TileSection[]
  activeQuestionId: string | null
  /** Gewone klik: opgave openen zonder de pagina opnieuw te tekenen. */
  onKies?: (questionId: string) => void
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
            <div
              key={ci}
              id={sub.id}
              className={cn('scroll-mt-14 lg:scroll-mt-4', ci > 0 || section.label ? 'mt-5' : '')}
            >
              {sub.label && (
                <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                  {sub.label}
                </p>
              )}
              <TileGrid
                baseHref={baseHref}
                tiles={sub.tiles}
                activeQuestionId={activeQuestionId}
                onKies={onKies}
                labels={tileLabels}
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
