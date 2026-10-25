import type { MouseEvent } from 'react'

import { KlikLink } from '@/components/klik-link'
import { cn } from '@/components/ui'
import type { NewExerciseTile } from '@/lib/practice/chapter-overview'

import { ExerciseTileMathPreview } from './exercise-tile-preview'

/**
 * Negeert een klik met modifier-toets of niet-linkermuisknop (nieuw
 * tabblad e.d.), zodat die een gewone link blijft in plaats van de
 * opgave meteen te openen.
 */
export function modifierVrijeKlik(actie: () => void) {
  return (event: MouseEvent) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
      return
    }
    event.preventDefault()
    actie()
  }
}

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
  rondleiding = false,
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
  /** De eerste tegel is het doelwit van de rondleiding. */
  rondleiding?: boolean
}) {
  return (
    <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {tiles.map((tile, index) => {
        const tileHref = `${baseHref}&q=${encodeURIComponent(tile.questionId)}`
        const active = activeQuestionId === tile.questionId
        const kaart = cn(
          'flex flex-col overflow-hidden rounded-xl border transition',
          active && 'ring-2 ring-accent ring-offset-2 ring-offset-[var(--color-bg)]',
          tile.lastCorrect === true && 'border-emerald-300/70 bg-emerald-50',
          tile.lastCorrect === false && 'border-rose-300/70 bg-rose-50/90',
          tile.lastCorrect == null && 'border-border bg-surface',
        )
        const bron = tile.sourceLabel
        return (
          <li
            key={tile.questionId}
            className={kaart}
            data-verhaal={tile.verhaal ? 'ja' : 'nee'}
            data-tour={rondleiding && index === 0 ? 'tegels' : undefined}
          >
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
              data-meet="oefenen-tegel"
              bezigTekst="Opgave openen"
              onClick={onKies ? modifierVrijeKlik(() => onKies(tile.questionId)) : undefined}
              className={cn(
                'block min-h-[6.75rem] flex-1 px-3 py-3',
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
  rondleiding = false,
}: {
  baseHref: string
  sections: TileSection[]
  activeQuestionId: string | null
  /** Gewone klik: opgave openen zonder de pagina opnieuw te tekenen. */
  onKies?: (questionId: string) => void
  /** De eerste tegel is het doelwit van de rondleiding. */
  rondleiding?: boolean
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

  const eersteMetTegels = sections.findIndex((section) =>
    section.subSections.some((sub) => sub.tiles.length > 0),
  )

  return (
    <section className="mt-6" aria-label={labels.heading}>
      {sections.map((section, si) => (
        <div key={si} id={section.id} className={cn('scroll-mt-4', si > 0 && 'mt-10')}>
          {section.label &&
            (() => {
              const eersteTegel = section.subSections.flatMap((sub) => sub.tiles)[0]
              if (!eersteTegel) {
                return (
                  <h3 className="mt-6 font-serif text-lg text-text">{section.label}</h3>
                )
              }
              return (
                <h3 className="mt-6">
                  <KlikLink
                    href={
                      `${baseHref}&q=${encodeURIComponent(eersteTegel.questionId)}` as '/oefenen'
                    }
                    prefetch={false}
                    data-meet="oefenen-kopje"
                    bezigTekst="Opgave openen"
                    onClick={onKies ? modifierVrijeKlik(() => onKies(eersteTegel.questionId)) : undefined}
                    className="font-serif text-lg text-text hover:text-accent"
                  >
                    {section.label}
                  </KlikLink>
                </h3>
              )
            })()}
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
                rondleiding={
                  rondleiding &&
                  si === eersteMetTegels &&
                  ci === section.subSections.findIndex((item) => item.tiles.length > 0)
                }
              />
            </div>
          ))}
        </div>
      ))}
    </section>
  )
}
