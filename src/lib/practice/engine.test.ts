import { describe, expect, it } from 'vitest'

import {
  answersMatch,
  cleanTimeSpentSec,
  MASTERY_THRESHOLD,
  MAX_TIME_SPENT_SEC,
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

  it('rekent een maal-teken tussen twee cijfers niet als niets', () => {
    expect(answersMatch('2*4(4x-3)', '24(4x-3)')).toBe(false)
    expect(answersMatch('2·4(4x-3)', '24(4x-3)')).toBe(false)
    expect(answersMatch('2 \\cdot 4(4x - 3)', '24(4x-3)')).toBe(false)
    expect(answersMatch('22(2x-5)', '2 \\cdot 2(2x - 5)')).toBe(false)
    expect(answersMatch('2*4(4x-3)', '2·4(4x-3)')).toBe(true)
    expect(answersMatch('2*2(2x-5)', '2 \\cdot 2(2x - 5)')).toBe(true)
    expect(answersMatch('2 \\cdot 2(2x - 5)', '2·2(2x-5)')).toBe(true)
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

  it('AFG-640: \\cdot na een sluithaakje werd nooit omgezet, dus een goed antwoord telde fout', () => {
    // h2_productregel/twee_polynomen vraag 2: f(x) = (2 - 3x^2)(2 + 7x).
    // Vóór de migratie stond dit als `answer`, zonder answer_alternatives.
    const oudeData = '-6x(2 + 7x) + (2 - 3x^2) \\cdot 7'
    // Een cijfer vóór \cdot is niet genoeg: hier staat een sluithaakje vóór,
    // dus \cdot blijft letterlijk staan en een leerling kan nooit winnen.
    expect(answersMatch('-63x^2 - 12x + 14', oudeData, [])).toBe(false)
    expect(answersMatch('-6x(2+7x)+(2-3x^2)*7', oudeData, [])).toBe(false)

    // Na de migratie: `answer` is typeklaar en de vereenvoudigde vorm en de
    // vorm met een gewone * staan als answer_alternatives.
    const nieuwAntwoord = '-6x(2 + 7x) + 7(2 - 3x^2)'
    const nieuweAlternatieven = [
      '-6x(2 + 7x) + (2 - 3x^2) * 7',
      '-63x^2 - 12x + 14',
    ]
    expect(
      answersMatch('-63x^2 - 12x + 14', nieuwAntwoord, nieuweAlternatieven),
    ).toBe(true)
    expect(
      answersMatch(
        '-6x(2+7x)+(2-3x^2)*7',
        nieuwAntwoord,
        nieuweAlternatieven,
      ),
    ).toBe(true)
  })

  it('AFG-640: zelfde probleem en oplossing bij vraag 5 van twee_polynomen', () => {
    // f(x) = (5x^5 - 3)(3x - 2)
    const oudeData = '25x^4(3x - 2) + (5x^5 - 3) \\cdot 3'
    expect(answersMatch('90x^5 - 50x^4 - 9', oudeData, [])).toBe(false)
    expect(answersMatch('25x^4(3x-2)+(5x^5-3)*3', oudeData, [])).toBe(false)

    const nieuwAntwoord = '25x^4(3x - 2) + 3(5x^5 - 3)'
    const nieuweAlternatieven = [
      '25x^4(3x - 2) + (5x^5 - 3) * 3',
      '90x^5 - 50x^4 - 9',
    ]
    expect(
      answersMatch('90x^5 - 50x^4 - 9', nieuwAntwoord, nieuweAlternatieven),
    ).toBe(true)
    expect(
      answersMatch(
        '25x^4(3x-2)+(5x^5-3)*3',
        nieuwAntwoord,
        nieuweAlternatieven,
      ),
    ).toBe(true)
  })

  it('rekent een fout antwoord fout', () => {
    expect(answersMatch('2x', '3x')).toBe(false)
    expect(answersMatch('', '3x')).toBe(false)
  })

  it('rekent t =, x = en h = hetzelfde als het kale getal', () => {
    expect(answersMatch('2', '2')).toBe(true)
    expect(answersMatch('t = 2', '2')).toBe(true)
    expect(answersMatch('t=2', '2')).toBe(true)
    expect(answersMatch('x = 2', '2')).toBe(true)
    expect(answersMatch('h = 2', '2')).toBe(true)
    expect(answersMatch('T = 2', '2')).toBe(true)
  })

  it('rekent een eenheid achter het getal hetzelfde als het kale getal', () => {
    expect(answersMatch('2 seconden', '2')).toBe(true)
    expect(answersMatch('2 meter', '2')).toBe(true)
    expect(answersMatch('2 liter', '2')).toBe(true)
    expect(answersMatch('2 kilometer', '2')).toBe(true)
    expect(answersMatch('2 centimeter', '2')).toBe(true)
    expect(answersMatch('2 uur', '2')).toBe(true)
    expect(answersMatch('t = 2 seconden', '2')).toBe(true)
  })

  it('rekent snelheid en versnelling met de eenheid erbij goed', () => {
    expect(answersMatch('5 meter per seconde', '5')).toBe(true)
    expect(answersMatch('5 meters per seconde', '5')).toBe(true)
    expect(answersMatch('5 m/s', '5')).toBe(true)
    expect(answersMatch('5 M/S', '5')).toBe(true)
    expect(answersMatch('5 m / s', '5')).toBe(true)
    expect(answersMatch('5 meter/seconde', '5')).toBe(true)
    expect(answersMatch('5 meter per seconde per seconde', '5')).toBe(true)
    expect(answersMatch('5 m/s^2', '5')).toBe(true)
    expect(answersMatch('5 m/s²', '5')).toBe(true)
    expect(answersMatch('t = 5 meter per seconde', '5')).toBe(true)
    expect(answersMatch('2 meter per uur', '2')).toBe(true)
    expect(answersMatch('-4 meter per minuut', '-4')).toBe(true)
    expect(answersMatch('3 graden per minuut', '3')).toBe(true)
  })

  it('rekent euro, gram, dozen en andere eenheden uit de vraag goed', () => {
    expect(answersMatch('12 euro', '12')).toBe(true)
    expect(answersMatch('32 gram', '32')).toBe(true)
    expect(answersMatch('32 grammen', '32')).toBe(true)
    expect(answersMatch('1 dozen', '1')).toBe(true)
    expect(answersMatch('1 doos', '1')).toBe(true)
    expect(answersMatch('50 kilo', '50')).toBe(true)
    expect(answersMatch('50 kilogram', '50')).toBe(true)
    expect(answersMatch('4 gram per dag', '4')).toBe(true)
    expect(answersMatch('4 euro per stuk', '4')).toBe(true)
    expect(answersMatch('15 graden Celsius', '15')).toBe(true)
    expect(answersMatch('6 dagen', '6')).toBe(true)
    expect(answersMatch('2 weken', '2')).toBe(true)
    expect(answersMatch('24/e^2 stuks', '24/e^2')).toBe(true)
    expect(answersMatch('20/e liter', '20/e')).toBe(true)
    expect(answersMatch('3/e gram per dag', '3/e')).toBe(true)
    expect(answersMatch('15/e milligram', '15/e')).toBe(true)
    expect(answersMatch('15/e milligrammen', '15/e')).toBe(true)
    expect(answersMatch('1 milligram per liter', '1')).toBe(true)
    expect(answersMatch('1 milligram/liter', '1')).toBe(true)
    expect(answersMatch('1 milligram per kubieke meter', '1')).toBe(true)
    expect(answersMatch('t = 1 milligram per kubieke meter', '1')).toBe(true)
    expect(answersMatch('6/e milligram per liter', '6/e')).toBe(true)
  })

  it('rekent een fout getal fout, ook met voorvoegsel of eenheid', () => {
    expect(answersMatch('3', '2')).toBe(false)
    expect(answersMatch('t = 3', '2')).toBe(false)
    expect(answersMatch('3 seconden', '2')).toBe(false)
    expect(answersMatch('h = 4', '2')).toBe(false)
    expect(answersMatch('6 meter per seconde', '5')).toBe(false)
    expect(answersMatch('6 m/s', '5')).toBe(false)
    expect(answersMatch('13 euro', '12')).toBe(false)
    expect(answersMatch('4 meter per seconde per seconde', '5')).toBe(false)
    expect(answersMatch('16/e milligram', '15/e')).toBe(false)
    expect(answersMatch('2 milligram per liter', '1')).toBe(false)
    expect(answersMatch('2 milligram per kubieke meter', '1')).toBe(false)
  })

  it('rekent 0,33 niet gelijk aan 1/3', () => {
    expect(answersMatch('0,33', '1/3')).toBe(false)
    expect(answersMatch('0.33', '1/3')).toBe(false)
  })

  it('rekent een komma en een punt als hetzelfde getal', () => {
    expect(answersMatch('0,2', '0.2')).toBe(true)
    expect(answersMatch('0.2', '0,2')).toBe(true)
    expect(answersMatch('1,8x^2 - 2,6x', '1.8x^2 - 2.6x')).toBe(true)
    expect(answersMatch('1.8x^2 - 2.6x', '1,8x^2 - 2,6x')).toBe(true)
    expect(answersMatch('1,8x^2 - 2,7x', '1,8x^2 - 2,6x')).toBe(false)
  })

  // De breukknop zet haakjes neer. Die vorm is niet vanzelf gelijk aan 3/2.
  it('rekent de breukknop en een precies kommagetal goed als ze erbij staan', () => {
    const anderhalf = ['(3)/(2)', '(3)/2', '1,5', '1.5']
    const tweederde = ['(2)/(3)', '(2)/3']
    const tweeenhalf = ['(5)/(2)', '(5)/2', '2,5', '2.5']

    expect(answersMatch('(3)/(2)', '3/2')).toBe(false)
    expect(answersMatch('(3)/(2)', '3/2', anderhalf)).toBe(true)
    expect(answersMatch('(3)/2', '3/2', anderhalf)).toBe(true)
    expect(answersMatch('1,5', '3/2', anderhalf)).toBe(true)
    expect(answersMatch('1.5', '3/2', anderhalf)).toBe(true)

    expect(answersMatch('(2)/(3)', '2/3', tweederde)).toBe(true)
    expect(answersMatch('(2)/3', '2/3', tweederde)).toBe(true)
    expect(answersMatch('0,67', '2/3', tweederde)).toBe(false)
    expect(answersMatch('0.67', '2/3', tweederde)).toBe(false)

    expect(answersMatch('(5)/(2)', '5/2', tweeenhalf)).toBe(true)
    expect(answersMatch('(5)/2', '5/2', tweeenhalf)).toBe(true)
    expect(answersMatch('2,5', '5/2', tweeenhalf)).toBe(true)
    expect(answersMatch('2.5', '5/2', tweeenhalf)).toBe(true)
  })

  it('haalt geen langere formule of losse letter weg', () => {
    expect(answersMatch("f'(x) = 2", '2')).toBe(false)
    expect(answersMatch('2x', '2')).toBe(false)
    expect(answersMatch('2m', '2')).toBe(false)
    expect(answersMatch('5ms', '5')).toBe(false)
    expect(answersMatch('parameter', 'para')).toBe(false)
    expect(answersMatch('2x meter', '2x')).toBe(false)
  })

  // Raaklijn: y = 2x - 1, y=2x-1, y = -1 + 2x en 2x - 1 zijn dezelfde lijn.
  // Dit gaat zonder de lijst van andere schrijfwijzen en zonder de AI-controle.
  it('rekent een lijn hetzelfde, ook met y = en de termen andersom', () => {
    expect(answersMatch('y = 2x - 1', '2x - 1')).toBe(true)
    expect(answersMatch('y=2x-1', '2x - 1')).toBe(true)
    expect(answersMatch('y = -1 + 2x', '2x - 1')).toBe(true)
    expect(answersMatch('2x - 1', '2x - 1')).toBe(true)
    expect(answersMatch('-1 + 2x', '2x - 1')).toBe(true)
    expect(answersMatch('2x + -1', '2x - 1')).toBe(true)
    expect(answersMatch('Y = 2X - 1', '2x - 1')).toBe(true)
    expect(answersMatch('3 - 3x', '-3x + 3')).toBe(true)
    expect(answersMatch('y = 3 - 3x', '-3x + 3')).toBe(true)
    expect(answersMatch('-1 - 3x', '-3x - 1')).toBe(true)
    expect(answersMatch('1 + x', 'x + 1')).toBe(true)
    expect(answersMatch('y = 1 + x', 'x + 1')).toBe(true)
    expect(answersMatch('pi - x', '-x + pi')).toBe(true)
    expect(answersMatch('y = \\pi - x', '-x + pi')).toBe(true)
    expect(answersMatch('1x - 1', 'x - 1')).toBe(true)
    expect(answersMatch('2x + 3x - 1', '5x - 1')).toBe(true)
    expect(answersMatch('x/2 + 1', '1 + (1/2)x')).toBe(true)
    expect(answersMatch('y = (1)/(2)x + 1', 'x/2 + 1')).toBe(true)
    expect(answersMatch('(5/2)x - 1', '2,5x - 1')).toBe(true)
    expect(answersMatch('2,5x - 1', '2.5x - 1')).toBe(true)
    expect(answersMatch('2x/3 + 1', '1 + (2)/(3)x')).toBe(true)
    expect(answersMatch('(-1) + 2x', '2x - 1')).toBe(true)
    expect(answersMatch('y = 2', '2')).toBe(true)
  })

  it('rekent een andere lijn of een macht fout', () => {
    expect(answersMatch('2x + 1', '2x - 1')).toBe(false)
    expect(answersMatch('2x - 2', '2x - 1')).toBe(false)
    expect(answersMatch('x - 1', '2x - 1')).toBe(false)
    expect(answersMatch('y = 3x - 1', '2x - 1')).toBe(false)
    expect(answersMatch('-2x + 1', '2x - 1')).toBe(false)
    expect(answersMatch('1 - 2x', '2x - 1')).toBe(false)
    expect(answersMatch('2x^2 - 1', '2x - 1')).toBe(false)
    expect(answersMatch('2(x - 1)', '2x - 2')).toBe(false)
    expect(answersMatch('0,33x', '(1/3)x')).toBe(false)
    // 5/2x toont de site als een breuk met 2x onder de streep.
    expect(answersMatch('5/2x - 1', '2,5x - 1')).toBe(false)
    expect(answersMatch('y = 2', '2x')).toBe(false)
    expect(answersMatch('y = 2x', '2')).toBe(false)
    expect(answersMatch('', '2x - 1')).toBe(false)
    // 1/2x^2 toont de site als een breuk met 2x^2 onder de streep.
    expect(answersMatch('1/2x^2', '(1/2)x^2')).toBe(false)
    expect(answersMatch('(-x)^2', 'x^2')).toBe(false)
    expect(answersMatch('(-x)^2', '-x^2')).toBe(false)
  })

  // Kromme door de toppen: y = -x^2 + 8 en 8 - x^2 zijn dezelfde formule.
  // Dit gaat zonder een lijst van andere schrijfwijzen.
  it('rekent een veelterm hetzelfde, ook met de termen andersom', () => {
    expect(answersMatch('2 + 3x^2', '3x^2 + 2')).toBe(true)
    expect(answersMatch('y = 8 - x^2', '-x^2 + 8')).toBe(true)
    expect(answersMatch('y=-x^2+8', '-x^2 + 8')).toBe(true)
    expect(answersMatch('-x^2 + 8', '8 - x^2')).toBe(true)
    expect(answersMatch('-1x^2', '-x^2')).toBe(true)
    expect(answersMatch('(-1)x^2', '-x^2')).toBe(true)
    expect(answersMatch('-(x^2)', '-x^2')).toBe(true)
    expect(answersMatch('-2*x^3', '-2x^3')).toBe(true)
    expect(answersMatch('-2x^(3)', '-2x^3')).toBe(true)
    expect(answersMatch('x²', 'x^2')).toBe(true)
    expect(answersMatch('-x³', '-x^3')).toBe(true)
    expect(answersMatch('y = -x⁴', '-x^4')).toBe(true)
    expect(answersMatch('2x^2 + 3x^2', '5x^2')).toBe(true)
    expect(answersMatch('-(1/2)x^3', '-x^3/2')).toBe(true)
    expect(answersMatch('(-1/2)x^3', '-(1/2)x^3')).toBe(true)
    expect(answersMatch('-0,5x^3', '-(1/2)x^3')).toBe(true)
    expect(answersMatch('-0.5x^3', '-x^3/2')).toBe(true)
    expect(answersMatch('-(1)/(2)x^3', '-(1/2)x^3')).toBe(true)
    expect(answersMatch('(-x^3)/2', '-x^3/2')).toBe(true)
    expect(answersMatch('2(x^2)', '2x^2')).toBe(true)
    expect(answersMatch('(3/2)x - (1/2)x^3', '-(1/2)x^3 + (3/2)x')).toBe(true)
    expect(answersMatch('3x/2 - x^3/2', '-(1/2)x^3 + (3/2)x')).toBe(true)
    expect(answersMatch('y = 1,5x - 0,5x^3', '-(1/2)x^3 + (3/2)x')).toBe(true)
    expect(answersMatch('-2x - x^2', '-x^2 - 2x')).toBe(true)
    expect(answersMatch('-(x^2) - 2x', '-x^2 - 2x')).toBe(true)

    expect(answersMatch('-x^2 + 9', '-x^2 + 8')).toBe(false)
    expect(answersMatch('2x^3', '-2x^3')).toBe(false)
    expect(answersMatch('x^2', '-x^2')).toBe(false)
    expect(answersMatch('(1/3)x^3', '-(1/2)x^3')).toBe(false)
    expect(answersMatch('x^4', '-x^4')).toBe(false)
    expect(answersMatch('', '-x^2')).toBe(false)
  })

  // Zes opgaven hadden LaTeX in het antwoordveld. Een leerling typt (1/2) en pi.
  // Die vorm telt goed zonder de AI-controle. De breukknop, (1)/(2), blijft
  // een aparte schrijfwijze: die staat bij de opgave, niet in deze regel.
  it('rekent LaTeX-breuken en pi gelijk aan de gewone typwijze', () => {
    expect(answersMatch('(1/2)cos(x)', '\\tfrac{1}{2}cos(x)')).toBe(true)
    expect(answersMatch('8cos(2x-pi/4)', '8cos(2x - \\tfrac{1}{4}\\pi)')).toBe(true)
    expect(answersMatch('-6sin(3x-pi/2)', '-6sin(3x - \\tfrac{1}{2}\\pi)')).toBe(true)
    expect(answersMatch('-8sin((1/2)(x-1))', '-8sin(\\tfrac{1}{2}(x-1))')).toBe(true)
    expect(answersMatch('15((1/2)x-4)^4', '15(\\tfrac{1}{2}x-4)^4')).toBe(true)
    expect(
      answersMatch('3(x-2)((1/2)x^2-2x)^2', '3(x-2)(\\tfrac{1}{2}x^2-2x)^2'),
    ).toBe(true)

    expect(answersMatch('8cos(2x-(1/4)pi)', '8cos(2x-pi/4)')).toBe(true)
    expect(answersMatch('-6sin(3x-(1/2)pi)', '-6sin(3x-pi/2)')).toBe(true)

    expect(answersMatch('cos(x)', '\\tfrac{1}{2}cos(x)')).toBe(false)
    expect(answersMatch('(1)/(2)cos(x)', '\\tfrac{1}{2}cos(x)')).toBe(false)
    expect(answersMatch('8cos(2x-pi/2)', '8cos(2x - \\tfrac{1}{4}\\pi)')).toBe(false)
    expect(answersMatch('8sin(2x-pi/4)', '8cos(2x - \\tfrac{1}{4}\\pi)')).toBe(false)
    expect(answersMatch('-6sin(3x-pi/4)', '-6sin(3x - \\tfrac{1}{2}\\pi)')).toBe(false)
    expect(answersMatch('-8cos((1/2)(x-1))', '-8sin(\\tfrac{1}{2}(x-1))')).toBe(false)
    expect(answersMatch('15((1/3)x-4)^4', '15(\\tfrac{1}{2}x-4)^4')).toBe(false)
    expect(
      answersMatch('3(x-3)((1/2)x^2-2x)^2', '3(x-2)(\\tfrac{1}{2}x^2-2x)^2'),
    ).toBe(false)
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
})

// =====================================================================
// Tijd per opgave
// =====================================================================
describe('cleanTimeSpentSec', () => {
  it('rondt af op hele seconden', () => {
    expect(cleanTimeSpentSec(12.4)).toBe(12)
    expect(cleanTimeSpentSec(12.6)).toBe(13)
  })

  it('laat leeg wat geen meting is', () => {
    expect(cleanTimeSpentSec(undefined)).toBeNull()
    expect(cleanTimeSpentSec(null)).toBeNull()
    expect(cleanTimeSpentSec(Number.NaN)).toBeNull()
    expect(cleanTimeSpentSec(Number.POSITIVE_INFINITY)).toBeNull()
  })

  it('kapt een vergeten tabblad af op een uur', () => {
    expect(cleanTimeSpentSec(8 * 60 * 60)).toBe(MAX_TIME_SPENT_SEC)
  })

  it('maakt van een klok die achteruit liep geen negatieve tijd', () => {
    expect(cleanTimeSpentSec(-5)).toBe(0)
  })
})
