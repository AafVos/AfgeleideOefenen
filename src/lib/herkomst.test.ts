import { describe, expect, it } from 'vitest'

import { leesHerkomst } from './herkomst'

describe('leesHerkomst', () => {
  it('bewaart de toegestane codes', () => {
    expect(leesHerkomst('docent')).toBe('docent')
    expect(leesHerkomst('youtube')).toBe('youtube')
    expect(leesHerkomst('klas')).toBe('klas')
    expect(leesHerkomst('forum')).toBe('forum')
    expect(leesHerkomst('proberen')).toBe('proberen')
    expect(leesHerkomst('proefsom')).toBe('proefsom')
  })

  it('neemt hoofdletters en spaties weg', () => {
    expect(leesHerkomst('  Docent  ')).toBe('docent')
  })

  it('negeert een onbekende code', () => {
    expect(leesHerkomst('reclame')).toBeNull()
    expect(leesHerkomst('docent-extra')).toBeNull()
    expect(leesHerkomst('')).toBeNull()
    expect(leesHerkomst('   ')).toBeNull()
  })

  it('negeert een naam of een volledig adres', () => {
    expect(leesHerkomst('Sanne de Vries')).toBeNull()
    expect(leesHerkomst('https://school.nl/klas/3b?naam=Sanne')).toBeNull()
  })

  it('pakt alleen de eerste waarde als de link de code dubbel meestuurt', () => {
    expect(leesHerkomst(['youtube', 'docent'])).toBe('youtube')
    expect(leesHerkomst(['onzin', 'docent'])).toBeNull()
  })

  it('negeert iets dat geen tekst is', () => {
    expect(leesHerkomst(null)).toBeNull()
    expect(leesHerkomst(undefined)).toBeNull()
    expect(leesHerkomst(12)).toBeNull()
  })
})
