import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/**
 * Repareert het pad naar lettertypen waar CSS naar verwijst (AFG-499).
 *
 * Met `inlineCss` aan zet Next het pad voor bestanden waar CSS naar wijst op
 * `/` in plaats van op `/_next/`. Zie in
 * `node_modules/next/dist/build/webpack/config/blocks/css/loaders/client.js`
 * de regel `publicPath: experimentalInlineCss ? '/' : ...`. Daardoor kwamen de
 * KaTeX-lettertypen uit `katex/dist/katex.min.css` op
 * `/static/media/KaTeX_…woff2` te staan, terwijl ze op
 * `/_next/static/media/KaTeX_…woff2` staan: op elke pagina met een formule
 * gaven alle lettertypen een 404 en viel de browser terug op een
 * systeemlettertype. Dat raakt ook de losse CSS-bestanden, niet alleen de
 * stijlen in de pagina zelf.
 *
 * Deze instelling bepaalt niet waar de CSS zelf vandaan komt, alleen waar de
 * bestanden staan waar die CSS naar verwijst. Hem terugzetten op `/_next/`
 * laat `inlineCss` dus gewoon zijn werk doen.
 *
 * De eigen lettertypen (`next/font`) hadden hier geen last van: die zet Next
 * langs een andere weg in de CSS, al met het goede pad.
 *
 * Vindt deze reparatie niets meer, dan stopt de bouw met uitleg. Zo blijft
 * het niet onopgemerkt als Next het zelf goed gaat doen of de naam van de
 * instelling verandert.
 */
function herstelLettertypePad(config: {
  module?: { rules?: unknown[] }
}): void {
  let hersteld = 0

  const loop = (knoop: unknown): void => {
    if (Array.isArray(knoop)) {
      for (const kind of knoop) loop(kind)
      return
    }
    if (!knoop || typeof knoop !== 'object') return

    const regel = knoop as {
      loader?: unknown
      options?: { publicPath?: unknown }
      oneOf?: unknown
      rules?: unknown
      use?: unknown
    }

    if (
      typeof regel.loader === 'string' &&
      regel.loader.includes('mini-css-extract-plugin') &&
      regel.options?.publicPath === '/'
    ) {
      regel.options.publicPath = '/_next/'
      hersteld += 1
    }

    loop(regel.oneOf)
    loop(regel.rules)
    loop(regel.use)
  }

  loop(config.module?.rules)

  if (hersteld === 0) {
    throw new Error(
      'AFG-499: het pad naar de lettertypen kon niet hersteld worden. ' +
        'Next zet het waarschijnlijk zelf al goed; controleer ' +
        'node_modules/next/dist/build/webpack/config/blocks/css/loaders/client.js ' +
        'en haal deze reparatie weg als dat zo is.',
    )
  }
}

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
  webpack(config, { isServer }) {
    // Alleen de bouw voor de browser maakt CSS-bestanden met verwijzingen
    // naar lettertypen.
    if (!isServer) herstelLettertypePad(config)
    return config
  },
}

export default withNextIntl(nextConfig)
