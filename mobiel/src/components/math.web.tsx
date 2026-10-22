import katex from 'katex'
import katexPackageJson from 'katex/package.json'
import { useEffect } from 'react'

/**
 * Web-variant van `math.tsx` (zie de uitleg daar): `react-native-webview`
 * werkt niet op web, dus daar zet deze component de KaTeX-HTML rechtstreeks
 * in een gewone `<div>` — dat kan hier wél, `expo start --web` rendert via
 * react-dom. Metro kiest dit bestand automatisch op web dankzij de
 * `.web.tsx`-naam.
 */
const KATEX_CSS_URL = `https://cdn.jsdelivr.net/npm/katex@${katexPackageJson.version}/dist/katex.min.css`
let cssGeladen = false

function zorgVoorKatexCss() {
  if (cssGeladen || typeof document === 'undefined') return
  cssGeladen = true
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = KATEX_CSS_URL
  document.head.appendChild(link)
}

export function Math({
  tex,
  displayMode = false,
}: {
  tex: string
  displayMode?: boolean
}) {
  useEffect(() => {
    zorgVoorKatexCss()
  }, [])

  const html = katex.renderToString(tex, {
    throwOnError: false,
    strict: 'ignore',
    output: 'html',
    displayMode,
  })

  const style = displayMode
    ? { width: '100%', overflowX: 'auto' as const }
    : { display: 'inline-block' as const }

  return <div style={style} dangerouslySetInnerHTML={{ __html: html }} />
}
