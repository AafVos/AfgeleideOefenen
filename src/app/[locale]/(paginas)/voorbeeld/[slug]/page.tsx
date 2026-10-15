import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Math as TeX, RichMath } from '@/components/math'
import { ProbeerKnop } from '@/components/probeer-knop'
import { getVoorbeeld, getVoorbeelden, voorbeeldPad } from '@/content/voorbeelden'
import { Link } from '@/i18n/navigation'
import { canoniek, deelkaart, paginaAdres } from '@/lib/seo'

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getVoorbeelden().map((voorbeeld) => ({ slug: voorbeeld.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const voorbeeld = getVoorbeeld(slug)
  if (!voorbeeld) notFound()

  const pad = voorbeeldPad(voorbeeld.slug)
  return {
    title: voorbeeld.kop,
    description: voorbeeld.omschrijving,
    alternates: canoniek(locale, pad),
    openGraph: deelkaart(locale, pad, {
      title: voorbeeld.kop,
      description: voorbeeld.omschrijving,
    }),
  }
}

export default async function VoorbeeldPage({ params }: PageProps) {
  const { locale, slug } = await params
  const voorbeeld = getVoorbeeld(slug)
  if (!voorbeeld) notFound()

  const pad = voorbeeldPad(voorbeeld.slug)
  const adres = paginaAdres(locale, pad)
  const verwant = voorbeeld.verwant
    .map((naam) => getVoorbeeld(naam))
    .filter((item) => item !== null)

  const kaartje = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${adres}#antwoord`,
    url: adres,
    mainEntity: [
      {
        '@type': 'Question',
        name: voorbeeld.kop,
        acceptedAnswer: {
          '@type': 'Answer',
          text: voorbeeld.antwoordTekst,
        },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(kaartje).replace(/</g, '\\u003c'),
        }}
      />
      <div className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-sm font-medium uppercase tracking-wider text-accent">Voorbeeld</p>
        <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">{voorbeeld.kop}</h1>

        <section className="mt-8 rounded-xl bg-accent-light/60 px-4 py-5">
          <h2 className="text-sm font-medium uppercase tracking-wider text-accent">Antwoord</h2>
          <div className="mt-3 flex flex-col gap-2 overflow-x-auto text-[0.95em] leading-loose">
            <TeX tex={`f(x) = ${voorbeeld.functie}`} wrap />
            <TeX tex={`f'(x) = ${voorbeeld.antwoord}`} wrap />
          </div>
          <p className="mt-3 text-text-muted">{voorbeeld.antwoordTekst}</p>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-text">Uitwerking</h2>
          <ol className="mt-4 list-none space-y-3 text-text-muted">
            {voorbeeld.stappen.map((stap) => (
              <li key={stap}>
                <RichMath source={stap} />
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-text">Een veelgemaakte fout</h2>
          <p className="mt-4 text-text-muted">
            <RichMath source={voorbeeld.fout} />
          </p>
        </section>

        <div className="mt-12 flex flex-col gap-3">
          <ProbeerKnop
            oefenen={voorbeeld.oefenen}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
          />
          <Link
            href={voorbeeld.oefenen as '/oefenen'}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
          >
            Oefen dit soort sommen
          </Link>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {verwant.map((ander) => (
              <Link
                key={ander.slug}
                href={voorbeeldPad(ander.slug) as '/voorbeeld'}
                className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
              >
                {ander.kop}
              </Link>
            ))}
            <Link
              href={voorbeeld.theoriePad as '/theorie'}
              className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
            >
              {voorbeeld.theorieNaam}
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
