import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import { SITE_URL } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const domain = SITE_CONFIG.domain

  // "Adaptief" stond hier nog uit de tijd van het leerpad (weg sinds AFG-12).
  // De site kiest niets voor je: je kiest zelf een hoofdstuk, een onderwerp en
  // een opgave, en bij een fout krijg je het stappenplan erbij.
  const SITE_DESCRIPTION =
    'Differentiëren oefenen voor wiskunde B VWO — gratis, met uitleg bij elke fout. Oefen de afgeleide met de machtsregel, productregel, quotiëntregel, kettingregel, goniometrie, e-macht en ln. Ideaal voor het eindexamen.'

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `Differentiëren oefenen — afgeleide wiskunde B VWO | ${domain}`,
      template: `%s · ${domain}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: domain,
    authors: [{ name: domain }],
    // Geen `alternates` hier: dat zou elke pagina hieronder de canonieke link
    // van de layout geven. Elke pagina noemt haar eigen adres — zie
    // `canoniek()` in `src/lib/seo.ts`.
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: domain,
      title: 'Afgeleide oefenen — wiskunde B VWO',
      description: SITE_DESCRIPTION,
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
    </NextIntlClientProvider>
  )
}
