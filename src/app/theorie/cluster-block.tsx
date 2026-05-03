'use client'

import { useState } from 'react'

import { Math as TeX } from '@/components/math'
import type { ClusterTheory } from '@/lib/theory'

export function ClusterBlock({
  ordinal,
  title,
  theory,
}: {
  ordinal: number
  title: string
  theory: ClusterTheory | undefined
}) {
  const [open, setOpen] = useState(false)

  return (
    <article className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-6 py-4 text-left transition hover:bg-surface-2"
      >
        <span className="font-serif text-sm text-text-muted shrink-0">{ordinal}.</span>
        <span className="flex-1 font-serif text-xl text-text">{title}</span>
        <span className="shrink-0 text-text-muted text-sm" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <div className="border-t border-border px-6 pb-6 pt-5">
          {!theory ? (
            <p className="text-sm text-text-muted">
              Nog geen theorie voor dit cluster — alleen oefenvragen.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-border bg-surface-2 px-4 py-3">
                <TeX tex={theory.rule} displayMode />
              </div>

              {theory.intro && (
                <p className="mt-4 text-sm leading-relaxed text-text-muted">
                  <RichText source={theory.intro} />
                </p>
              )}

              {theory.example && (
                <div className="mt-5 border-t border-border pt-5">
                  <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
                    Voorbeeld
                  </p>

                  <div className="mt-3 overflow-x-auto rounded-md bg-surface-2 px-4 py-3">
                    <TeX
                      tex={`${theory.example.problem} \\implies ${theory.example.answer}`}
                      displayMode
                    />
                  </div>

                  {theory.example.steps && theory.example.steps.length > 0 && (
                    <ol className="mt-4 space-y-2">
                      {theory.example.steps.map((step, i) => (
                        <li key={i} className="flex gap-3 text-sm text-text-muted">
                          <span className="mt-0.5 shrink-0 font-medium text-accent tabular-nums">
                            Stap {i + 1}
                          </span>
                          <span className="flex-1">
                            <RichText source={step} />
                          </span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </article>
  )
}

function RichText({ source }: { source: string }) {
  const parts = source.split(/(\$[^$]+\$)/)
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('$') && part.endsWith('$') && part.length > 2 ? (
          <TeX key={i} tex={part.slice(1, -1)} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
