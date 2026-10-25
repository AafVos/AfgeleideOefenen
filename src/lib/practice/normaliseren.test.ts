import { describe, expect, it } from 'vitest'

import { normalizeAnswer } from './engine'

/**
 * `normalizeAnswer` is de eerste stap van elke antwoordvergelijking: wat hier
 * uit komt, is wat `answersMatch` en de AI-controle met elkaar vergelijken.
 * Een foutje in bijvoorbeeld de eenheid-regex of de pi-omzetting kan daardoor
 * een fout antwoord goed laten rekenen zonder dat er iets anders stukgaat.
 *
 * Hieronder staat per stap wat er in gaat en wat er uit hoort te komen, met
 * de invoer en de uitvoer allebei opgeschreven - niet alleen "deze twee zijn
 * gelijk". Zo valt een verschuiving in één stap meteen op de juiste plek op.
 */

describe('normalizeAnswer: spaties en hoofdletters', () => {
  it('haalt alle spaties weg en maakt alles klein', () => {
    expect(normalizeAnswer('  12 X^2 ')).toBe('12x^2')
    expect(normalizeAnswer('3 X + 2')).toBe('3x+2')
    expect(normalizeAnswer('Y = 2X - 1')).toBe('2x-1')
  })

  it('laat een leeg antwoord leeg', () => {
    expect(normalizeAnswer('')).toBe('')
    expect(normalizeAnswer('   ')).toBe('')
  })
})

describe('normalizeAnswer: machten', () => {
  it('maakt van een superscript een dakje met cijfer', () => {
    expect(normalizeAnswer('x²')).toBe('x^2')
    expect(normalizeAnswer('x³')).toBe('x^3')
    expect(normalizeAnswer('x⁴')).toBe('x^4')
    expect(normalizeAnswer('3x² + 2x³ - x⁴')).toBe('3x^2+2x^3-x^4')
  })

  it('haalt haakjes om een simpele exponent weg', () => {
    expect(normalizeAnswer('x^(-1)')).toBe('x^-1')
    expect(normalizeAnswer('x^(12)')).toBe('x^12')
    expect(normalizeAnswer('e^(x)')).toBe('e^x')
  })

  it('laat haakjes om een samengestelde exponent staan', () => {
    // e^(x+1) is iets anders dan e^x + 1, dus die haakjes moeten blijven.
    expect(normalizeAnswer('e^(x+1)')).toBe('e^(x+1)')
    expect(normalizeAnswer('x^(2x)')).toBe('x^(2x)')
    expect(normalizeAnswer('x^(-1/2)')).toBe('x^(-1/2)')
  })

  it('schrijft x^1 als x, maar laat x^10 heel', () => {
    expect(normalizeAnswer('5x^1')).toBe('5x')
    expect(normalizeAnswer('5x^10')).toBe('5x^10')
  })
})

describe('normalizeAnswer: maaltekens', () => {
  it('houdt een maalteken tussen twee cijfers vast als ×', () => {
    // 2*4 mag nooit 24 worden: dat zijn twee verschillende antwoorden.
    expect(normalizeAnswer('2*4')).toBe('2×4')
    expect(normalizeAnswer('2·4')).toBe('2×4')
    expect(normalizeAnswer('2 \\cdot 4')).toBe('2×4')
    expect(normalizeAnswer('24')).toBe('24')
  })

  it('laat een maalteken naast een letter weg', () => {
    expect(normalizeAnswer('3*x')).toBe('3x')
    expect(normalizeAnswer('3·x')).toBe('3x')
    expect(normalizeAnswer('2*(x+1)')).toBe('2(x+1)')
  })
})

describe('normalizeAnswer: mintekens', () => {
  it('maakt van het lange minteken een gewoon minteken', () => {
    // U+2212, het teken dat de formule-weergave en veel toetsenborden geven.
    expect(normalizeAnswer('3x\u22122')).toBe('3x-2')
  })

  it('maakt van +- één minteken', () => {
    expect(normalizeAnswer('3x+-2')).toBe('3x-2')
    expect(normalizeAnswer('2x + -1')).toBe('2x-1')
  })
})

describe('normalizeAnswer: komma als decimaalteken', () => {
  it('maakt van een komma tussen twee cijfers een punt', () => {
    expect(normalizeAnswer('0,2')).toBe('0.2')
    expect(normalizeAnswer('1,8x^2 - 2,6x')).toBe('1.8x^2-2.6x')
  })

  it('rondt niet af naar een breuk', () => {
    // 0,33 blijft 0.33 en wordt dus nooit gelijk aan 1/3.
    expect(normalizeAnswer('0,33')).toBe('0.33')
    expect(normalizeAnswer('1/3')).toBe('1/3')
  })
})

describe('normalizeAnswer: voorvoegsel t=, x=, h= en y=', () => {
  it('haalt het voorvoegsel vooraan weg', () => {
    expect(normalizeAnswer('t = 2')).toBe('2')
    expect(normalizeAnswer('x=2')).toBe('2')
    expect(normalizeAnswer('h = 2')).toBe('2')
    expect(normalizeAnswer('T = 2')).toBe('2')
    expect(normalizeAnswer('y = 2x - 1')).toBe('2x-1')
  })

  it('haalt alleen vooraan weg, en alleen die vier letters', () => {
    expect(normalizeAnswer("f'(x) = 2")).toBe("f'(x)=2")
    expect(normalizeAnswer('a = 2')).toBe('a=2')
    expect(normalizeAnswer('2x = 4')).toBe('2x=4')
  })
})

describe('normalizeAnswer: LaTeX naar typnotatie', () => {
  it('maakt van \\pi gewoon pi', () => {
    expect(normalizeAnswer('\\pi')).toBe('pi')
    expect(normalizeAnswer('2\\pi')).toBe('2pi')
    expect(normalizeAnswer('\\pi - x')).toBe('pi-x')
  })

  it('maakt van een breuk van cijfers (teller/noemer)', () => {
    expect(normalizeAnswer('\\tfrac{1}{2}')).toBe('(1/2)')
    expect(normalizeAnswer('\\dfrac{1}{2}')).toBe('(1/2)')
    expect(normalizeAnswer('\\frac{3}{4}')).toBe('(3/4)')
  })

  it('schrijft een stambreuk voor pi als pi/n', () => {
    expect(normalizeAnswer('\\tfrac{1}{4}\\pi')).toBe('pi/4')
    expect(normalizeAnswer('\\tfrac{1}{2}\\pi')).toBe('pi/2')
    expect(normalizeAnswer('8cos(2x - \\tfrac{1}{4}\\pi)')).toBe(
      '8cos(2x-pi/4)',
    )
  })

  it('laat een andere breuk voor pi als breuk staan', () => {
    // Alleen 1/n gaat naar pi/n; (2/3)pi blijft zoals het staat.
    expect(normalizeAnswer('\\tfrac{2}{3}\\pi')).toBe('(2/3)pi')
  })

  it('laat een breuk met een formule erin heel', () => {
    // Alleen losse cijfers worden een schuine streep; de rest blijft LaTeX,
    // want (x+1)/(2) is niet zomaar hetzelfde als wat de leerling typt.
    expect(normalizeAnswer('\\frac{x+1}{2}')).toBe('\\frac{x+1}{2}')
  })
})

describe('normalizeAnswer: eenheid achter het antwoord', () => {
  it('haalt een eenheid achter een getal weg', () => {
    expect(normalizeAnswer('2 seconden')).toBe('2')
    expect(normalizeAnswer('2 METER')).toBe('2')
    expect(normalizeAnswer('12 euro')).toBe('12')
    expect(normalizeAnswer('12 euro.')).toBe('12')
    expect(normalizeAnswer('1/2 uur')).toBe('1/2')
  })

  it('haalt een samengestelde eenheid weg', () => {
    expect(normalizeAnswer('5 meter per seconde')).toBe('5')
    expect(normalizeAnswer('5 meter/seconde')).toBe('5')
    expect(normalizeAnswer('5 meter per seconde per seconde')).toBe('5')
    expect(normalizeAnswer('15 graden Celsius')).toBe('15')
    expect(normalizeAnswer('1 milligram per kubieke meter')).toBe('1')
  })

  it('haalt m/s en m/s^2 weg, maar een losse m niet', () => {
    expect(normalizeAnswer('5 m/s')).toBe('5')
    expect(normalizeAnswer('5 M/S')).toBe('5')
    expect(normalizeAnswer('5 m/s^2')).toBe('5')
    expect(normalizeAnswer('5 m/s²')).toBe('5')
    expect(normalizeAnswer('2m')).toBe('2m')
    expect(normalizeAnswer('5ms')).toBe('5ms')
  })

  it('haalt een eenheid achter de constante e weg', () => {
    expect(normalizeAnswer('20/e liter')).toBe('20/e')
    expect(normalizeAnswer('15/e milligrammen')).toBe('15/e')
    expect(normalizeAnswer('24/e^2 stuks')).toBe('24/e^2')
  })

  it('haalt niets weg als er een letter voor staat', () => {
    // Anders zou parameter 'para' worden en 2x meter hetzelfde als 2x.
    expect(normalizeAnswer('parameter')).toBe('parameter')
    expect(normalizeAnswer('2x meter')).toBe('2xmeter')
    expect(normalizeAnswer('meter')).toBe('meter')
    expect(normalizeAnswer('seconden')).toBe('seconden')
  })
})

describe('normalizeAnswer: stappen samen', () => {
  it('doet voorvoegsel, komma en eenheid in één antwoord', () => {
    expect(normalizeAnswer('t = 5,5 seconden')).toBe('5.5')
    expect(normalizeAnswer('t = 5 meter per seconde')).toBe('5')
    expect(normalizeAnswer('y = 1,5x² + \\tfrac{1}{4}\\pi')).toBe(
      '1.5x^2+pi/4',
    )
  })

  it('verandert niets meer bij een tweede keer normaliseren', () => {
    const antwoorden = [
      '  12 X^2 ',
      '3x² + 2x³ - x⁴',
      '2 \\cdot 4',
      'x^(-1)',
      '5x^1',
      '3x\u22122',
      '0,33',
      't = 5,5 seconden',
      '\\tfrac{1}{4}\\pi',
      '8cos(2x - \\tfrac{1}{4}\\pi)',
      '5 meter per seconde',
      'parameter',
      'e^(x+1)',
    ]
    for (const antwoord of antwoorden) {
      const een = normalizeAnswer(antwoord)
      expect(normalizeAnswer(een)).toBe(een)
    }
  })
})
