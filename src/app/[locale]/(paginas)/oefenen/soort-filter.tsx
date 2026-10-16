import { cn } from '@/components/ui'
import type { SoortKeuze } from '@/lib/practice/soort-filter'

const KNOPPEN: Array<{
  id: SoortKeuze
  label: (aantal: { gewoon: number; verhaal: number }) => string
}> = [
  { id: 'alles', label: (aantal) => `Alles (${aantal.gewoon + aantal.verhaal})` },
  { id: 'gewoon', label: (aantal) => `Gewone sommen (${aantal.gewoon})` },
  { id: 'verhaal', label: (aantal) => `Verhaaltjes (${aantal.verhaal})` },
]

export function SoortFilter({
  gewoon,
  verhaal,
  waarde,
  onKies,
  rondleiding = false,
}: {
  gewoon: number
  verhaal: number
  waarde: SoortKeuze
  onKies: (soort: SoortKeuze) => void
  /** Alleen het voorbeeldhoofdstuk van de rondleiding. */
  rondleiding?: boolean
}) {
  const aantal = { gewoon, verhaal }
  return (
    <div
      role="radiogroup"
      aria-label="Soort sommen"
      data-tour={rondleiding ? 'soort' : undefined}
      className="mt-4 flex flex-wrap gap-2"
    >
      {KNOPPEN.map((knop) => {
        const aan = waarde === knop.id
        return (
          <button
            key={knop.id}
            type="button"
            role="radio"
            aria-checked={aan}
            data-meet={`oefenen-filter-${knop.id}`}
            onClick={() => onKies(knop.id)}
            className={cn(
              'inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-medium',
              aan
                ? 'border-accent bg-accent text-white'
                : 'border-border bg-surface text-text hover:bg-surface-2',
            )}
          >
            {knop.label(aantal)}
          </button>
        )
      })}
    </div>
  )
}
