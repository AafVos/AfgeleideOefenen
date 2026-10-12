import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import { DEEL_TEKST_START, DEEL_TITEL_START, SITE_URL } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const domain = SITE_CONFIG.domain

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `Differentiëren oefenen — afgeleide wiskunde B VWO | ${domain}`,
      template: `%s · ${domain}`,
    },
    description: DEEL_TEKST_START,
    applicationName: domain,
    authors: [{ name: domain }],
    // Geen `alternates` hier: dat zou elke pagina hieronder de canonieke link
    // van de layout geven. Elke pagina noemt haar eigen adres — zie
    // `canoniek()` in `src/lib/seo.ts`.
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: domain,
      title: DEEL_TITEL_START,
      description: DEEL_TEKST_START,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [
        { url: '/favicon.png', type: 'image/png' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/favicon.ico' },
      ],
      shortcut: ['/favicon.ico'],
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <NextIntlClientProvider messages={messages}>
      <SiteHeader locale={locale} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </NextIntlClientProvider>
  )
}
