import { DeelKnop } from '@/components/deel-knop'
import { Link } from '@/i18n/navigation'

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
      <p className="mt-6 text-lg text-text-muted">
        Op het centraal examen wiskunde B vwo gebruik je de afgeleide in allerlei vragen.
        Hier oefen je die vragen. Het examen is {EXAMENTRAINING_MOMENT}.
      </p>
      <p className="mt-3 text-text-muted">
        De opgaven op deze site zijn van ons. Het zijn geen officiële examenopgaven. Het
        rooster en de examenstof staan op{' '}
        <a
          href={EXAMENTRAINING_EXAMENBLAD}
          className="font-medium text-accent underline-offset-2 hover:underline"
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
          De opgaven zelf staan achter de inlog. Maak een gratis account, of log in als je
          er al een hebt. Daarna kies je het hoofdstuk Examentraining.
        </p>
      </section>

      <div className="mt-12 flex flex-wrap items-start gap-4">
        <DeelKnop />
        <Link
          href={EXAMENTRAINING_OEFENEN}
          className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          Zelf oefenen
        </Link>
        <Link
          href="/registreren"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Account aanmaken
        </Link>
        <Link
          href="/theorie"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Alle differentieerregels
        </Link>
      </div>
    </div>
  )
}
