import { MASTERY_THRESHOLD } from './engine'

/**
 * Bij precies twee goed op rij ontbreekt er nog één voor "beheerst" (drie).
 * Andere reeksen, of een lege naam, geven geen zin terug.
 */
export function nogEenGoedZin(streak: number, naam: string): string | null {
  const schoon = naam.trim()
  if (streak !== 2 || schoon.length === 0) return null
  return `Nog één goed, dan beheers je ${schoon}.`
}

/**
 * Precies het moment dat de status naar "beheerst" springt. Na die overgang
 * blijft `mastered` true bij elk volgend goed antwoord op dezelfde soort som,
 * maar dat is geen nieuw moment: de reeks staat dan al boven de drempel.
 */
export function netBeheerst(streak: number, mastered: boolean): boolean {
  return mastered && streak === MASTERY_THRESHOLD
}
