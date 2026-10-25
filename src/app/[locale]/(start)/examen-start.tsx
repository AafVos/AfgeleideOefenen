import { getTranslations } from 'next-intl/server'
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
export async function ExamenStart() {
  const t = await getTranslations('ExamenStart')

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
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-text sm:text-5xl">
            {t('h1Start')}{' '}
            <span className="whitespace-nowrap text-accent">{t('h1Accent')}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-lg text-text-muted sm:mt-6">
            {t('lead')}
          </p>

          <p className="mx-auto mt-4 max-w-xl rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text">
            {t.rich('examMoment', {
              moment: () => (
                <span className="font-medium">{EXAMENTRAINING_MOMENT}</span>
              ),
            })}
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3 sm:mt-8">
            <Link
              href={EXAMENVRAGEN_OEFENEN}
              data-meet="start-examenvragen"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaExamenvragen')}
            </Link>
            <Link
              href="/video-aanvragen"
              data-meet="start-video-aanvragen"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaVideoAanvragen')}
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">{t('accountHint')}</p>
        </section>

        <section className="mt-14">
          <h2 className="font-serif text-2xl text-text sm:text-3xl">
            {t('vindtH2')}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Kaart
              href={EXAMENVRAGEN_OEFENEN}
              dataMeet="start-kaart-examenvragen"
              titel={t('kaartExamenvragenTitel')}
              tekst={t('kaartExamenvragenTekst')}
            />
            <Kaart
              href={EXAMENTRAINING_OEFENEN}
              dataMeet="start-kaart-examenstijl"
              titel={t('kaartExamenstijlTitel')}
              tekst={t('kaartExamenstijlTekst')}
            />
          </div>

          <h3 className="mt-8 font-serif text-xl text-text">
            {t('onderdelenH3')}
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
              {t('examentrainingLink')}
            </Link>
            {' · '}
            <a
              href={EXAMENTRAINING_EXAMENBLAD}
              rel="noopener noreferrer"
              data-meet="start-examenblad"
              className="text-accent underline-offset-2 hover:underline"
            >
              {t('examenbladLink')}
            </a>
          </p>
        </section>

        {videos.length > 0 && (
          <section className="mt-14">
            <h2 className="font-serif text-2xl text-text sm:text-3xl">
              {t('uitlegH2')}
            </h2>
            <p className="mt-3 text-text-muted">
              {t.rich('uitlegIntro', {
                link: (chunks) => (
                  <Link
                    href="/video-aanvragen"
                    data-meet="start-videos-aanvragen"
                    className="text-accent underline-offset-2 hover:underline"
                  >
                    {chunks}
                  </Link>
                ),
              })}
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
                {t('alleVideos')}
              </Link>
            </p>
          </section>
        )}

        <section className="mt-14 rounded-2xl border border-border bg-surface px-5 py-8 sm:px-6">
          <h2 className="font-serif text-2xl text-text">
            {t('onderwerpH2')}
          </h2>
          <p className="mt-3 text-text-muted">{t('onderwerpTekst')}</p>
          <ul className="mt-5 space-y-2">
            <li>
              <a
                href={AFGELEIDE_URL}
                rel="noopener noreferrer"
                data-meet="start-naar-afgeleide"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              >
                {t('afgeleideLink')}
              </a>
            </li>
            <li>
              <IntegraalVerwijzing
                tekst={t('integraalLink')}
                dataMeet="start-naar-integraal"
                className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
              />
            </li>
          </ul>
        </section>

        <section className="mt-14 text-center">
          <h2 className="font-serif text-2xl text-text sm:text-3xl">
            {t('accountH2')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">
            {t('accountTekst')}
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/registreren"
              data-meet="start-cta-registreren"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegistreren')}
            </Link>
            <Link
              href="/inloggen"
              data-meet="start-cta-inloggen"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaInloggen')}
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
