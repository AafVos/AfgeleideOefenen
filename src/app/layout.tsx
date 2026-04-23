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
  'Afgeleide oefenen voor wiskunde B op het VWO. Gratis adaptieve oefeningen met directe uitleg bij elke fout: machtsregel, productregel, quotiëntregel en kettingregel. Volgens Getal & Ruimte.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Afgeleide oefenen — wiskunde B VWO | afgeleideoefenen.nl',
    template: '%s · afgeleideoefenen.nl',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'afgeleide oefenen',
    'afgeleide oefenen wiskunde B',
    'afgeleide oefenen VWO',
    'afgeleiden oefenen',
    'differentiëren oefenen',
    'differentiëren VWO',
    'wiskunde B VWO',
    'machtsregel oefenen',
    'productregel oefenen',
    'quotiëntregel oefenen',
    'kettingregel oefenen',
    'Getal en Ruimte differentiëren',
    'wiskunde oefenen VWO',
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
