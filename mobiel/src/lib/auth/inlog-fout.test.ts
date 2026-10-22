import { describe, expect, it } from 'vitest'

import { inlogFoutSleutel } from './inlog-fout'

describe('inlogFoutSleutel', () => {
  it('herkent een onjuiste combinatie van e-mail en wachtwoord', () => {
    expect(inlogFoutSleutel('Invalid login credentials')).toBe('errorInvalidCredentials')
  })

  it('herkent een niet-bevestigd e-mailadres, los van hoofdletters', () => {
    expect(inlogFoutSleutel('Email not confirmed')).toBe('errorUnconfirmed')
    expect(inlogFoutSleutel('email NOT confirmed')).toBe('errorUnconfirmed')
  })

  it('valt terug op de algemene melding bij een onbekende foutmelding', () => {
    expect(inlogFoutSleutel('Something unexpected happened')).toBe('errorGeneric')
  })
})
