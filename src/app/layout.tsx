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
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lerendifferentieren.nl'

const SITE_DESCRIPTION =
  'Oefen differentiëren voor VWO wiskunde. Adaptieve vragen, directe uitleg bij fouten en stap-voor-stap feedback. Gratis en in het Nederlands.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'lerendifferentiëren.nl — oefen differentiëren voor VWO',
    template: '%s · lerendifferentiëren.nl',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'differentiëren',
    'wiskunde',
    'VWO',
    'oefenen',
    'afgeleide',
    'machtsregel',
    'Getal en Ruimte',
    'wiskunde leren',
    'differentieren oefenen',
  ],
  applicationName: 'lerendifferentiëren.nl',
  authors: [{ name: 'lerendifferentiëren.nl' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'nl_NL',
    url: SITE_URL,
    siteName: 'lerendifferentiëren.nl',
    title: 'Oefen differentiëren voor VWO — gratis en adaptief',
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'lerendifferentiëren.nl',
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
