import katex from 'katex'

/**
 * Zichtbare KaTeX-HTML plus een MathML-versie.
 *
 * `output: 'html'` zet `aria-hidden` op de enige versie, dus een schermlezer
 * slaat de formule over. MathML blijft visueel weg via de KaTeX-CSS; de
 * schermlezer leest die wel.
 */
export function formuleHtml(
  tex: string,
  weergave: { displayMode?: boolean; wrap?: boolean } = {},
): string {
  const displayMode = weergave.displayMode ?? false
  const wrap = weergave.wrap ?? false
  const blok = displayMode && !wrap
  return katex.renderToString(wrap ? `\\displaystyle ${tex}` : tex, {
    displayMode: blok,
    throwOnError: false,
    strict: 'ignore',
    output: 'htmlAndMathml',
  })
}
