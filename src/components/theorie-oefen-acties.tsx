import { DeelKnop } from '@/components/deel-knop'
import { ProbeerKnop } from '@/components/probeer-knop'
import { Link } from '@/i18n/navigation'

const TEKSTLINK =
  'inline-flex min-h-11 items-center text-sm text-accent underline-offset-2 hover:underline'

/**
 * Bodem van een theoriepagina: één groene hoofdknop om verder te oefenen
 * (drie sommen, zonder account), daaronder de overige acties als tekstlink
 * in plaats van een knop met eigen rand — zodat ze niet als een gelijkwaardig
 * alternatief voor "doorgaan" ogen (AFG-717).
 */
export function TheorieOefenActies({
  oefenen,
  extra = [],
}: {
  /** Oefenlink van dit onderwerp, bijv. `/oefenen?chapter=h2&topic=h2_termsgewijs`. */
  oefenen: string
  /** Overige acties na "Oefenen met een account", in de gewenste volgorde. */
  extra?: { href: string; label: string }[]
}) {
  return (
    <div className="mt-12 flex flex-col items-start gap-4">
      <ProbeerKnop
        oefenen={`${oefenen}&van=theorie`}
        dataMeet="theorie-oefen-dit-onderwerp"
        label="Oefen dit onderwerp"
      />
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <DeelKnop variant="tekstlink" />
        <Link href={oefenen} className={TEKSTLINK}>
          Oefenen met een account
        </Link>
        {extra.map((item) => (
          <Link key={item.href} href={item.href} className={TEKSTLINK}>
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
