import { Link } from '@/i18n/navigation'

import { IntegraalVerwijzing } from '@/components/integraal-verwijzing'
import { SITE_CONFIG } from '@/config/site'
import {
  EXAMENTRAINING_EXAMENBLAD,
  EXAMENTRAINING_MOMENT,
  EXAMENTRAINING_OEFENEN,
  EXAMENTRAINING_ONDERDELEN,
  EXAMENTRAINING_PAD,
  EXAMENVRAGEN_OEFENEN,
} from '@/content/theory/examentraining'
import { DEEL_TEKST_START, SITE_URL } from '@/lib/seo'
import { getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

/** Naar afgeleideoefenen.nl, met een merkje waar de bezoeker vandaan komt. */
const AFGELEIDE_URL = 'https://www.afgeleideoefenen.nl/?van=wiskundemetaaf'

/**
 * De startpagina van wiskundemetaaf.nl.
 *
 * Eén ding staat voorop: het centraal examen vwo wiskunde B. Wie per
 * onderwerp wil oefenen, gaat door naar afgeleideoefenen.nl of
 * integraaloefenen.nl.
 */
export function ExamenStart() {
  const videos = getUitlegVideos()
    .filter((v) => v.soort === 'vraaguitwerking')
    .slice(0, 6)

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: SITE_CONFIG.brandNaam,
      },
      {
        '@type': 'LearningResource',
        '@id': `${SITE_URL}#lessite`,
        name: SITE_CONFIG.brandNaam,
        url: SITE_URL,
        description: DEEL_TEKST_START,
        educationalLevel: 'vwo',
        teaches: 'eindexamen wiskunde B',
        inLanguage: 'nl',
        learningResourceType: 'lessite',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:py-16">
        <section className="text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-accent sm:mb-3">
            Eindexamen vwo wiskunde B
          </p>
          <h1 className="font-serif text-3xl leading-tight text-text sm:text-5xl">
            Oefen met{' '}
            <span className="whitespace-nowrap text-accent">echte examenvragen</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-lg text-text-muted sm:mt-6">
            Vragen uit oude examens, met het antwoord uit het
            correctievoorschrift en uitleg bij elke stap. Snap je een vraag
            niet? Dan vraag je er een video bij aan.
          </p>

          <p className="mx-auto mt-4 max-w-xl rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text">
            Het centraal examen is op{' '}
            <span className="font-medium">{EXAMENTRAINING_MOMENT}</span>.
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              href={EXAMENVRAGEN_OEFENEN}
              data-meet="start-examenvragen"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              Begin met examenvragen
            </Link>
            <Link
              href="/video-aanvragen"
              data-meet="start-video-aanvragen"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              Vraag een uitlegvideo aan
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">
            Oefenen doe je met een gratis account. Je voortgang blijft bewaard.
          </p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl text-text sm:text-3xl">
            Wat je hier vindt
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Kaart
              href={EXAMENVRAGEN_OEFENEN}
              dataMeet="start-kaart-examenvragen"
              titel="Echte eindexamenvragen"
              tekst="Vragen uit de examens van de afgelopen jaren, met jaar, tijdvak en vraagnummer erbij. Je antwoord wordt nagekeken en je ziet de stappen."
            />
            <Kaart
              href={EXAMENTRAINING_OEFENEN}
              dataMeet="start-kaart-examenstijl"
              titel="Examenstijl (H16)"
              tekst="Zelfgemaakte opgaven in de toon van het examen: helling, raaklijn, toppen, buigpunten. Handig om los te oefenen voordat je een heel examen doet."
            />
          </div>

          <h3 className="mt-8 font-serif text-xl text-text">
            De zeven soorten vragen
          </h3>
          <ul className="mt-3 grid gap-2 text-text-muted sm:grid-cols-2">
            {EXAMENTRAINING_ONDERDELEN.map((onderdeel) => (
              <li key={onderdeel} className="rounded-lg bg-surface-2 px-3 py-2 text-sm">
                {onderdeel}
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-text-muted">
            <Link
              href={EXAMENTRAINING_PAD}
              data-meet="start-examentraining"
              className="text-accent underline-offset-2 hover:underline"
            >
              Lees eerst de uitleg over de examentraining
            </Link>
            {' · '}
            <a
              href={EXAMENTRAINING_EXAMENBLAD}
              rel="noopener noreferrer"
              data-meet="start-examenblad"
              className="text-accent underline-offset-2 hover:underline"
            >
              Het vak op Examenblad
            </a>
          </p>
        </section>

        {videos.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl text-text sm:text-3xl">
              Uitleg bij een vraag
            </h2>
            <p className="mt-3 text-text-muted">
              Eén opgave, van begin tot eind uitgewerkt. Staat jouw vraag er
              niet bij?{' '}
              <Link
                href="/video-aanvragen"
                data-meet="start-videos-aanvragen"
                className="text-accent underline-offset-2 hover:underline"
              >
                Vraag hem aan
              </Link>
              .
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {videos.map((video) => (
                <li key={video.slug} className="flex">
                  <Link
                    href={uitlegVideoPad(video.slug)}
                    data-meet="start-video"
                    className="block min-h-11 w-full rounded-xl border border-border bg-surface p-4 hover:bg-surface-2"
                  >
                    <p className="font-medium text-text underline decoration-border underline-offset-4">
                      {video.title}
                    </p>
                    <p className="mt-1 text-sm text-text-muted">
                      {video.description}
                    </p>
                    <p className="mt-2 text-xs uppercase tracking-wider text-text-muted">
                      {video.chapter ? `${video.chapter} · ` : ''}
                      {video.duration}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4">
              <Link
                href="/uitleg-videos"
                data-meet="start-alle-videos"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              >
                Alle uitlegvideo’s
              </Link>
            </p>
          </section>
        )}

        <section className="mt-14 rounded-2xl border border-border bg-surface px-5 py-8 sm:px-6">
          <h2 className="font-serif text-2xl text-text">
            Liever oefenen per onderwerp?
          </h2>
          <p className="mt-3 text-text-muted">
            Het examen is één ding, maar de losse techniek oefen je sneller op
            de zustersites. Je logt daar in met hetzelfde account.
          </p>
          <ul className="mt-5 space-y-2">
            <li>
              <a
                href={AFGELEIDE_URL}
                rel="noopener noreferrer"
                data-meet="start-naar-afgeleide"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              >
                afgeleideoefenen.nl — differentiëren, regel voor regel
              </a>
            </li>
            <li>
              <IntegraalVerwijzing
                tekst="integraaloefenen.nl — integreren en oppervlakte"
                dataMeet="start-naar-integraal"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              />
            </li>
          </ul>
        </section>

        <section className="mt-14 text-center">
          <h2 className="font-serif text-2xl text-text sm:text-3xl">
            Maak een gratis account
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">
            Dan onthoudt de site welke examenvragen je al gemaakt hebt, en waar
            je nog op vastloopt.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/registreren"
              data-meet="start-cta-registreren"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              Registreren
            </Link>
            <Link
              href="/inloggen"
              data-meet="start-cta-inloggen"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              Inloggen
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

function Kaart({
  href,
  titel,
  tekst,
  dataMeet,
}: {
  href: string
  titel: string
  tekst: string
  dataMeet: string
}) {
  return (
    <Link
      href={href}
      data-meet={dataMeet}
      className="block rounded-xl border border-border bg-surface p-5 hover:bg-surface-2"
    >
      <h3 className="font-serif text-xl text-text underline decoration-border underline-offset-4">
        {titel}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{tekst}</p>
    </Link>
  )
}
