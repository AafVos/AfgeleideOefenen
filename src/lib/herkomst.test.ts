import { describe, expect, it } from 'vitest'

import { herkomstVanUtmSource, leesHerkomst } from './herkomst'

describe('leesHerkomst', () => {
  it('bewaart de toegestane codes', () => {
    expect(leesHerkomst('docent')).toBe('docent')
    expect(leesHerkomst('youtube')).toBe('youtube')
    expect(leesHerkomst('klas')).toBe('klas')
    expect(leesHerkomst('forum')).toBe('forum')
    expect(leesHerkomst('proberen')).toBe('proberen')
    expect(leesHerkomst('proefsom')).toBe('proefsom')
    expect(leesHerkomst('chatgpt')).toBe('chatgpt')
    expect(leesHerkomst('zoeken')).toBe('zoeken')
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

describe('herkomstVanUtmSource', () => {
  it('vertaalt chatgpt.com naar de code chatgpt', () => {
    expect(herkomstVanUtmSource('chatgpt.com')).toBe('chatgpt')
    expect(herkomstVanUtmSource('chat.openai.com')).toBe('chatgpt')
  })

  it('vertaalt bekende zoekmachines naar de code zoeken', () => {
    expect(herkomstVanUtmSource('google')).toBe('zoeken')
    expect(herkomstVanUtmSource('bing.com')).toBe('zoeken')
    expect(herkomstVanUtmSource('duckduckgo')).toBe('zoeken')
  })

  it('neemt hoofdletters en spaties weg', () => {
    expect(herkomstVanUtmSource('  ChatGPT.com  ')).toBe('chatgpt')
  })

  it('negeert een onbekende bron of iets dat geen tekst is', () => {
    expect(herkomstVanUtmSource('nieuwsbrief')).toBeNull()
    expect(herkomstVanUtmSource(null)).toBeNull()
    expect(herkomstVanUtmSource(undefined)).toBeNull()
  })

  it('pakt alleen de eerste waarde als de link de bron dubbel meestuurt', () => {
    expect(herkomstVanUtmSource(['chatgpt.com', 'google'])).toBe('chatgpt')
  })
})
