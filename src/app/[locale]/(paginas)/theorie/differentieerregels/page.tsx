import { Suspense } from 'react'
import { DeelKnop } from '@/components/deel-knop'
import { ProbeerKnop } from '@/components/probeer-knop'
import { Link } from '@/i18n/navigation'
import {
  DIFFERENTIEERREGELS_OEFENEN,
  DIFFERENTIEERREGELS_OMSCHRIJVING,
  DIFFERENTIEERREGELS_OVERZICHT,
  DIFFERENTIEERREGELS_PAD,
  DIFFERENTIEERREGELS_TITEL,
} from '@/content/theory/differentieerregels'
import { canoniek, deelkaart } from '@/lib/seo'
import { YoutubeWelkom } from '@/components/youtube-welkom'
import { proberenVanOefenen } from '@/lib/practice/proberen'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return {
    title: DIFFERENTIEERREGELS_TITEL,
    description: DIFFERENTIEERREGELS_OMSCHRIJVING,
    alternates: canoniek(locale, DIFFERENTIEERREGELS_PAD),
    openGraph: deelkaart(locale, DIFFERENTIEERREGELS_PAD, {
      title: DIFFERENTIEERREGELS_TITEL,
      description: DIFFERENTIEERREGELS_OMSCHRIJVING,
    }),
  }
}

export default function DifferentieerregelsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Theorie</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {DIFFERENTIEERREGELS_TITEL}
      </h1>

      <Suspense fallback={null}>
        <YoutubeWelkom
          ctaHref={proberenVanOefenen(DIFFERENTIEERREGELS_OEFENEN)}
          ctaDataMeet="theorie-youtube-probeer"
        />
      </Suspense>

      <p className="mt-6 text-lg text-text-muted">
        Bij differentiëren reken je uit hoe steil een functie loopt. Welke regel je
        gebruikt, hangt af van hoe de functie eruitziet. Hieronder staan de vijf
        differentieerregels voor wiskunde B, elk met een eigen uitlegpagina.
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">De vijf regels</h2>
        <ul className="mt-4 space-y-4">
          {DIFFERENTIEERREGELS_OVERZICHT.map((regel) => (
            <li
              key={regel.pad}
              className="rounded-xl border border-border bg-surface px-4 py-4"
            >
              <Link
                href={regel.pad}
                className="font-serif text-lg text-text hover:text-accent"
              >
                {regel.titel}
              </Link>
              <p className="mt-1 text-text-muted">{regel.omschrijving}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Welke regel gebruik je?</h2>
        <p className="mt-3 text-text-muted">
          Bestaat de functie uit losse termen achter elkaar, dan gebruik je de somregel:
          je differentieert elke term apart. Is één term een macht van x, dan is dat de
          machtsregel. Staan er twee functies vermenigvuldigd, dan is het de productregel;
          staat er een breuk met een functie boven én onder de streep, dan de
          quotiëntregel. Zit er een functie binnen een functie, dan gebruik je de
          kettingregel.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap items-start gap-4">
        <ProbeerKnop
          oefenen={`${DIFFERENTIEERREGELS_OEFENEN}&van=theorie`}
          dataMeet="theorie-oefen-dit-onderwerp"
          label="Oefen dit onderwerp"
        />
        <DeelKnop />
        <Link
          href={DIFFERENTIEERREGELS_OEFENEN}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Zelf oefenen
        </Link>
        <Link
          href="/theorie"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Alle theorie
        </Link>
      </div>
    </div>
  )
}
