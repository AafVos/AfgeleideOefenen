import { Link } from '@/i18n/navigation'
import { proberenVanOefenen } from '@/lib/practice/proberen'

const STANDAARD =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90'

/** Knop naar drie sommen van deze soort, zonder account. */
export function ProbeerKnop({
  oefenen,
  className = STANDAARD,
  dataMeet = 'probeer-3-sommen',
  label = 'Probeer 3 sommen',
}: {
  oefenen: string
  className?: string
  /** Vaste naam voor de klikmeting, zie src/lib/meten/. */
  dataMeet?: string
  label?: string
}) {
  return (
    <Link href={proberenVanOefenen(oefenen)} data-meet={dataMeet} className={className}>
      {label}
    </Link>
  )
}
