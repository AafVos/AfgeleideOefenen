import { describe, expect, it } from 'vitest'

import { API_BASE_URL, SITE_URL } from './site'

describe('site', () => {
  it('gebruikt het www-adres als standaard, want zonder www geeft de site een 301 en wordt een POST een GET', () => {
    expect(SITE_URL).toMatch(/^https:\/\/www\./)
  })

  it('bouwt de standaard API-basis op het www-adres, zodat nakijken/indeling/opgave/voortgang niet via een 301 lopen', () => {
    if (!process.env.EXPO_PUBLIC_API_BASE_URL?.trim()) {
      expect(API_BASE_URL).toMatch(/^https:\/\/www\./)
    }
  })
})
