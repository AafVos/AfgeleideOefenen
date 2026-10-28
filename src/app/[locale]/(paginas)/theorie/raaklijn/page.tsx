import { Suspense } from 'react'
import { DeelKnop } from '@/components/deel-knop'
import { DIFFERENTIEERREGELS_PAD } from '@/content/theory/differentieerregels'
import { ProbeerKnop } from '@/components/probeer-knop'
import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import {
  RAAKLIJN_FORMULE,
  RAAKLIJN_OEFENEN,
  RAAKLIJN_OMSCHRIJVING,
  RAAKLIJN_PAD,
  RAAKLIJN_STAPPEN,
  RAAKLIJN_TITEL,
  RAAKLIJN_VOORBEELDEN,
} from '@/content/theory/raaklijn'
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
    title: RAAKLIJN_TITEL,
    description: RAAKLIJN_OMSCHRIJVING,
    alternates: canoniek(locale, RAAKLIJN_PAD),
    openGraph: deelkaart(locale, RAAKLIJN_PAD, {
      title: RAAKLIJN_TITEL,
      description: RAAKLIJN_OMSCHRIJVING,
    }),
  }
}

export default function RaaklijnPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Theorie</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">{RAAKLIJN_TITEL}</h1>

      <Suspense fallback={null}>
        <YoutubeWelkom
          ctaHref={proberenVanOefenen(RAAKLIJN_OEFENEN)}
          ctaDataMeet="theorie-youtube-probeer"
        />
      </Suspense>

      <p className="mt-6 text-lg text-text-muted">
        De raaklijn raakt de grafiek in één punt. De helling van die lijn is de afgeleide
        in dat punt.
      </p>
      <p className="mt-3 text-text-muted">
        <RichMath source="$f$ is de functie. $a$ is de $x$ van het raakpunt." />
      </p>

      <div className="mt-8 flex flex-col items-center gap-2 overflow-x-auto rounded-xl bg-accent-light/60 px-4 py-5 text-center text-[0.95em] leading-loose">
        {RAAKLIJN_FORMULE.map((regel) => (
          <TeX key={regel} tex={regel} wrap />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Stappenplan</h2>
        <ol start={0} className="mt-4 space-y-4">
          {RAAKLIJN_STAPPEN.map((stap) => (
            <li key={stap.n} className="flex items-start gap-3 text-text-muted">
              <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-light text-sm font-medium text-accent">
                {stap.n}
              </span>
              <span className="min-w-0 pt-1">
                <RichMath source={stap.tekst} />
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Drie voorbeelden</h2>
        <ul className="mt-4 space-y-4">
          {RAAKLIJN_VOORBEELDEN.map((voorbeeld) => (
            <li
              key={voorbeeld.opgave}
              className="min-w-0 overflow-x-auto rounded-xl border border-border bg-surface px-4 py-4"
            >
              <p className="text-text">
                <TeX tex={voorbeeld.opgave} wrap />
              </p>
              <ol className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-text-muted">
                {voorbeeld.stappen.map((stap) => (
                  <li key={stap}>
                    <RichMath source={stap} />
                  </li>
                ))}
              </ol>
              <p className="mt-3 border-t border-border pt-3 text-text">
                <span className="text-text-muted">Antwoord: </span>
                <TeX tex={voorbeeld.antwoord} wrap />
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 flex flex-wrap items-start gap-4">
        <ProbeerKnop
          oefenen={`${RAAKLIJN_OEFENEN}&van=theorie`}
          dataMeet="theorie-oefen-dit-onderwerp"
          label="Oefen dit onderwerp"
        />
        <DeelKnop />
        <Link
          href={RAAKLIJN_OEFENEN}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Zelf oefenen
        </Link>
        <Link
          href={DIFFERENTIEERREGELS_PAD}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Alle differentieerregels
        </Link>
      </div>
    </div>
  )
}
