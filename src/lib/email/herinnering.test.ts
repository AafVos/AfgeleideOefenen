import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { afmeldPad, oefenPad } from '@/lib/herinnering/links'

/** De velden van de mail die we aan Resend meegeven. */
type Mail = {
  from: string
  to: string
  subject: string
  html: string
  text: string
  headers?: Record<string, string>
}

const { send } = vi.hoisted(() => ({
  send: vi.fn<(mail: Mail) => Promise<{ error: unknown }>>(),
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send }
  },
}))

const {
  herinneringHtml,
  herinneringTekst,
  onderwerpRegel,
  stuurHerinnering,
} = await import('./herinnering')

const INHOUD = {
  soortSom: 'Productregel',
  hoofdstuk: 'Hoofdstuk 6',
  onderwerp: 'Rekenregels',
  pad: oefenPad('h6', 'rekenregels', 'productregel'),
  afmeldPad: afmeldPad('0f3d9a7e-1111-2222-3333-444455556666'),
}

beforeEach(() => {
  send.mockReset()
  send.mockResolvedValue({ error: null })
  vi.stubEnv('RESEND_API_KEY', 're_nep')
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('de inhoud van de herinneringsmail', () => {
  it('noemt de soort som in het onderwerp', () => {
    expect(onderwerpRegel(INHOUD)).toBe('Verder met Productregel?')
  })

  it('zet de soort som, de plek en allebei de links in de HTML', () => {
    const html = herinneringHtml(INHOUD)
    expect(html).toContain('Nog even verder?')
    expect(html).toContain('Productregel')
    expect(html).toContain('Hoofdstuk 6')
    expect(html).toContain('/nl/oefenen?chapter=h6&amp;topic=rekenregels&amp;cluster=productregel')
    expect(html).toContain('Geen herinneringen meer')
    expect(html).toContain('/nl/herinnering-uit?sleutel=')
  })

  it('zegt in de tekstversie hetzelfde', () => {
    const tekst = herinneringTekst(INHOUD)
    expect(tekst).toContain('Productregel')
    expect(tekst).toContain('/nl/oefenen?chapter=h6')
    expect(tekst).toContain('/nl/herinnering-uit?sleutel=')
  })

  it('maakt een titel met tekens die HTML verstoren onschadelijk', () => {
    const html = herinneringHtml({ ...INHOUD, soortSom: 'f(x) < g(x) & "h"' })
    expect(html).toContain('f(x) &lt; g(x) &amp; &quot;h&quot;')
    expect(html).not.toContain('< g(x)')
  })
})

describe('stuurHerinnering', () => {
  it('stuurt één mail, met een afmeldkop erbij', async () => {
    const resultaat = await stuurHerinnering('leerling@test.local', INHOUD)

    expect(resultaat).toEqual({ verstuurd: true })
    expect(send).toHaveBeenCalledTimes(1)
    const mail = send.mock.calls[0]![0]
    expect(mail.to).toBe('leerling@test.local')
    expect(mail.subject).toBe('Verder met Productregel?')
    expect(mail.headers?.['List-Unsubscribe']).toContain('/nl/herinnering-uit?sleutel=')
  })

  it('stuurt niets zonder mailsleutel', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const resultaat = await stuurHerinnering('leerling@test.local', INHOUD)

    expect(resultaat).toEqual({ verstuurd: false, reden: 'geen-sleutel' })
    expect(send).not.toHaveBeenCalled()
  })

  it('meldt een fout van Resend terug in plaats van hem op te slokken', async () => {
    send.mockResolvedValue({ error: { message: 'nee' } })
    const resultaat = await stuurHerinnering('leerling@test.local', INHOUD)

    expect(resultaat).toEqual({ verstuurd: false, reden: 'fout' })
  })
})
