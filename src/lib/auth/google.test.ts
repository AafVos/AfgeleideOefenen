import { describe, expect, it } from 'vitest'

import {
  gebruikersnaamBestemming,
  googleCallbackAdres,
  googleFoutSleutel,
  googleLoginAan,
  isNieuweAanmelding,
  moetNaamVragen,
  padZonderNaamvraag,
} from './google'

describe('googleLoginAan', () => {
  it('gaat alleen aan bij de waarde 1', () => {
    expect(googleLoginAan('1')).toBe(true)
    expect(googleLoginAan(undefined)).toBe(false)
    expect(googleLoginAan('')).toBe(false)
    expect(googleLoginAan('true')).toBe(false)
    expect(googleLoginAan('ja')).toBe(false)
  })
})

describe('moetNaamVragen', () => {
  it('vraagt de naam bij de eerste keer via Google', () => {
    expect(
      moetNaamVragen({
        app_metadata: { provider: 'google', providers: ['google'] },
        user_metadata: {},
      }),
    ).toBe(true)
  })

  it('slaat een account met e-mail en wachtwoord over', () => {
    expect(
      moetNaamVragen({
        app_metadata: { provider: 'email', providers: ['email'] },
        user_metadata: {},
      }),
    ).toBe(false)
  })

  it('vraagt niet opnieuw nadat de leerling de naam heeft overgeslagen', () => {
    expect(
      moetNaamVragen({
        app_metadata: { provider: 'google' },
        user_metadata: { google_naam_gevraagd: true },
      }),
    ).toBe(false)
  })

  it('vraagt niet opnieuw als de naam al gekozen is', () => {
    expect(
      moetNaamVragen({
        app_metadata: { provider: 'google' },
        user_metadata: { username: 'Sanne' },
      }),
    ).toBe(false)
  })
})

describe('googleCallbackAdres', () => {
  it('wijst terug naar de callback, met het oefenpad als dat veilig is', () => {
    expect(googleCallbackAdres('http://localhost:3000', null)).toBe(
      'http://localhost:3000/auth/callback?via=google&next=%2Fdashboard',
    )
    expect(googleCallbackAdres('http://localhost:3000/', '/oefenen?chapter=h2')).toBe(
      'http://localhost:3000/auth/callback?via=google&next=%2Foefenen%3Fchapter%3Dh2',
    )
    expect(googleCallbackAdres('http://localhost:3000', 'https://evil.example/oefenen')).toBe(
      'http://localhost:3000/auth/callback?via=google&next=%2Fdashboard',
    )
  })

  it('geeft een toegestane herkomst door als ?van=', () => {
    expect(googleCallbackAdres('http://localhost:3000', null, 'youtube')).toBe(
      'http://localhost:3000/auth/callback?via=google&next=%2Fdashboard&van=youtube',
    )
  })

  it('negeert een onbekende herkomst', () => {
    expect(googleCallbackAdres('http://localhost:3000', null, 'reclame')).toBe(
      'http://localhost:3000/auth/callback?via=google&next=%2Fdashboard',
    )
  })
})

describe('googleFoutSleutel', () => {
  it('herkent annuleren bij Google', () => {
    expect(googleFoutSleutel('access_denied')).toBe('google_afgebroken')
    expect(googleFoutSleutel('server_error')).toBe('auth_callback_failed')
    expect(googleFoutSleutel(null)).toBe('auth_callback_failed')
  })
})

describe('padZonderNaamvraag', () => {
  it('laat de terugkeer, uitloggen en de naamvraag zelf met rust', () => {
    expect(padZonderNaamvraag('/auth/callback')).toBe(true)
    expect(padZonderNaamvraag('/uitloggen')).toBe(true)
    expect(padZonderNaamvraag('/api/webhooks/welkom')).toBe(true)
    expect(padZonderNaamvraag('/nl/gebruikersnaam')).toBe(true)
    expect(padZonderNaamvraag('/nl/dashboard')).toBe(false)
    expect(padZonderNaamvraag('/nl/inloggen')).toBe(false)
  })
})

describe('isNieuweAanmelding', () => {
  const nu = Date.parse('2026-10-18T12:00:00.000Z')

  it('telt een account dat net is aangemaakt', () => {
    expect(isNieuweAanmelding({ created_at: '2026-10-18T11:59:59.400Z' }, nu)).toBe(true)
  })

  it('telt een bestaande leerling die opnieuw inlogt niet', () => {
    expect(isNieuweAanmelding({ created_at: '2026-09-01T08:15:00.000Z' }, nu)).toBe(false)
    expect(isNieuweAanmelding({ created_at: '2026-10-18T11:58:00.000Z' }, nu)).toBe(false)
  })

  it('laat een klok die een paar seconden voorloopt toe', () => {
    expect(isNieuweAanmelding({ created_at: '2026-10-18T12:00:03.000Z' }, nu)).toBe(true)
  })

  it('telt niets bij een ontbrekende of onleesbare datum', () => {
    expect(isNieuweAanmelding({}, nu)).toBe(false)
    expect(isNieuweAanmelding({ created_at: null }, nu)).toBe(false)
    expect(isNieuweAanmelding({ created_at: 'gisteren' }, nu)).toBe(false)
  })
})

describe('gebruikersnaamBestemming', () => {
  it('neemt alleen een oefenpad mee', () => {
    expect(gebruikersnaamBestemming('/dashboard', '')).toBe('/nl/gebruikersnaam')
    expect(
      gebruikersnaamBestemming('/oefenen', '?chapter=h2&topic=h2_termsgewijs'),
    ).toBe('/nl/gebruikersnaam?naar=%2Foefenen%3Fchapter%3Dh2%26topic%3Dh2_termsgewijs')
    expect(gebruikersnaamBestemming('/inloggen', '?naar=%2Foefenen')).toBe(
      '/nl/gebruikersnaam?naar=%2Foefenen',
    )
  })
})
