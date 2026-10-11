import { describe, expect, it } from 'vitest'

import { repairLatexBackslashes } from './gemini'

describe('repairLatexBackslashes', () => {
  it('verdubbelt een losse LaTeX-backslash zodat JSON.parse slaagt', () => {
    const kapot =
      '{"error_explanation": "bij het differentieren van $\\sin(4x)$ moet je ..."}'
    const hersteld = repairLatexBackslashes(kapot)
    expect(() => JSON.parse(hersteld)).not.toThrow()
    expect(JSON.parse(hersteld).error_explanation).toContain('\\sin(4x)')
  })

  it('verdubbelt \\frac ook al is \\f een geldige JSON-escape (formfeed)', () => {
    const kapot =
      '{"error_explanation": "gebruik $\\frac{1}{2}$ en $\\cos(x)$"}'
    const hersteld = repairLatexBackslashes(kapot)
    expect(() => JSON.parse(hersteld)).not.toThrow()
    const waarde = JSON.parse(hersteld).error_explanation
    // Niet stilletjes een formfeed geworden: er staat echt \frac.
    expect(waarde).toContain('\\frac{1}{2}')
    expect(waarde).toContain('\\cos(x)')
    expect(waarde).not.toContain('\f')
  })

  it('laat een al nette JSON ongewijzigd', () => {
    const netjes =
      '{"error_explanation": "$\\\\sin(4x)$ en $\\\\frac{1}{2}$"}'
    expect(repairLatexBackslashes(netjes)).toBe(netjes)
  })

  it('herstelt een mix van goede en foute backslashes in één response', () => {
    // Precies het geval uit de bug: $\\sin$ (goed) naast $\sin(4x)$ (fout).
    const kapot =
      '{"error_explanation": "zoals $\\\\sin$ naast $\\sin(4x)$ en $\\cos(x)$"}'
    const hersteld = repairLatexBackslashes(kapot)
    expect(() => JSON.parse(hersteld)).not.toThrow()
    const waarde = JSON.parse(hersteld).error_explanation
    expect(waarde).toBe('zoals $\\sin$ naast $\\sin(4x)$ en $\\cos(x)$')
  })

  it('verdubbelt \\l en \\c, die geen geldige JSON-escape zijn', () => {
    const kapot = '{"s": "$\\ln(x)$ en $\\cdot$"}'
    const hersteld = repairLatexBackslashes(kapot)
    expect(() => JSON.parse(hersteld)).not.toThrow()
    expect(JSON.parse(hersteld).s).toBe('$\\ln(x)$ en $\\cdot$')
  })

  it('laat echte JSON-escapes zoals \\" \\\\ \\/ en \\uXXXX staan', () => {
    const metEscapes = '{"tekst": "een \\"citaat\\", een \\\\ en \\u00e9"}'
    expect(repairLatexBackslashes(metEscapes)).toBe(metEscapes)
    expect(JSON.parse(metEscapes).tekst).toBe('een "citaat", een \\ en é')
  })

  it('is idempotent', () => {
    const kapot = '{"x": "$\\sqrt{x}$"}'
    const eenKeer = repairLatexBackslashes(kapot)
    expect(repairLatexBackslashes(eenKeer)).toBe(eenKeer)
  })
})
