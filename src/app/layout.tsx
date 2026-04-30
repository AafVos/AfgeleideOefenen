import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'

import { SiteHeader } from '@/components/site-header'

import './globals.css'

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  variable: '--font-dm-serif',
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
})

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afgeleideoefenen.nl'

const SITE_DESCRIPTION =
  'Differentiëren oefenen voor wiskunde B VWO — gratis en adaptief. Oefen de afgeleide met de machtsregel, productregel, quotiëntregel, kettingregel, goniometrie, e-macht en ln. Ideaal voor het eindexamen. Aanpak volgens Getal & Ruimte.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Differentiëren oefenen — afgeleide wiskunde B VWO | afgeleideoefenen.nl',
    template: '%s · afgeleideoefenen.nl',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    // Kernzoektermen
    'differentiëren oefenen',
    'differentiëren',
    'afgeleide oefenen',
    'afgeleide berekenen',
    'afgeleiden oefenen',
    'afgeleide wiskunde',
    // Examen
    'wiskunde B eindexamen',
    'eindexamen wiskunde B oefenen',
    'examen wiskunde B VWO',
    'VWO wiskunde B examen',
    'wiskunde examen oefenen',
    // Methode
    'Getal en Ruimte',
    'Getal & Ruimte differentiëren',
    'Getal en Ruimte wiskunde B',
    'Moderne Wiskunde differentiëren',
    // Onderwerpen
    'machtsregel oefenen',
    'productregel oefenen',
    'quotiëntregel oefenen',
    'kettingregel oefenen',
    'kettingregel uitleg',
    'afgeleide sinus cosinus',
    'afgeleide e macht',
    'afgeleide ln',
    'goniometrie differentiëren',
    // Platform
    'afgeleide oefenen VWO',
    'differentiëren VWO',
    'wiskunde B VWO oefenen',
    'wiskunde oefenen gratis',
    'adaptief oefenen wiskunde',
  ],
  applicationName: 'afgeleideoefenen.nl',
  authors: [{ name: 'afgeleideoefenen.nl' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: SITE_URL,
    siteName: 'afgeleideoefenen.nl',
    title: 'Afgeleide oefenen — wiskunde B VWO',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Afgeleide oefenen — wiskunde B VWO',
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="nl"
      className={`${dmSans.variable} ${dmSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text">
        <SiteHeader />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  )
}
