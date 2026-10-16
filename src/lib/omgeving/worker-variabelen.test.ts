import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import {
  ontbrekendeGeheimen,
  seintjeOntbreekt,
  verplichteRuntimeGeheimen,
} from './worker-variabelen'

describe('worker-variabelen', () => {
  it('noemt de geheimen van het seintje bij een nieuwe gebruiker', () => {
    const namen = verplichteRuntimeGeheimen()
    expect(namen).toContain('NOTIFY_EMAIL')
    expect(namen).toContain('RESEND_API_KEY')
    expect(namen).toContain('WEBHOOK_SECRET')
  })

  it('meldt alleen namen die op de Worker ontbreken', () => {
    const aanwezig = verplichteRuntimeGeheimen().filter(
      (naam) => naam !== 'NOTIFY_EMAIL',
    )
    expect(ontbrekendeGeheimen(aanwezig)).toEqual(['NOTIFY_EMAIL'])
    expect(ontbrekendeGeheimen(verplichteRuntimeGeheimen())).toEqual([])
  })

  it('ziet een leeg seintje, ook als de regel alleen spaties is', () => {
    expect(
      seintjeOntbreekt({ NOTIFY_EMAIL: '  ', RESEND_API_KEY: 're_nep' }),
    ).toEqual(['NOTIFY_EMAIL'])
    expect(
      seintjeOntbreekt({
        NOTIFY_EMAIL: 'beheer@example.test',
        RESEND_API_KEY: 're_nep',
      }),
    ).toEqual([])
  })

  it('staat met dezelfde namen in de uitleg', () => {
    const uitleg = readFileSync('docs/omgeving.md', 'utf8')
    for (const naam of verplichteRuntimeGeheimen()) {
      expect(uitleg).toContain(naam)
    }
  })
})
