import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const domain = SITE_CONFIG.domain
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`

  const SITE_DESCRIPTION =
    'Differentiëren oefenen voor wiskunde B VWO — gratis en adaptief. Oefen de afgeleide met de machtsregel, productregel, quotiëntregel, kettingregel, goniometrie, e-macht en ln. Ideaal voor het eindexamen.'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `Differentiëren oefenen — afgeleide wiskunde B VWO | ${domain}`,
      template: `%s · ${domain}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: domain,
    authors: [{ name: domain }],
    alternates: {
      canonical: `/${locale}`,
    },
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      url: siteUrl,
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
