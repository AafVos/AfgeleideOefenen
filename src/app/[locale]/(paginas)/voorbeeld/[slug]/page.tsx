import type { Metadata } from 'next'
import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { DeelKnop } from '@/components/deel-knop'
import { Math as TeX, RichMath } from '@/components/math'
import { ProbeerKnop } from '@/components/probeer-knop'
import { StickyProbeerBalk } from '@/components/sticky-probeer-balk'
import { YoutubeWelkom } from '@/components/youtube-welkom'
import { EXAMENTRAINING_PAD } from '@/content/theory/examentraining'
import {
  getVoorbeeld,
  getVoorbeelden,
  voorbeeldOefenVraag,
  voorbeeldPad,
  voorbeeldTitel,
} from '@/content/voorbeelden'
import { Link } from '@/i18n/navigation'
import { proberenVanOefenen } from '@/lib/practice/proberen'
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
  const titel = voorbeeldTitel(voorbeeld)
  return {
    title: titel,
    description: voorbeeld.omschrijving,
    alternates: canoniek(locale, pad),
    openGraph: deelkaart(locale, pad, {
      title: titel,
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

  const mainEntity = [
    {
      '@type': 'Question',
      name: voorbeeld.kop,
      acceptedAnswer: {
        '@type': 'Answer',
        text: voorbeeld.antwoordTekst,
      },
    },
    ...(voorbeeld.faqUitgebreid
      ? [
          {
            '@type': 'Question',
            name: voorbeeldOefenVraag(voorbeeld),
            acceptedAnswer: {
              '@type': 'Answer',
              text: voorbeeld.omschrijving,
            },
          },
        ]
      : []),
  ]

  const kaartje = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${adres}#antwoord`,
    url: adres,
    mainEntity,
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

        <Suspense fallback={null}>
          <YoutubeWelkom
            ctaHref={proberenVanOefenen(voorbeeld.oefenen)}
            ctaDataMeet="voorbeeld-youtube-probeer"
          />
        </Suspense>

        <div id="probeer-knop-primair" className="mt-6 flex flex-col items-start gap-2">
          <p className="text-sm text-text-muted">Drie sommen over dit onderwerp, zonder account.</p>
          <ProbeerKnop oefenen={voorbeeld.oefenen} />
        </div>

        <StickyProbeerBalk oefenen={voorbeeld.oefenen} primaryId="probeer-knop-primair" />

        {voorbeeld.examenbrug && (
          <p className="mt-4 text-sm text-text-muted">
            Dit soort som komt op het examen voor —{' '}
            <Link
              href={`${EXAMENTRAINING_PAD}?van=voorbeeld-examen` as '/theorie/examentraining'}
              data-meet="voorbeeld-examentraining"
              className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
            >
              oefen verder in de examentraining
            </Link>
            .
          </p>
        )}

        <details className="mt-10">
          <summary className="inline-flex min-h-11 cursor-pointer list-none items-center font-medium text-accent underline-offset-2 hover:underline">
            Toon uitwerking
          </summary>

          <section className="mt-6 rounded-xl bg-accent-light/60 px-4 py-5">
            <h2 className="text-sm font-medium uppercase tracking-wider text-accent">Antwoord</h2>
            <div className="mt-3 flex flex-col gap-2 overflow-x-auto text-[0.95em] leading-loose">
              <TeX tex={`f(x) = ${voorbeeld.functie}`} wrap />
              <TeX tex={`f'(x) = ${voorbeeld.antwoord}`} wrap />
            </div>
            <p className="mt-3 text-text-muted">{voorbeeld.antwoordTekst}</p>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl text-text">Stap voor stap</h2>
            <ol className="mt-4 list-none space-y-3 text-text-muted">
              {voorbeeld.stappen.map((stap) => (
                <li key={stap}>
                  <RichMath source={stap} />
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-8">
            <h2 className="font-serif text-2xl text-text">Een veelgemaakte fout</h2>
            <p className="mt-4 text-text-muted">
              <RichMath source={voorbeeld.fout} />
            </p>
          </section>
        </details>

        <section className="mt-12">
          <h2 className="font-serif text-2xl text-text">Gerelateerde afgeleiden</h2>
          <p className="mt-4 text-text-muted">Bekijk ook deze afgeleiden uit dezelfde familie.</p>
          <ul className="mt-4 list-none space-y-2">
            {verwant.map((ander) => (
              <li key={ander.slug}>
                <Link
                  href={voorbeeldPad(ander.slug) as '/voorbeeld'}
                  className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
                >
                  {ander.kop}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-12 flex flex-col gap-3">
          <DeelKnop />
          <Link
            href={voorbeeld.oefenen as '/oefenen'}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
          >
            Oefen dit soort sommen
          </Link>
          <Link
            href={voorbeeld.theoriePad as '/theorie'}
            className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
          >
            {voorbeeld.theorieNaam}
          </Link>
        </div>
      </div>
    </>
  )
}
