'use client'

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
  { label: 'x', insert: 'x', title: 'x' },
  { label: 'xⁿ', insert: '^', title: 'macht' },
  { label: '√', insert: 'sqrt(|)', title: 'wortel' },
  {
    label: <span className="font-serif italic">a⁄b</span>,
    insert: '(|)/()',
    title: 'breuk',
  },
  { label: 'π', insert: 'pi', title: 'pi' },
  { label: '·', insert: '*', title: 'vermenigvuldiging' },
  { label: '(', insert: '(|)', title: 'haakjes' },
  { label: '−', insert: '-', title: 'min' },
  { label: '+', insert: '+', title: 'plus' },
]

export function MathKeyboard({
  onInsert,
  onBackspace,
  onClear,
  disabled,
}: {
  onInsert: (text: string) => void
  onBackspace: () => void
  onClear: () => void
  disabled?: boolean
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Wiskundig toetsenbord">
      {KEYS.map((k) => (
        <button
          key={k.title}
          type="button"
          onClick={() => onInsert(k.insert)}
          disabled={disabled}
          title={k.title}
          aria-label={k.title}
          className={cn(
            'h-10 min-w-10 rounded-md border border-border bg-surface px-3 font-mono text-base text-text shadow-sm transition hover:border-accent hover:bg-accent-light disabled:opacity-50',
            k.className,
          )}
        >
          {k.label}
        </button>
      ))}

      <div className="ml-auto flex gap-1.5">
        <button
          type="button"
          onClick={onBackspace}
          disabled={disabled}
          title="Backspace"
          aria-label="Backspace"
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text shadow-sm transition hover:border-accent-2 hover:bg-accent-2-light disabled:opacity-50"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled}
          title="Wis alles"
          aria-label="Wis alles"
          className="h-10 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text shadow-sm transition hover:border-accent-2 hover:bg-accent-2-light disabled:opacity-50"
        >
          Wis
        </button>
      </div>
    </div>
  )
}
