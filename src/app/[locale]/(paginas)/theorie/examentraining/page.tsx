import { Suspense } from 'react'
import { TheorieOefenActies } from '@/components/theorie-oefen-acties'
import { DIFFERENTIEERREGELS_PAD } from '@/content/theory/differentieerregels'

import {
  EXAMENTRAINING_EXAMENBLAD,
  EXAMENTRAINING_MOMENT,
  EXAMENTRAINING_OEFENEN,
  EXAMENTRAINING_OMSCHRIJVING,
  EXAMENTRAINING_ONDERDELEN,
  EXAMENTRAINING_PAD,
  EXAMENTRAINING_TITEL,
} from '@/content/theory/examentraining'
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
    title: EXAMENTRAINING_TITEL,
    description: EXAMENTRAINING_OMSCHRIJVING,
    alternates: canoniek(locale, EXAMENTRAINING_PAD),
    openGraph: deelkaart(locale, EXAMENTRAINING_PAD, {
      title: EXAMENTRAINING_TITEL,
      description: EXAMENTRAINING_OMSCHRIJVING,
    }),
  }
}

export default function ExamentrainingPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Theorie</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {EXAMENTRAINING_TITEL}
      </h1>

      <Suspense fallback={null}>
        <YoutubeWelkom
          ctaHref={proberenVanOefenen(EXAMENTRAINING_OEFENEN)}
          ctaDataMeet="theorie-youtube-probeer"
        />
      </Suspense>

      <p className="mt-6 text-lg text-text-muted">
        Op het centraal examen wiskunde B vwo gebruik je de afgeleide in allerlei vragen.
        Hier oefen je die vragen. Het examen is {EXAMENTRAINING_MOMENT}.
      </p>
      <p className="mt-3 text-text-muted">
        De opgaven op deze site zijn van ons. Het zijn geen officiële examenopgaven. Het
        rooster en de examenstof staan op{' '}
        <a
          href={EXAMENTRAINING_EXAMENBLAD}
          className="font-medium text-accent underline underline-offset-2"
        >
          Examenblad
        </a>
        .
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Voor wie</h2>
        <p className="mt-3 text-text-muted">
          Voor jou als je in vwo 5 of 6 wiskunde B doet en je voorbereidt op het centraal
          examen. Je oefent alleen het differentiëren: hellingen, raaklijnen, toppen en
          uiterste waarden.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Wat je oefent</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-text-muted">
          {EXAMENTRAINING_ONDERDELEN.map((onderdeel) => (
            <li key={onderdeel}>{onderdeel}</li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">De opgaven</h2>
        <p className="mt-3 text-text-muted">
          Je kunt hieronder drie sommen proberen zonder account. Om verder te oefenen
          en je voortgang te bewaren maak je een gratis account, of log je in.
        </p>
      </section>

      <TheorieOefenActies
        oefenen={EXAMENTRAINING_OEFENEN}
        extra={[
          { href: '/registreren', label: 'Account aanmaken' },
          { href: DIFFERENTIEERREGELS_PAD, label: 'Alle differentieerregels' },
        ]}
      />
    </div>
  )
}
