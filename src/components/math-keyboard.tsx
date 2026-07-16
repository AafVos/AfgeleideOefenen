'use client'

import { useState } from 'react'

import { Math as TeX } from '@/components/math'
import { cn } from '@/components/ui'

type Key = {
  /** Wat er visueel op de knop staat (mag KaTeX / HTML zijn) */
  label: React.ReactNode
  /**
   * De tekst die in de input wordt ingevoegd. Gebruik `|` om de cursor na het
   * invoegen op die plek te zetten (wordt verwijderd uit de ingevoegde tekst).
   */
  insert: string
  /** A11y-label voor screen readers */
  title: string
  /** Extra tailwind klassen */
  className?: string
}

const KEYS: Key[] = [
  { label: 'xⁿ', insert: '^(|)', title: 'macht' },
  { label: '√', insert: 'sqrt(|)', title: 'wortel' },
  {
    label: (
      <span className="flex flex-col items-center font-serif italic leading-none">
        <span className="text-[11px]">a</span>
        <span className="my-0.5 h-px w-3.5 bg-current" aria-hidden />
        <span className="text-[11px]">b</span>
      </span>
    ),
    insert: '(|)/()',
    title: 'breuk',
  },
  { label: 'π', insert: 'pi', title: 'pi' },
]

export function MathKeyboard({
  onInsert,
  disabled,
}: {
  onInsert: (text: string) => void
  /** Niet meer gebruikt — backspace/wissen gaan via het gewone toetsenbord */
  onBackspace?: () => void
  onClear?: () => void
  disabled?: boolean
}) {
  const [showHelp, setShowHelp] = useState(false)

  return (
    <div className="mt-2" aria-label="Wiskundig toetsenbord">
    <div className="flex flex-wrap gap-1 sm:gap-1.5">
      {KEYS.map((k) => (
        <button
          key={k.title}
          type="button"
          onClick={() => onInsert(k.insert)}
          disabled={disabled}
          title={k.title}
          aria-label={k.title}
          className={cn(
            'h-9 min-w-9 rounded-md border border-border bg-surface px-2.5 font-mono text-sm text-text shadow-sm transition hover:border-accent hover:bg-accent-light disabled:opacity-50 sm:h-10 sm:min-w-10 sm:px-3 sm:text-base',
            k.className,
          )}
        >
          {k.label}
        </button>
      ))}

      <div className="ml-auto flex gap-1 sm:gap-1.5">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          title="Uitleg over machten typen"
          aria-label="Uitleg over machten typen"
          aria-expanded={showHelp}
          className={cn(
            'h-9 rounded-md border border-border bg-surface px-2.5 text-sm font-medium text-text-muted shadow-sm transition hover:border-accent hover:bg-accent-light hover:text-text sm:h-10 sm:px-3',
            showHelp && 'border-accent bg-accent-light text-text',
          )}
        >
          ?
        </button>
      </div>
    </div>

    {showHelp && (
      <div className="mt-2 flex flex-wrap gap-2">
        <div className="w-fit rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Machten typen
          </p>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex items-baseline gap-3">
              <span className="w-24 shrink-0 font-mono text-text">x^2</span>
              <span className="text-text-muted" aria-hidden>→</span>
              <span className="font-serif"><TeX tex="x^{2}" /></span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="w-24 shrink-0 font-mono text-text">x^(2x-1)</span>
              <span className="text-text-muted" aria-hidden>→</span>
              <span className="font-serif"><TeX tex="x^{2x-1}" /></span>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-muted">
            De xⁿ-knop zet de haakjes alvast voor je neer, met de cursor ertussen.
          </p>
        </div>

        <div className="w-fit rounded-xl border border-border bg-surface px-4 py-3 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
            Breuken typen
          </p>
          <div className="mt-2 space-y-1.5 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-text">2/3</span>
              <span className="text-text-muted" aria-hidden>→</span>
              <span className="font-serif"><TeX tex="\dfrac{2}{3}" /></span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 shrink-0 font-mono text-text">(2x)/(x+1)</span>
              <span className="text-text-muted" aria-hidden>→</span>
              <span className="font-serif"><TeX tex="\dfrac{2x}{x+1}" /></span>
            </div>
          </div>
          <p className="mt-3 max-w-xs text-xs leading-relaxed text-text-muted">
            De breukknop zet de haakjes alvast voor je neer, met de cursor in de teller.
          </p>
        </div>
      </div>
    )}
    </div>
  )
}
