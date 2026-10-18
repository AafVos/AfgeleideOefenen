import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Fix: multiple package-lock.json files on this machine confuse Next.js
  // file tracing. Pin the root explicitly so the build finds this project.
  outputFileTracingRoot: path.resolve(__dirname),
  experimental: {
    // Zet de stijlen in de pagina zelf, in plaats van in drie losse
    // CSS-bestanden die de browser eerst moet ophalen voordat er iets op het
    // scherm komt. Dat scheelde op een trage telefoonverbinding ongeveer een
    // halve seconde tot een seconde voor het eerste beeld (AFG-467).
    //
    // Next zet de stijlen drie keer in de pagina: één keer als <style> en
    // twee keer in de gegevens voor de browser. Ongepakt is dat veel, maar
    // Cloudflare stuurt alles door brotli en dat drukt de herhalingen weg:
    // de startpagina werd 18,9 → 31,4 kB terwijl er 11,4 kB aan losse
    // CSS-bestanden af ging. Netto dus ongeveer 1 kB meer, en een rondje
    // naar de server minder. Meet je dit met `next start`, dan lijkt het
    // slechter: die pakt met gzip, en gzip ziet de herhalingen niet.
    //
    // Klikken binnen de site wordt niet zwaarder: daar verwijst Next nog
    // gewoon naar de CSS-bestanden.
    inlineCss: true,
    serverActions: {
      // Video-verzoeken mogen foto's van een boekopgave meesturen. Standaard
      // is 1 MB, te weinig voor een telefoonfoto. De browser verkleint ze al
      // (zie lib/images/compress.ts); 4 MB is de marge.
      bodySizeLimit: '4mb',
    },
  },
}

export default withNextIntl(nextConfig)
