import { describe, expect, it } from 'vitest'

import {
  answersMatch,
  MASTERY_THRESHOLD,
  progressAfterCorrect,
  progressAfterIncorrect,
} from './engine'

// =====================================================================
// Nakijken: wanneer telt een antwoord als goed?
// =====================================================================
describe('answersMatch', () => {
  it('rekent een exact gelijk antwoord goed', () => {
    expect(answersMatch('12x^2', '12x^2')).toBe(true)
  })

  it('negeert spaties en hoofdletters', () => {
    expect(answersMatch('  12 X^2 ', '12x^2')).toBe(true)
  })

  it('rekent een weggelaten maalteken goed', () => {
    expect(answersMatch('3*x', '3x')).toBe(true)
    expect(answersMatch('3·x', '3x')).toBe(true)
  })

  it('rekent haakjes om een simpele exponent goed', () => {
    expect(answersMatch('x^(-1)', 'x^-1')).toBe(true)
    expect(answersMatch('e^(x)', 'e^x')).toBe(true)
  })

  it('laat haakjes om een samengestelde exponent staan', () => {
    // e^(x+1) is iets anders dan e^x + 1; dat mag niet samenvallen.
    expect(answersMatch('e^(x+1)', 'e^x+1')).toBe(false)
  })

  it('rekent x^1 gelijk aan x', () => {
    expect(answersMatch('5x^1', '5x')).toBe(true)
  })

  it('rekent het lange minteken als gewoon minteken', () => {
    expect(answersMatch('3x−2', '3x-2')).toBe(true)
  })

  it('rekent +- als minteken', () => {
    expect(answersMatch('3x+-2', '3x-2')).toBe(true)
  })

  it('rekent een alternatieve schrijfwijze uit de vraag goed', () => {
    expect(answersMatch('1/(2sqrt(x))', '0.5x^(-1/2)', ['1/(2sqrt(x))'])).toBe(
      true,
    )
  })

  it('rekent een fout antwoord fout', () => {
    expect(answersMatch('2x', '3x')).toBe(false)
    expect(answersMatch('', '3x')).toBe(false)
  })
})

// =====================================================================
// Voortgang: wanneer gaat de reeks omhoog en wanneer is iets beheerst?
// =====================================================================
describe('progressAfterCorrect', () => {
  it('zet de reeks één omhoog bij een goed antwoord', () => {
    expect(progressAfterCorrect(0).correct_streak).toBe(1)
    expect(progressAfterCorrect(1).correct_streak).toBe(2)
  })

  it('is nog niet beheerst onder de drempel', () => {
    expect(progressAfterCorrect(0)).toMatchObject({
      status: 'in_progress',
      mastered: false,
    })
    expect(progressAfterCorrect(1)).toMatchObject({
      status: 'in_progress',
      mastered: false,
    })
  })

  it('is beheerst bij drie goed achter elkaar', () => {
    expect(progressAfterCorrect(MASTERY_THRESHOLD - 1)).toEqual({
      correct_streak: 3,
      status: 'mastered',
      mastered: true,
    })
  })

  it('blijft beheerst na nog een goed antwoord', () => {
    expect(progressAfterCorrect(MASTERY_THRESHOLD)).toMatchObject({
      correct_streak: 4,
      status: 'mastered',
      mastered: true,
    })
  })
})

describe('progressAfterIncorrect', () => {
  it('zet de reeks terug op 0 bij een fout antwoord', () => {
    expect(progressAfterIncorrect('in_progress', 2)).toEqual({
      correct_streak: 0,
      status: 'in_progress',
    })
  })

  it('zet een reeks die nog op 0 staat niet verder omlaag', () => {
    expect(progressAfterIncorrect('in_progress', 0)).toEqual({
      correct_streak: 0,
      status: 'in_progress',
    })
  })

  it('laat een cluster dat al beheerst is beheerst', () => {
    // Eén misser tijdens het herhalen mag "beheerst" niet afpakken; de reeks
    // blijft staan, zodat een volgend goed antwoord niet terugvalt naar 1.
    expect(progressAfterIncorrect('mastered', MASTERY_THRESHOLD)).toEqual({
      correct_streak: MASTERY_THRESHOLD,
      status: 'mastered',
    })
    expect(
      progressAfterCorrect(
        progressAfterIncorrect('mastered', MASTERY_THRESHOLD).correct_streak,
      ),
    ).toMatchObject({ status: 'mastered', mastered: true })
  })

  it('zet een cluster dat nog op slot stond op in_progress', () => {
    expect(progressAfterIncorrect('locked', 0)).toEqual({
      correct_streak: 0,
      status: 'in_progress',
    })
  })
})
