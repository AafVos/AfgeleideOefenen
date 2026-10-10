import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import Link from 'next/link'

import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'

// Deze pagina vangt élk adres dat nergens op uitkomt. Ze staat bewust in
// `src/app` en niet in `src/app/[locale]`: alleen hier bovenin komt Next.js
// ook langs bij een adres dat helemaal geen taalcode raakt. De bovenbalk komt
// uit `[locale]/layout.tsx` en hoort daar dus niet bij — die zetten we er hier
// zelf neer, mét de provider die de teksten van de balk levert.
const TAAL = routing.defaultLocale

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('NotFound')
  return { title: `${t('h1')} · ${SITE_CONFIG.domain}` }
}

export default async function NotFound() {
  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations('NotFound'),
  ])

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteHeader locale={TAAL} />
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            {t('eyebrow')}
          </p>
          <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
            {t('h1')}
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
            {t('lead')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href={`/${TAAL}/oefenen`}
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              {t('ctaOefenen')}
            </Link>
            <Link
              href={`/${TAAL}/theorie`}
              className="rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
            >
              {t('ctaTheorie')}
            </Link>
          </div>

          <p className="mt-6 text-sm text-text-muted">
            <Link
              href={`/${TAAL}`}
              className="font-medium text-accent underline-offset-2 hover:underline"
            >
              {t('ctaHome')}
            </Link>
          </p>
        </div>
      </main>
    </NextIntlClientProvider>
  )
}
