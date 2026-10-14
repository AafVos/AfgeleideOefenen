import { describe, expect, it } from 'vitest'

import {
  hrefMetOefenpad,
  inlogAdres,
  oefenpadUitAdres,
  padMetTaal,
  resetVolgende,
  veiligOefenpad,
} from './oefenpad'

describe('veiligOefenpad', () => {
  it('houdt een oefenpad met hoofdstuk en onderwerp', () => {
    expect(veiligOefenpad('/oefenen?chapter=h2&topic=h2_termsgewijs')).toBe(
      '/oefenen?chapter=h2&topic=h2_termsgewijs',
    )
  })

  it('haalt de taalcode eraf', () => {
    expect(veiligOefenpad('/nl/oefenen?chapter=h2&topic=h2_termsgewijs')).toBe(
      '/oefenen?chapter=h2&topic=h2_termsgewijs',
    )
  })

  it('weigert een ander pad, een cookie-achtige tekst en een adres buiten de site', () => {
    expect(veiligOefenpad('/dashboard')).toBeNull()
    expect(veiligOefenpad('/nl/dashboard')).toBeNull()
    expect(veiligOefenpad('/nl/inloggen')).toBeNull()
    expect(veiligOefenpad('/wachtwoord-opnieuw')).toBeNull()
    expect(veiligOefenpad('https://evil.example/oefenen')).toBeNull()
    expect(veiligOefenpad('//evil.example/oefenen')).toBeNull()
    expect(veiligOefenpad('/oefenen/../dashboard')).toBeNull()
    expect(veiligOefenpad('/oefenen/../../admin')).toBeNull()
    expect(veiligOefenpad('/\\oefenen')).toBeNull()
    expect(veiligOefenpad('/oefenenfoo')).toBeNull()
    expect(veiligOefenpad('oefenen?topic=h2')).toBeNull()
    expect(veiligOefenpad(null)).toBeNull()
    expect(veiligOefenpad(42)).toBeNull()
    expect(veiligOefenpad('')).toBeNull()
  })

  it('weigert stuurtekens en een veel te lang pad', () => {
    expect(veiligOefenpad('/oefenen?topic=h2\n')).toBeNull()
    expect(veiligOefenpad(`/oefenen?topic=${'a'.repeat(500)}`)).toBeNull()
  })
})

describe('padMetTaal', () => {
  it('zet /nl ervoor en laat een pad dat het al heeft met rust', () => {
    expect(padMetTaal('/oefenen?q=1')).toBe('/nl/oefenen?q=1')
    expect(padMetTaal('/nl/dashboard')).toBe('/nl/dashboard')
  })
})

describe('hrefMetOefenpad', () => {
  it('hangt het pad als één parameter aan de link', () => {
    expect(hrefMetOefenpad('/registreren', '/oefenen?chapter=h2&topic=h2_termsgewijs')).toBe(
      '/registreren?naar=%2Foefenen%3Fchapter%3Dh2%26topic%3Dh2_termsgewijs',
    )
  })

  it('laat de link zoals hij is als er geen pad is', () => {
    expect(hrefMetOefenpad('/inloggen', null)).toBe('/inloggen')
    expect(hrefMetOefenpad('/wachtwoord-vergeten', null)).toBe('/wachtwoord-vergeten')
  })

  it('hangt het pad ook aan wachtwoord vergeten', () => {
    expect(hrefMetOefenpad('/wachtwoord-vergeten', '/oefenen?chapter=h2&topic=h2_termsgewijs')).toBe(
      '/wachtwoord-vergeten?naar=%2Foefenen%3Fchapter%3Dh2%26topic%3Dh2_termsgewijs',
    )
  })
})

const PAD = '/oefenen?chapter=h2&topic=h2_termsgewijs'

describe('resetVolgende', () => {
  it('zet het oefenpad gecodeerd in de resetlink, zodat een & blijft staan', () => {
    const next = resetVolgende(PAD)
    expect(next).toBe(
      '/wachtwoord-opnieuw?naar=%2Foefenen%3Fchapter%3Dh2%26topic%3Dh2_termsgewijs',
    )

    const callback = new URL(
      `https://afgeleideoefenen.nl/auth/callback?next=${encodeURIComponent(next)}`,
    )
    const terug = callback.searchParams.get('next')
    const landing = new URL(`https://afgeleideoefenen.nl/nl${terug}`)
    expect(landing.pathname).toBe('/nl/wachtwoord-opnieuw')
    expect(landing.searchParams.get('naar')).toBe(PAD)
    expect(oefenpadUitAdres(terug)).toBe(PAD)
  })

  it('laat een ander pad weg', () => {
    expect(resetVolgende('/dashboard')).toBe('/wachtwoord-opnieuw')
    expect(resetVolgende('https://evil.example/oefenen')).toBe('/wachtwoord-opnieuw')
    expect(resetVolgende(null)).toBe('/wachtwoord-opnieuw')
  })
})

describe('oefenpadUitAdres', () => {
  it('leest het pad uit de resetpagina en uit het pad zelf', () => {
    expect(oefenpadUitAdres(`/wachtwoord-opnieuw?naar=${encodeURIComponent(PAD)}`)).toBe(PAD)
    expect(oefenpadUitAdres(PAD)).toBe(PAD)
  })

  it('weigert een adres buiten de site', () => {
    expect(oefenpadUitAdres('/wachtwoord-opnieuw?naar=https://evil.example/oefenen')).toBeNull()
    expect(oefenpadUitAdres('//evil.example/oefenen')).toBeNull()
    expect(oefenpadUitAdres('/wachtwoord-opnieuw')).toBeNull()
  })
})

describe('inlogAdres', () => {
  it('bewaart alleen een oefenpad', () => {
    expect(inlogAdres('/oefenen', '?chapter=h2&topic=h2_termsgewijs')).toBe(
      '/nl/inloggen?naar=%2Foefenen%3Fchapter%3Dh2%26topic%3Dh2_termsgewijs',
    )
  })

  it('bewaart het dashboard, de instellingen en een adres buiten de site niet', () => {
    expect(inlogAdres('/dashboard', '')).toBe('/nl/inloggen')
    expect(inlogAdres('/instellingen', '?x=1')).toBe('/nl/inloggen')
    expect(inlogAdres('/oefenen', '')).toBe('/nl/inloggen?naar=%2Foefenen')
  })
})
