import { afterEach, describe, expect, it, vi } from 'vitest'

import { maakMailer } from './mailer'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('maakMailer', () => {
  it('geeft null als de sleutel ontbreekt', () => {
    vi.stubEnv('RESEND_API_KEY', '')

    expect(maakMailer()).toBeNull()
  })

  it('geeft null als de sleutel alleen spaties is', () => {
    vi.stubEnv('RESEND_API_KEY', '   ')

    expect(maakMailer()).toBeNull()
  })

  it('geeft een client als de sleutel er is', () => {
    vi.stubEnv('RESEND_API_KEY', 're_nep')

    expect(maakMailer()?.emails).toBeDefined()
  })
})
