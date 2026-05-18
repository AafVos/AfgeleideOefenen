import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/site-header'
import { domainForLocale } from '@/config/site'
import { routing } from '@/i18n/routing'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  const isNl = locale === 'nl'
  const domain = domainForLocale(locale)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${domain}`

  // TODO: subject-specific marketing copy. Move to per-site messages files
  // when integralen-content is authored.
  const SITE_DESCRIPTION = isNl
    ? 'Differentiëren oefenen voor wiskunde B VWO — gratis en adaptief. Oefen de afgeleide met de machtsregel, productregel, quotiëntregel, kettingregel, goniometrie, e-macht en ln. Ideaal voor het eindexamen.'
    : 'Practise derivatives and differentiation rules — free and adaptive. Power rule, product rule, quotient rule, chain rule, trigonometry, exponentials and logarithms. Perfect for exam preparation.'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: isNl
        ? `Differentiëren oefenen — afgeleide wiskunde B VWO | ${domain}`
        : `Practise derivatives — differentiation rules | ${domain}`,
      template: `%s · ${domain}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: domain,
    authors: [{ name: domain }],
    alternates: {
      canonical: `/${locale}`,
      languages: { nl: '/nl', en: '/en' },
    },
    openGraph: {
      type: 'website',
      locale: isNl ? 'nl_NL' : 'en_US',
      url: siteUrl,
      siteName: domain,
      title: isNl
        ? 'Afgeleide oefenen — wiskunde B VWO'
        : 'Practise derivatives — calculus',
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
