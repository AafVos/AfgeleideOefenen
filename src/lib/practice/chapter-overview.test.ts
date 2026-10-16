import { describe, expect, it } from 'vitest'

import {
  blokkenVanParagrafen,
  clusterIdsOpVolgorde,
  naarTegels,
  type VraagVoorTegel,
} from './chapter-overview'

function vraag(deel: Partial<VraagVoorTegel> & Pick<VraagVoorTegel, 'id' | 'cluster_id'>): VraagVoorTegel {
  return {
    difficulty: 1,
    order_index: 1,
    latex_body: '$f(x) = x$',
    answer_prefix: null,
    source_label: null,
    source_url: null,
    ...deel,
  }
}

describe('clusterIdsOpVolgorde', () => {
  it('houdt de volgorde van hoofdstuk, onderwerp en soort som aan', () => {
    const ids = clusterIdsOpVolgorde(
      [{ id: 'h2' }, { id: 'h6' }],
      [
        { id: 't2', chapter_id: 'h2' },
        { id: 't6', chapter_id: 'h6' },
      ],
      [
        { id: 'c2a', topic_id: 't2' },
        { id: 'c2b', topic_id: 't2' },
        { id: 'c6', topic_id: 't6' },
      ],
    )
    expect(ids).toEqual(['c2a', 'c2b', 'c6'])
  })
})

describe('naarTegels', () => {
  it('sorteert op soort som, dan moeilijkheid, dan volgorde', () => {
    const tegels = naarTegels(
      [
        vraag({ id: 'laat', cluster_id: 'c1', difficulty: 2, order_index: 1 }),
        vraag({ id: 'eerst', cluster_id: 'c1', difficulty: 1, order_index: 2 }),
        vraag({ id: 'ander', cluster_id: 'c2', difficulty: 1, order_index: 1 }),
        vraag({ id: 'buiten', cluster_id: 'c9', difficulty: 1, order_index: 1 }),
      ],
      ['c2', 'c1'],
      new Map([['eerst', true]]),
    )

    expect(tegels.map((tegel) => tegel.questionId)).toEqual(['ander', 'eerst', 'laat'])
    expect(tegels.map((tegel) => tegel.ordinal)).toEqual([1, 2, 3])
    expect(tegels.find((tegel) => tegel.questionId === 'eerst')?.lastCorrect).toBe(true)
    expect(tegels.find((tegel) => tegel.questionId === 'laat')?.lastCorrect).toBeNull()
  })

  it('geeft de bron van een examenvraag door aan de tegel', () => {
    const tegels = naarTegels(
      [
        vraag({
          id: 'examen',
          cluster_id: 'c1',
          source_label: 'CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6',
          source_url: 'https://www.examenblad.nl/2024/vwo/documenten/cse-1/vw-1025-a-24-1-o',
        }),
      ],
      ['c1'],
      new Map(),
    )
    expect(tegels[0]?.sourceLabel).toBe('CE vwo wiskunde B 2024 · tijdvak 1 · vraag 6')
    expect(tegels[0]?.sourceUrl).toContain('examenblad.nl')
  })
})

describe('blokkenVanParagrafen', () => {
  it('laat blokken van een paragraaf die niet meekomt weg', () => {
    const blokken = blokkenVanParagrafen(
      [
        { id: 'blijft', paragraph_id: 'p24' },
        { id: 'weg', paragraph_id: 'p25' },
      ],
      [{ id: 'p24' }],
    )
    expect(blokken.map((blok) => blok.id)).toEqual(['blijft'])
  })
})
