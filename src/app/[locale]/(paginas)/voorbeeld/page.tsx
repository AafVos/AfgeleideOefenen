import type { Metadata } from 'next'

import { getVoorbeeldIndex, voorbeeldIndexPad } from '@/content/voorbeelden'
import { Link } from '@/i18n/navigation'
import { canoniek, deelkaart } from '@/lib/seo'

const TITEL = 'Afgeleide voorbeelden oefenen — differentiëren vwo wiskunde B'
const OMSCHRIJVING =
  'Overzicht van afgeleide voorbeelden: ln x, sin x, e^x, 1/x en meer. Bekijk de uitwerking en oefen daarna gratis drie sommen zonder account.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: TITEL,
    description: OMSCHRIJVING,
    alternates: canoniek(locale, '/voorbeeld'),
    openGraph: deelkaart(locale, '/voorbeeld', {
      title: TITEL,
      description: OMSCHRIJVING,
    }),
  }
}

export default function VoorbeeldIndexPage() {
  const voorbeelden = getVoorbeeldIndex()

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Voorbeelden</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        Afgeleide voorbeelden
      </h1>
      <p className="mt-4 text-text-muted">
        Hieronder staan veelgezochte afgeleiden, elk met een uitgewerkt antwoord, stap voor stap
        en een veelgemaakte fout. Kies een voorbeeld en oefen daarna gratis drie sommen zonder
        account.
      </p>

      <ul className="mt-8 list-none space-y-2">
        {voorbeelden.map((voorbeeld) => (
          <li key={voorbeeld.slug}>
            <Link
              href={voorbeeldIndexPad(voorbeeld.slug) as '/voorbeeld'}
              className="flex min-h-11 items-center rounded-lg border border-border px-4 py-3 text-text transition-colors hover:border-accent hover:text-accent"
            >
              {voorbeeld.kop}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
