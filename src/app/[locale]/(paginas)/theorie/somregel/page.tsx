import { Suspense } from 'react'
import { DeelKnop } from '@/components/deel-knop'
import { DIFFERENTIEERREGELS_PAD } from '@/content/theory/differentieerregels'
import { ProbeerKnop } from '@/components/probeer-knop'
import { Link } from '@/i18n/navigation'
import { Math as TeX, RichMath } from '@/components/math'
import {
  SOMREGEL_FORMULE,
  SOMREGEL_OEFENEN,
  SOMREGEL_OMSCHRIJVING,
  SOMREGEL_PAD,
  SOMREGEL_STAPPEN,
  SOMREGEL_TITEL,
  SOMREGEL_VOORBEELDEN,
} from '@/content/theory/somregel'
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
    title: SOMREGEL_TITEL,
    description: SOMREGEL_OMSCHRIJVING,
    alternates: canoniek(locale, SOMREGEL_PAD),
    openGraph: deelkaart(locale, SOMREGEL_PAD, {
      title: SOMREGEL_TITEL,
      description: SOMREGEL_OMSCHRIJVING,
    }),
  }
}

export default function SomregelPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">Theorie</p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">{SOMREGEL_TITEL}</h1>

      <Suspense fallback={null}>
        <YoutubeWelkom
          ctaHref={proberenVanOefenen(SOMREGEL_OEFENEN)}
          ctaDataMeet="theorie-youtube-probeer"
        />
      </Suspense>

      <p className="mt-6 text-lg text-text-muted">
        Je gebruikt de somregel als er een plus of een min tussen de delen staat. Je
        differentieert elke term apart en telt die uitkomsten daarna weer op.
      </p>
      <p className="mt-3 text-text-muted">
        <RichMath source="$f$ is de functie die je differentieert. $g$ is de eerste term, $h$ de tweede." />
      </p>

      <div className="mt-8 flex flex-col items-center gap-2 overflow-x-auto rounded-xl bg-accent-light/60 px-4 py-5 text-center text-[0.95em] leading-loose">
        {SOMREGEL_FORMULE.map((regel) => (
          <TeX key={regel} tex={regel} wrap />
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">Stappenplan</h2>
        <ol start={0} className="mt-4 space-y-4">
          {SOMREGEL_STAPPEN.map((stap) => (
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
          {SOMREGEL_VOORBEELDEN.map((voorbeeld) => (
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
          oefenen={`${SOMREGEL_OEFENEN}&van=theorie`}
          dataMeet="theorie-oefen-dit-onderwerp"
          label="Oefen dit onderwerp"
        />
        <DeelKnop />
        <Link
          href={SOMREGEL_OEFENEN}
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Zelf oefenen
        </Link>
        <Link
          href="/uitleg-videos/somregel-of-productregel"
          className="inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          Bekijk de video: Somregel of productregel?
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
