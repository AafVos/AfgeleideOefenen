import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { IntegraalVerwijzing } from '@/components/integraal-verwijzing'
import { YoutubeWelkom } from '@/components/youtube-welkom'
import { SITE_CONFIG } from '@/config/site'
import { EXAMENTRAINING_PAD } from '@/content/theory/examentraining'
import { googleLoginAan } from '@/lib/auth/google'
import { canoniek, DEEL_TEKST_START, DEEL_TITEL_START, deelkaart, SITE_URL } from '@/lib/seo'

import { ExamenStart } from './examen-start'
import { HomeDemo } from './home-demo'

// Voor iedereen hetzelfde. Een ingelogde leerling komt hier niet: de
// middleware stuurt hem meteen naar het dashboard. Zo hoeft deze pagina
// niet te wachten op Supabase en kan hij bij de bouw al klaarstaan.
export const dynamic = 'force-static'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return {
    alternates: canoniek(locale),
    openGraph: deelkaart(locale, '', {
      title: DEEL_TITEL_START,
      description: DEEL_TEKST_START,
    }),
  }
}

export default async function HomePage() {
  // wiskundemetaaf.nl heeft een eigen startpagina: die gaat over het examen,
  // niet over differentiëren per onderwerp.
  if (SITE_CONFIG.variant === 'wiskundemetaaf') return <ExamenStart />

  const t = await getTranslations('Home')

  const domain = SITE_CONFIG.domain

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: domain,
      },
      {
        '@type': 'LearningResource',
        '@id': `${SITE_URL}#lessite`,
        name: domain,
        url: SITE_URL,
        description:
          'Lessite over differentiëren voor vwo wiskunde B. De naam is afgeleideoefenen.nl en het adres is https://www.afgeleideoefenen.nl.',
        educationalLevel: 'vwo',
        teaches: 'differentiëren',
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

      <div className="mx-auto max-w-3xl px-4 py-6 sm:py-16">
        <section className="text-center">
          <p className="mb-1 text-sm font-medium uppercase tracking-wider text-accent sm:mb-3">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-3xl leading-tight text-text sm:text-5xl">
            {t('h1Start')}{' '}
            <span className="whitespace-nowrap text-accent">{t('h1Accent')}</span>
          </h1>
          <p className="mx-auto mt-2 max-w-xl text-lg text-text-muted sm:mt-4">
            {t('lead')}
          </p>

          <Suspense fallback={null}>
            <YoutubeWelkom ctaHref="#proefsom" ctaDataMeet="start-youtube-proefsom" />
          </Suspense>
        </section>

        <HomeDemo googleAan={googleLoginAan()} />

        <section className="mt-8 text-center">
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-text-muted">
            {t.rich('subLead', {
              oefenen: (chunks) => (
                <span className="text-text">{chunks}</span>
              ),
              zelfToets: (chunks) => (
                <span className="text-text">{chunks}</span>
              ),
              howItWorks: () => (
                <Link
                  href="/hoe-het-werkt"
                  data-meet="start-hoe-het-werkt"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  {t('subLeadLink')}
                </Link>
              ),
            })}
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/registreren"
              data-meet="start-registreren"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/inloggen"
              data-meet="start-inloggen"
              className="inline-flex min-h-11 items-center rounded-lg px-5 py-3 text-text-muted hover:bg-surface-2 hover:text-text"
            >
              {t('ctaLogin')}
            </Link>
          </div>
        </section>

        <section className="mt-10 text-center">
          <p className="text-sm text-text-muted">{t('tagline')}</p>
          <p className="mt-4">
            <IntegraalVerwijzing
              tekst={t('integraal')}
              dataMeet="start-integraal"
              className="inline-flex min-h-11 items-center text-sm text-accent underline underline-offset-2"
            />
          </p>
        </section>

        <section id="regels" className="mt-16 scroll-mt-6">
          <p className="text-lg text-text">{t('zoekzin')}</p>
          <p className="mt-2 text-text-muted">{t('toetsweek')}</p>
          <h2 className="mt-6 font-serif text-3xl text-text">{t('topicsH2')}</h2>
          <p className="mt-3 text-text-muted">{t('topicsIntro')}</p>
          <ul className="mt-6 grid grid-cols-2 gap-2">
            {(
              [
                ['topic1Title', '/theorie/machtsregel'],
                ['topic8Title', '/theorie#kaart-h6-machten_herschrijven'],
                ['topic2Title', '/theorie/somregel'],
                ['topic3Title', '/theorie/productregel'],
                ['topic4Title', '/theorie/quotientregel'],
                ['topic5Title', '/theorie/kettingregel'],
                ['topic6Title', '/theorie#hoofdstuk-h7'],
                ['topic7Title', '/theorie#hoofdstuk-h9'],
              ] as const
            ).map(([titleKey, href]) => (
              <li key={titleKey} className="flex">
                <Link
                  href={href}
                  data-meet="start-onderwerp"
                  className="flex min-h-11 w-full items-center rounded-xl border border-border bg-surface p-3 text-sm font-medium text-text underline decoration-border underline-offset-4 hover:bg-surface-2"
                >
                  {t(titleKey)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-text-muted">
            {t.rich('examTraining', {
              link: (chunks) => (
                <Link
                  href={EXAMENTRAINING_PAD}
                  data-meet="start-examentraining"
                  className="font-medium text-accent underline underline-offset-2"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-3">
          <Feature title={t('feature1Title')} body={t('feature1Body')} />
          <Feature title={t('feature2Title')} body={t('feature2Body')} />
          <Feature title={t('feature3Title')} body={t('feature3Body')} />
        </section>
      </div>
    </>
  )
}

// Geen kaart-opmaak (border/bg-surface/rounded): die opmaak gebruiken we
// elders alleen voor echte links, en leerlingen klikten hierop alsof het
// een tegel was (AFG-512).
function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="text-center sm:text-left">
      <h2 className="font-serif text-xl text-text">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  )
}
