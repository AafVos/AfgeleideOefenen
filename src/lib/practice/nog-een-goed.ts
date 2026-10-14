/**
 * Bij precies twee goed op rij ontbreekt er nog één voor "beheerst" (drie).
 * Andere reeksen, of een lege naam, geven geen zin terug.
 */
export function nogEenGoedZin(streak: number, naam: string): string | null {
  const schoon = naam.trim()
  if (streak !== 2 || schoon.length === 0) return null
  return `Nog één goed, dan beheers je ${schoon}.`
}
