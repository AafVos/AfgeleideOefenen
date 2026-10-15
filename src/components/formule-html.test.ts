import { describe, expect, it } from 'vitest'

import { formuleHtml } from './formule-html'

const KETTING = "f'(x) = g'\\bigl(h(x)\\bigr) \\cdot h'(x)"
const MACHT = "f'(x) = n \\cdot a \\, x^{n-1}"

function delen(html: string) {
  const mathml = html.indexOf('class="katex-mathml"')
  const zichtbaar = html.indexOf('class="katex-html"')
  return { mathml, zichtbaar, verborgen: html.slice(mathml, zichtbaar) }
}

describe('formuleHtml', () => {
  it('geeft een zichtbare formule en MathML die een schermlezer kan lezen', () => {
    const html = formuleHtml(KETTING, { wrap: true })
    const { mathml, zichtbaar, verborgen } = delen(html)

    expect(mathml).toBeGreaterThan(-1)
    expect(zichtbaar).toBeGreaterThan(mathml)
    expect(verborgen).toContain('<math')
    expect(verborgen).not.toContain('aria-hidden')
    expect(html.slice(zichtbaar, zichtbaar + 40)).toContain('aria-hidden="true"')
    expect(html).toContain('katex-html')
  })

  it('doet hetzelfde voor de machtsregel en een opgave in grote weergave', () => {
    for (const html of [
      formuleHtml(MACHT, { wrap: true }),
      formuleHtml('f(x) = 4x^{3}', { displayMode: true }),
    ]) {
      const { mathml, zichtbaar, verborgen } = delen(html)
      expect(verborgen).toContain('<math')
      expect(verborgen).not.toContain('aria-hidden')
      expect(html.slice(zichtbaar)).toContain('aria-hidden="true"')
      expect(mathml).toBeGreaterThan(-1)
    }
  })
})
