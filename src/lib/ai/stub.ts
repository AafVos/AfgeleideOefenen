/**
 * Neppe AI-controle voor tests.
 *
 * De echte controle van een fout antwoord gaat naar Gemini. Dat kost geld,
 * heeft internet nodig en geeft niet elke keer hetzelfde antwoord — alle drie
 * onbruikbaar in een automatische test. Met `AI_CHECK_MODE=stub` slaat de
 * controle Gemini over en geeft hij een vaste, voorspelbare uitkomst terug.
 *
 * Dit mag nooit op de echte site aan staan: als `NODE_ENV` op `production`
 * staat, doet de schakelaar niets. Zie `stub.test.ts`.
 */

import { normalizeAnswer } from '@/lib/practice/engine'

/** Zelfde vorm als het stukje JSON dat Gemini teruggeeft. */
export type StubAnswerJson = {
  is_mathematically_correct: boolean
  error_explanation: string
}

/** Staat de neppe AI-controle aan? Nooit in productie. */
export function aiCheckIsStubbed(): boolean {
  return (
    process.env.AI_CHECK_MODE === 'stub' &&
    process.env.NODE_ENV !== 'production'
  )
}

/**
 * Normalisatie bovenop `normalizeAnswer`, met één extra regel: een breuk met
 * een macht in de noemer is hetzelfde als een negatieve macht.
 *
 *   -1/x^2  →  -x^-2        3/x  →  3x^-1
 *
 * Meer kan de stub niet; hij is er alleen om het pad "AI zegt: wiskundig wél
 * goed, maar anders opgeschreven" te kunnen testen zonder Gemini.
 */
function looseNormalize(raw: string): string {
  return (
    normalizeAnswer(raw)
      // /x^3 → x^-3   en   /x^-3 → x^--3 (hieronder weer ^3)
      .replace(/\/([a-z])\^(-?\d+)/g, '$1^-$2')
      .replace(/\^--/g, '^')
      // /x → x^-1 (alleen als er echt niets meer achter staat)
      .replace(/\/([a-z])(?![a-z0-9^])/g, '$1^-1')
      // 1x^-2 → x^-2
      .replace(/(^|[+-])1([a-z])/g, '$1$2')
  )
}

/**
 * De vaste uitkomst van de neppe AI-controle: goed als het antwoord op de
 * bovenstaande notatie-regel na gelijk is aan het juiste antwoord, anders fout.
 */
export function stubCheckAnswerJson(
  correctAnswer: string,
  studentAnswer: string,
): StubAnswerJson {
  if (looseNormalize(studentAnswer) === looseNormalize(correctAnswer)) {
    return { is_mathematically_correct: true, error_explanation: '' }
  }
  return {
    is_mathematically_correct: false,
    error_explanation: 'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
  }
}
