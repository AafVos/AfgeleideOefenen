import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { generateJson, repairLatexBackslashes } from './gemini'

/** Minimale geldige Gemini-response, met `text` overschrijfbaar per test. */
function geminiResponse(text: string) {
  return {
    candidates: [{ content: { parts: [{ text }] } }],
  }
}

function jsonResponse(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: 'status',
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response
}

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

describe('generateJson', () => {
  const oudeKey = process.env.GEMINI_API_KEY

  beforeEach(() => {
    process.env.GEMINI_API_KEY = 'test-key'
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    process.env.GEMINI_API_KEY = oudeKey
    vi.unstubAllGlobals()
  })

  it('geeft een foutmelding als GEMINI_API_KEY ontbreekt, zonder fetch aan te roepen', async () => {
    delete process.env.GEMINI_API_KEY
    const result = await generateJson('vraag')
    expect(result).toEqual({
      ok: false,
      error: 'GEMINI_API_KEY is niet geconfigureerd.',
    })
    expect(fetch).not.toHaveBeenCalled()
  })

  it('geeft een foutmelding als fetch een netwerkfout gooit', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('kapotte verbinding'))
    const result = await generateJson('vraag')
    expect(result).toEqual({ ok: false, error: 'kapotte verbinding' })
  })

  it('geeft een foutmelding bij een niet-ok HTTP-status', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ message: 'quota op' }, 429),
    )
    const result = await generateJson('vraag')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toContain('Gemini 429')
    }
  })

  it('geeft een foutmelding als de prompt geblokkeerd is', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse({ promptFeedback: { blockReason: 'SAFETY' } }),
    )
    const result = await generateJson('vraag')
    expect(result).toEqual({
      ok: false,
      error: 'Gemini blokkeerde de prompt (SAFETY).',
    })
  })

  it('geeft een foutmelding bij een lege response', async () => {
    vi.mocked(fetch).mockResolvedValue(jsonResponse({ candidates: [] }))
    const result = await generateJson('vraag')
    expect(result).toEqual({ ok: false, error: 'Lege response van Gemini.' })
  })

  it('geeft een foutmelding als de tekst geen geldige JSON is, ook na het herstellen van LaTeX', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(geminiResponse('dit is geen json {')),
    )
    const result = await generateJson('vraag')
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toBe('Gemini gaf geen geldige JSON terug.')
      expect(result.raw).toBe('dit is geen json {')
    }
  })

  it('geeft de geparste data terug bij een geldige JSON-response', async () => {
    vi.mocked(fetch).mockResolvedValue(
      jsonResponse(geminiResponse('{"correct": true}')),
    )
    const result = await generateJson<{ correct: boolean }>('vraag')
    expect(result).toEqual({
      ok: true,
      data: { correct: true },
      raw: '{"correct": true}',
    })
  })
})
