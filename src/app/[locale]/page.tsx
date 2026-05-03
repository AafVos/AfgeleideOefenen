import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afgeleideoefenen.nl'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const t = await getTranslations('Home')

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
        name: 'afgeleideoefenen.nl',
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
              leerpad: (chunks) => (
                <span className="text-text">{chunks}</span>
              ),
              vrijOefenen: (chunks) => (
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
            <Link
              href="/registreren"
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaRegister')}
            </Link>
            <Link
              href="/inloggen"
              className="rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaLogin')}
            </Link>
          </div>
          <p className="mt-3 text-sm text-text-muted">{t('tagline')}</p>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature title={t('feature1Title')} body={t('feature1Body')} />
          <Feature title={t('feature2Title')} body={t('feature2Body')} />
          <Feature title={t('feature3Title')} body={t('feature3Body')} />
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">{t('topicsH2')}</h2>
          <p className="mt-3 text-text-muted">{t('topicsIntro')}</p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              [t('topic1Title'), t('topic1Body')],
              [t('topic2Title'), t('topic2Body')],
              [t('topic3Title'), t('topic3Body')],
              [t('topic4Title'), t('topic4Body')],
              [t('topic5Title'), t('topic5Body')],
              [t('topic6Title'), t('topic6Body')],
            ].map(([title, body]) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-medium text-text">{title}</p>
                <p className="mt-1 text-sm text-text-muted">{body}</p>
              </li>
            ))}
          </ul>
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
      <h3 className="font-serif text-xl text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  )
}
