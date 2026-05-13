'use client'

import { useState } from 'react'

export function ChapterSection({
  slug,
  title,
  exampleLabel,
  children,
  footer,
}: {
  slug: string
  title: string
  exampleLabel: string
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  const [open, setOpen] = useState(true)

  return (
    <section id={slug} className="scroll-mt-20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-end justify-between gap-4 border-b border-border pb-4 text-left transition hover:border-accent"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            {exampleLabel}
          </p>
          <h2 className="mt-1 font-serif text-3xl text-text">{title}</h2>
        </div>
        <span className="shrink-0 pb-1 text-text-muted" aria-hidden>
          {open ? '▲' : '▼'}
        </span>
      </button>

      {open && (
        <>
          <div className="mt-6 space-y-4">{children}</div>
          {footer && <div className="mt-6">{footer}</div>}
        </>
      )}
    </section>
  )
}
