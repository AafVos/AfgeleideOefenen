import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { answersMatch } from './engine'

/**
 * Hoofdstuk 15, "Grafieken die elkaar raken", vraag 7:
 * f(x) = ln(x) en g(x) = 2x + p, bereken p exact zodat de grafieken raken.
 *
 * Het antwoord staat als -1-ln(2). Migratie 0079 zet de omgedraaide
 * volgorde -ln(2)-1 erbij: hetzelfde getal, en de vorm die je overhoudt als
 * je -ln(2) = 1 + p herleidt.
 */

const MIGRATIE = 'supabase/migrations/0079_h15_raakvraag_omgedraaide_schrijfwijze.sql'

const ANTWOORD = '-1-ln(2)'

/** Wat er vóór migratie 0079 aan extra schrijfwijzen stond (migratie 0041). */
const BESTAAND = [
  '-1-ln2',
  '-(1+ln(2))',
  '-(1+ln2)',
  '-(ln(2)+1)',
  '-(ln2+1)',
  'p=-1-ln(2)',
  'p=-1-ln2',
  'p=-(1+ln(2))',
  'p=-(1+ln2)',
  'p=-(ln(2)+1)',
  'p=-(ln2+1)',
]

/** Wat migratie 0079 erbij zet. */
const OMGEDRAAID = ['-ln(2)-1', '-ln2-1', 'p=-ln(2)-1', 'p=-ln2-1']

const NA_MIGRATIE = [...BESTAAND, ...OMGEDRAAID]

describe('omgedraaide schrijfwijze bij de raakvraag met ln (migratie 0079)', () => {
  it('p = -1 - ln(2) laat de grafieken echt raken', () => {
    const p = -1 - Math.log(2)
    const f = (x: number) => Math.log(x)
    const g = (x: number) => 2 * x + p

    // f'(x) = 1/x en g'(x) = 2 geven x = 1/2 als raakpunt.
    const raakpunt = 1 / 2
    expect(1 / raakpunt).toBeCloseTo(2, 12)
    expect(f(raakpunt)).toBeCloseTo(g(raakpunt), 12)

    // Raken, niet snijden: ln(x) blijft er verder onder.
    for (const x of [0.05, 0.2, 0.4, 0.6, 1, 3, 20]) {
      expect(f(x), `x = ${x}`).toBeLessThan(g(x))
    }

    // En dat is precies -ln(2) - 1: dezelfde waarde, andere volgorde.
    expect(-Math.log(2) - 1).toBeCloseTo(p, 12)
  })

  it('zonder de migratie werd de omgedraaide volgorde fout gerekend', () => {
    // Dit is waarom de migratie nodig is: de nakijkcode rekent een antwoord
    // met ln er niet uit, maar vergelijkt de tekst na normaliseren.
    for (const vorm of OMGEDRAAID) {
      expect(answersMatch(vorm, ANTWOORD, BESTAAND), vorm).toBe(false)
    }
  })

  it('met de migratie is de omgedraaide volgorde goed', () => {
    for (const vorm of OMGEDRAAID) {
      expect(answersMatch(vorm, ANTWOORD, NA_MIGRATIE), vorm).toBe(true)
    }
    // Met spaties of in hoofdletters getypt mag ook.
    for (const vorm of ['-ln(2) - 1', ' -LN(2)-1 ', 'p = -ln(2) - 1', '-ln 2 - 1']) {
      expect(answersMatch(vorm, ANTWOORD, NA_MIGRATIE), vorm).toBe(true)
    }
  })

  it('de schrijfwijzen die al goed waren, blijven goed', () => {
    expect(answersMatch(ANTWOORD, ANTWOORD, NA_MIGRATIE)).toBe(true)
    for (const vorm of BESTAAND) {
      expect(answersMatch(vorm, ANTWOORD, NA_MIGRATIE), vorm).toBe(true)
    }
  })

  it('een fout antwoord blijft fout', () => {
    for (const vorm of [
      'ln(2)-1',
      '1-ln(2)',
      '-1+ln(2)',
      'ln(2)+1',
      '-1',
      '-ln(2)',
      '-ln(2)-2',
      '',
    ]) {
      expect(answersMatch(vorm, ANTWOORD, NA_MIGRATIE), vorm).toBe(false)
    }
  })

  it('de migratie zet precies deze schrijfwijzen erbij', () => {
    const sql = readFileSync(MIGRATIE, 'utf8')
    OMGEDRAAID.forEach((vorm, i) => {
      const tag = `$v${i + 1}$`
      expect(sql, vorm).toContain(`${tag}${vorm}${tag}`)
    })
    // De lijst staat één keer in de migratie, en wordt daar hergebruikt.
    expect(sql.match(/\$v1\$/g), 'openen en sluiten van de eerste vorm').toHaveLength(2)
    // Alleen toevoegen: niets wordt weggehaald of overschreven.
    expect(sql).not.toMatch(/\b(DELETE|DROP|TRUNCATE)\b/)
  })
})
