import type { Metadata } from 'next'
import { DM_Sans, DM_Serif_Display } from 'next/font/google'
import Script from 'next/script'

import { Meten } from '@/components/meten'

import './globals.css'

// Publiek token van Cloudflare Web Analytics. Leeg of weg: geen tellerscript,
// dus lokaal en in de tests gebeurt er niets. Live staat hij bij de
// bouwvariabelen van Workers Builds, want NEXT_PUBLIC_ wordt bij de bouw
// ingebakken.
const beaconToken = process.env.NEXT_PUBLIC_CF_BEACON_TOKEN

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

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: ['/favicon.ico'],
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
        {children}
        {/* Eigen klikmeting, zonder koekjes. Laadt pas als de pagina er
            staat en meet niets op /admin. Zie src/lib/meten/. */}
        <Meten />
      </body>
      {beaconToken ? (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          strategy="afterInteractive"
          data-cf-beacon={JSON.stringify({ token: beaconToken, spa: true })}
        />
      ) : null}
    </html>
  )
}
