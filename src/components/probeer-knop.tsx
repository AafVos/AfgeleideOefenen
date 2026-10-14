import { Link } from '@/i18n/navigation'
import { proberenVanOefenen } from '@/lib/practice/proberen'

const STANDAARD =
  'inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90'

/** Knop naar drie sommen van deze soort, zonder account. */
export function ProbeerKnop({
  oefenen,
  className = STANDAARD,
}: {
  oefenen: string
  className?: string
}) {
  return (
    <Link href={proberenVanOefenen(oefenen)} className={className}>
      Probeer 3 sommen
    </Link>
  )
}
