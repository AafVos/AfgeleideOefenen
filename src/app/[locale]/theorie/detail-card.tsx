'use client'

import { useState } from 'react'

import { Math as TeX, RichMath } from '@/components/math'
import type { OverviewCard } from '@/lib/theory'

export function DetailCard({
  card,
  exampleLabel,
  stepLabel,
}: {
  card: OverviewCard
  exampleLabel: string
  stepLabel: string
}) {
  const [open, setOpen] = useState(false)
  const hasExamples = card.examples && card.examples.length > 0

  return (
    <article id={card.id} className="overflow-hidden rounded-xl border border-border bg-surface scroll-mt-24">
      <div className="p-5">
        <h3 className="mb-3 font-serif text-lg text-text">{card.title}</h3>
        {card.formula && (
          <div className="overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-2 text-[0.85em]">
            <TeX tex={card.formula} displayMode />
          </div>
        )}
      </div>

      {hasExamples && (
        <>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="flex w-full items-center justify-between border-t border-border px-5 py-3 text-left transition hover:bg-surface-2"
          >
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {exampleLabel}
            </span>
            <span className="shrink-0 text-xs text-text-muted" aria-hidden>
              {open ? '▲' : '▼'}
            </span>
          </button>

          {open && (
            <ul className="space-y-3 px-5 pb-5 pt-4">
              {card.examples!.map((ex, i) => (
                <li key={i} className="rounded-lg border border-border bg-surface-2">
                  <div className="overflow-x-auto px-4 py-3 text-[0.95em]">
                    <TeX
                      tex={`${ex.problem} \\implies ${ex.answer}`}
                      displayMode
                    />
                  </div>
                  {ex.steps && ex.steps.length > 0 && (
                    <ol className="border-t border-border px-4 pb-3 pt-3 space-y-2">
                      {ex.steps.map((step, si) => (
                        <li key={si} className="flex gap-3 text-sm text-text-muted">
                          <span className="mt-0.5 shrink-0 font-medium text-accent tabular-nums">
                            {stepLabel.replace('{n}', String(si + 1))}
                          </span>
                          <span className="flex-1">
                            <RichMath source={step} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </article>
  )
}
