import { getTranslations, getLocale } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { IntegraalVerwijzing } from '@/components/integraal-verwijzing'
import { SITE_CONFIG } from '@/config/site'
import { EXAMENTRAINING_PAD } from '@/content/theory/examentraining'
import { canoniek, DEEL_TEKST_START, DEEL_TITEL_START, deelkaart, SITE_URL } from '@/lib/seo'
import { createClient } from '@/lib/supabase/server'

import { HomeDemo } from './home-demo'

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
  const supabase = await createClient()
  const locale = await getLocale()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect(`/${locale}/dashboard`)
  }

  const t = await getTranslations('Home')

  const domain = SITE_CONFIG.domain

  const FAQ_ITEMS = [
    { question: t('faq1Q'), answer: t('faq1A') },
    { question: t('faq2Q'), answer: t('faq2A') },
    { question: t('faq3Q'), answer: t('faq3A') },
    { question: t('faq4Q'), answer: t('faq4A') },
    { question: t('faq5Q'), answer: t('faq5A') },
    { question: t('faq6Q'), answer: t('faq6A') },
    { question: t('faq7Q'), answer: t('faq7A') },
  ]

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
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16">
        <section className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
            {t('h1Start')}{' '}
            <span className="whitespace-nowrap text-accent">{t('h1Accent')}</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
            {t('lead')}
          </p>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-text-muted">
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
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {t('subLeadLink')}
                </Link>
              ),
            })}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#regels"
              className="inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegel')}
            </a>
            <Link
              href="/registreren"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/inloggen"
              className="inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaLogin')}
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">{t('tagline')}</p>
          <p className="mt-4">
            <IntegraalVerwijzing
              tekst={t('integraal')}
              className="inline-flex min-h-11 items-center text-sm text-accent underline-offset-2 hover:underline"
            />
          </p>
        </section>

        <section id="regels" className="mt-16 scroll-mt-6">
          <p className="text-lg text-text">{t('zoekzin')}</p>
          <p className="mt-2 text-text-muted">{t('toetsweek')}</p>
          <h2 className="mt-6 font-serif text-3xl text-text">{t('topicsH2')}</h2>
          <p className="mt-3 text-text-muted">{t('topicsIntro')}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {(
              [
                ['topic1Title', 'topic1Body', '/theorie/machtsregel'],
                ['topic8Title', 'topic8Body', '/theorie#kaart-h6-machten_herschrijven'],
                ['topic2Title', 'topic2Body', '/theorie/somregel'],
                ['topic3Title', 'topic3Body', '/theorie/productregel'],
                ['topic4Title', 'topic4Body', '/theorie/quotientregel'],
                ['topic5Title', 'topic5Body', '/theorie/kettingregel'],
                ['topic6Title', 'topic6Body', '/theorie#hoofdstuk-h7'],
                ['topic7Title', 'topic7Body', '/theorie#hoofdstuk-h9'],
              ] as const
            ).map(([titleKey, bodyKey, href]) => (
              <li key={titleKey}>
                <Link
                  href={href}
                  className="block min-h-11 rounded-xl border border-border bg-surface p-4 hover:bg-surface-2"
                >
                  <p className="font-medium text-text underline decoration-border underline-offset-4">
                    {t(titleKey)}
                  </p>
                  <p className="mt-1 text-sm text-text-muted">{t(bodyKey)}</p>
                </Link>
              </li>
            ))}
          </ul>
          <h2 className="mt-10 font-serif text-2xl text-text">{t('veelGezochtH2')}</h2>
          <ul className="mt-4 space-y-1">
            {(
              [
                ['zoek1', '/voorbeeld/x-kwadraat'],
                ['zoek2', '/voorbeeld/wortel-x'],
                ['zoek3', '/voorbeeld/sin-x'],
                ['zoek4', '/voorbeeld/e-tot-de-x'],
                ['zoek5', '/voorbeeld/ln-x'],
                ['zoek6', '/theorie/raaklijn'],
                ['zoek7', '/theorie/extreme-waarden'],
              ] as const
            ).map(([labelKey, href]) => (
              <li key={href}>
                <Link
                  href={href}
                  className="inline-flex min-h-11 items-center text-accent underline-offset-2 hover:underline"
                >
                  {t(labelKey)}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-text-muted">
            {t.rich('examTraining', {
              link: (chunks) => (
                <Link
                  href={EXAMENTRAINING_PAD}
                  className="font-medium text-accent underline-offset-2 hover:underline"
                >
                  {chunks}
                </Link>
              ),
            })}
          </p>
        </section>

        <HomeDemo />

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature title={t('feature1Title')} body={t('feature1Body')} />
          <Feature title={t('feature2Title')} body={t('feature2Body')} />
          <Feature title={t('feature3Title')} body={t('feature3Body')} />
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('howH2')}</h2>
          <ol className="mt-6 space-y-4 text-text-muted">
            {[1, 2, 3, 4].map((n) => (
              <li key={n}>
                <span className="font-medium text-text">
                  {t(`how${n}Title` as 'how1Title')}
                </span>{' '}
                {t(`how${n}Body` as 'how1Body')}
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('faqH2')}</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-surface p-4 open:bg-surface-2"
              >
                <summary className="cursor-pointer font-medium text-text">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
          <h2 className="font-serif text-3xl text-text">{t('ctaH2')}</h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">{t('ctaBody')}</p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/registreren"
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegister')}
            </Link>
          </div>
        </section>
      </div>
    </>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="font-serif text-xl text-text">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  )
}
