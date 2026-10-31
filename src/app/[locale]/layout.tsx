import type { Metadata } from 'next'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'

import { SiteFooter } from '@/components/site-footer'
import { SITE_CONFIG } from '@/config/site'
import { routing } from '@/i18n/routing'
import {
  DEEL_TEKST_START,
  DEEL_TITEL_START,
  SITE_URL,
  TITEL_STANDAARD,
} from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const domain = SITE_CONFIG.domain

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${TITEL_STANDAARD} | ${domain}`,
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
      {/* De hele pagina vult het scherm. De kop blijft altijd staan; alleen
          het midden scrolt. Zo schuift er geen tekst onder de kop. De kop
          zelf zit in de lay-out van de pagina, niet hier: de startpagina
          heeft een kop zonder inlogcontrole.
          Op de computer blijft de voettekst hier ook vast staan, als laatste
          vak in deze kolom. Op de telefoon staat hij hier niet: daar hoort
          hij onderaan de pagina-inhoud, zodat hij meescrolt in plaats van
          permanent ruimte in te nemen — zie `(paginas)/layout.tsx` en
          `(start)/layout.tsx`, en `oefenen-client.tsx` voor de oefenpagina
          (die zelf bepaalt wat er scrolt). */}
      <div className="flex h-dvh min-h-0 flex-col overflow-hidden">
        {children}
        <SiteFooter className="hidden sm:block" />
      </div>
    </NextIntlClientProvider>
  )
}
