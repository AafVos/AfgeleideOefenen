'use client'

import { useState } from 'react'

import { Math as TeX } from '@/components/math'
import { CLUSTER_THEORY } from '@/lib/theory'

export function ClusterRuleHint({
  topicSlug,
  clusterSlug,
}: {
  topicSlug: string
  clusterSlug: string
}) {
  const [open, setOpen] = useState(false)
  const [exOpen, setExOpen] = useState(false)

  const info = CLUSTER_THEORY[`${topicSlug}/${clusterSlug}`]
  if (!info) return null

  return (
    <div className="mt-1">
      <button
        onClick={() => {
          setOpen((v) => !v)
          if (open) setExOpen(false)
        }}
        className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-xs text-text-muted transition hover:border-accent hover:text-accent"
        aria-expanded={open}
      >
        <span className="text-[10px]">{open ? '▲' : '▼'}</span>
        Uitleg
      </button>

      {open && (
        <div className="mt-2 rounded-lg border border-border bg-surface-2 px-4 py-3">
          <TeX tex={info.rule} displayMode />

          {info.example && (
            <div className="mt-3 border-t border-border pt-3">
              <button
                onClick={() => setExOpen((v) => !v)}
                className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-accent"
              >
                <span className="text-[10px]">{exOpen ? '▲' : '▼'}</span>
                Voorbeeld
              </button>

              {exOpen && (
                <div className="mt-2 space-y-2">
                  <div className="rounded-md bg-surface px-3 py-2">
                    <TeX
                      tex={`${info.example.problem} \\implies ${info.example.answer}`}
                      displayMode
                    />
                  </div>

                  {info.example.steps && (
                    <ol className="space-y-1.5 pl-1">
                      {info.example.steps.map((step, i) => (
                        <li
                          key={i}
                          className="flex gap-2 text-sm text-text-muted"
                        >
                          <span className="shrink-0 font-medium text-accent">
                            {i + 1}.
                          </span>
                          <RichStep text={step} />
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/** Rendert een stap-string met inline $...$ als KaTeX */
function RichStep({ text }: { text: string }) {
  const parts = text.split(/(\$[^$]+\$)/)
  return (
    <span>
      {parts.map((part, i) =>
        part.startsWith('$') && part.endsWith('$') ? (
          <TeX key={i} tex={part.slice(1, -1)} />
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </span>
  )
}
