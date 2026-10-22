import katex from 'katex'
import katexPackageJson from 'katex/package.json'
import { useState } from 'react'
import { View } from 'react-native'
import { WebView, type WebViewMessageEvent } from 'react-native-webview'

/**
 * Formules tonen in React Native — de keuze (zie pull request AFG-558):
 *
 * KaTeX zelf is gewone JS zonder DOM-afhankelijkheid (`renderToString`
 * werkt ook in Node), maar het resultaat is HTML + CSS met heel precieze
 * positionering per lettertype-glyph. Dat kan geen enkele RN-component
 * zonder een browser-engine netjes tonen (geen `react-native-render-html`,
 * geen eigen SVG-tekenaar). Daarom draait hetzelfde `formuleHtml`-achtige
 * HTML-fragment hier in een kleine `react-native-webview` — officieel
 * ondersteund door Expo en al in Expo Go aanwezig, dus geen development
 * build nodig. De KaTeX-CSS (incl. lettertypen) komt van de jsDelivr-CDN,
 * dezelfde versie als `katex` in `package.json` van de site: zo hoeft de app
 * geen tientallen losse font-bestanden mee te bouwen, en blijft de opmaak
 * altijd gelijk aan de site.
 *
 * `react-native-webview` ondersteunt geen web (`expo start --web`) — zie
 * `math.web.tsx` voor dat platform; Metro kiest automatisch het juiste
 * bestand per platform.
 */
// Dezelfde versie als het geïnstalleerde `katex`-pakket, zodat de CSS van
// de CDN nooit uit de pas loopt met de HTML die `renderToString` hieronder
// maakt (een update van `katex` in package.json werkt dit vanzelf bij).
const KATEX_CSS_URL = `https://cdn.jsdelivr.net/npm/katex@${katexPackageJson.version}/dist/katex.min.css`

function paginaHtml(binnenHtml: string, displayMode: boolean): string {
  // In displayMode vult de formule de volle breedte (met horizontaal
  // scrollen als hij toch te lang is, zie de ontwerpregels over formules).
  // Inline (bv. middenin een stappenplan-zin) krimpt #wrap mee met de
  // inhoud, zodat RichMath hem tussen gewone tekst kan laten meelopen.
  const wrapCss = displayMode
    ? 'display: inline-block; min-width: 100%; overflow-x: auto;'
    : 'display: inline-block;'
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
<link rel="stylesheet" href="${KATEX_CSS_URL}" />
<style>
  html, body { margin: 0; padding: 0; background: transparent; }
  body { font-family: -apple-system, sans-serif; }
  #wrap { ${wrapCss} -webkit-overflow-scrolling: touch; }
</style>
</head>
<body>
<div id="wrap">${binnenHtml}</div>
<script>
  function stuurAfmeting() {
    var el = document.getElementById('wrap');
    window.ReactNativeWebView.postMessage(JSON.stringify({ h: el.scrollHeight, w: el.scrollWidth }));
  }
  window.onload = stuurAfmeting;
  if (document.fonts && document.fonts.ready) { document.fonts.ready.then(stuurAfmeting); }
  setTimeout(stuurAfmeting, 300);
</script>
</body>
</html>`
}

export function Math({
  tex,
  displayMode = false,
}: {
  tex: string
  displayMode?: boolean
}) {
  const [afmeting, setAfmeting] = useState({ h: 40, w: 60 })
  const html = katex.renderToString(tex, {
    throwOnError: false,
    strict: 'ignore',
    output: 'html',
    displayMode,
  })

  function onMessage(e: WebViewMessageEvent) {
    try {
      const { h, w } = JSON.parse(e.nativeEvent.data)
      if (Number.isFinite(h) && h > 0 && Number.isFinite(w) && w > 0) setAfmeting({ h, w })
    } catch {
      // Negeer een onverwacht bericht; de laatst bekende afmeting blijft staan.
    }
  }

  return (
    <View style={{ height: afmeting.h, width: displayMode ? '100%' : afmeting.w }}>
      <WebView
        originWhitelist={['*']}
        source={{ html: paginaHtml(html, displayMode) }}
        onMessage={onMessage}
        scrollEnabled={false}
        style={{ backgroundColor: 'transparent' }}
        containerStyle={{ backgroundColor: 'transparent' }}
      />
    </View>
  )
}
