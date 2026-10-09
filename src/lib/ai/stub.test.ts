import { afterEach, describe, expect, it, vi } from 'vitest'

import { aiCheckIsStubbed, stubCheckAnswerJson } from './stub'

afterEach(() => {
  vi.unstubAllEnvs()
})

// =====================================================================
// De schakelaar: wanneer staat de neppe AI-controle aan?
// =====================================================================
describe('aiCheckIsStubbed', () => {
  it('staat uit zonder AI_CHECK_MODE', () => {
    vi.stubEnv('AI_CHECK_MODE', undefined)
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(false)
  })

  it('staat uit bij een andere waarde dan stub', () => {
    vi.stubEnv('AI_CHECK_MODE', 'gemini')
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(false)
  })

  it('staat aan met AI_CHECK_MODE=stub buiten productie', () => {
    vi.stubEnv('AI_CHECK_MODE', 'stub')
    vi.stubEnv('NODE_ENV', 'test')
    expect(aiCheckIsStubbed()).toBe(true)

    vi.stubEnv('NODE_ENV', 'development')
    expect(aiCheckIsStubbed()).toBe(true)
  })

  it('staat NOOIT aan in productie, ook niet met AI_CHECK_MODE=stub', () => {
    vi.stubEnv('AI_CHECK_MODE', 'stub')
    vi.stubEnv('NODE_ENV', 'production')
    expect(aiCheckIsStubbed()).toBe(false)
  })
})

// =====================================================================
// De vaste uitkomst
// =====================================================================
describe('stubCheckAnswerJson', () => {
  it('rekent hetzelfde antwoord in een andere notatie goed', () => {
    // -1/x^2 is precies hetzelfde als -x^-2
    expect(stubCheckAnswerJson('-x^-2', '-1/x^2')).toEqual({
      is_mathematically_correct: true,
      error_explanation: '',
    })
    expect(stubCheckAnswerJson('3x^-1', '3/x')).toMatchObject({
      is_mathematically_correct: true,
    })
  })

  it('rekent een fout antwoord fout en geeft uitleg mee', () => {
    const result = stubCheckAnswerJson('6x^2', '2x')
    expect(result.is_mathematically_correct).toBe(false)
    expect(result.error_explanation.length).toBeGreaterThan(0)
  })

  it('rekent een leeg antwoord fout', () => {
    expect(stubCheckAnswerJson('6x^2', '').is_mathematically_correct).toBe(false)
  })

  it('geeft altijd dezelfde uitkomst voor dezelfde invoer', () => {
    const a = stubCheckAnswerJson('12x^3', '4x')
    const b = stubCheckAnswerJson('12x^3', '4x')
    expect(a).toEqual(b)
  })
})
