import type { ProgressStatus } from '@/lib/supabase/types'

export const MASTERY_THRESHOLD = 3

// =====================================================================
// Normalisatie (sectie 5.3)
// =====================================================================
export function normalizeAnswer(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/\*/g, '')
    .replace(/·/g, '')
    // ^(5), ^(-1), ^(x) → ^5, ^-1, ^x — alleen simpele exponenten, zodat
    // bv. e^(x+1) niet gelijk wordt aan e^x+1
    .replace(/\^\((-?\d+|-?[a-z])\)/g, '^$1')
    .replace(/x\^1\b/g, 'x')
    .replace(/\+-/g, '-')
    .replace(/−/g, '-')
    .replace(/\u2212/g, '-')
}

export function answersMatch(
  student: string,
  correct: string,
  alternatives: string[] = [],
): boolean {
  const norm = normalizeAnswer(student)
  if (norm === normalizeAnswer(correct)) return true
  return alternatives.some((alt) => norm === normalizeAnswer(alt))
}

// =====================================================================
// Voortgangsregel bij een goed antwoord
// =====================================================================
type ProgressAfterCorrect = {
  correct_streak: number
  status: ProgressStatus
  mastered: boolean
}

/**
 * Bij een goed antwoord gaat de reeks één omhoog; een cluster is beheerst
 * zodra de reeks MASTERY_THRESHOLD haalt (drie goed achter elkaar). Een
 * cluster dat al beheerst is, blijft dat.
 */
export function progressAfterCorrect(
  currentStreak: number,
): ProgressAfterCorrect {
  const correct_streak = currentStreak + 1
  const mastered = correct_streak >= MASTERY_THRESHOLD
  return {
    correct_streak,
    status: mastered ? 'mastered' : 'in_progress',
    mastered,
  }
}

// =====================================================================
// Voortgangsregel bij een fout antwoord
// =====================================================================
type ProgressAfterIncorrect = {
  correct_streak: number
  status: ProgressStatus
}

/**
 * Bij een fout antwoord gaat de reeks meteen terug naar 0: de leerling moet
 * opnieuw MASTERY_THRESHOLD keer goed achter elkaar halen. Een cluster dat al
 * beheerst is, houdt zijn reeks én zijn status — één misser tijdens het
 * herhalen mag "beheerst" niet afpakken.
 *
 * "Meteen" betekent: op het moment dat het antwoord echt fout blijkt, dus ná
 * de AI-controle en los van de vraag of de leerling de stapkiezer of het
 * slordigheidsfoutje nog aanraakt.
 */
export function progressAfterIncorrect(
  currentStatus: ProgressStatus,
  currentStreak: number,
): ProgressAfterIncorrect {
  if (currentStatus === 'mastered') {
    return { correct_streak: currentStreak, status: 'mastered' }
  }
  return { correct_streak: 0, status: 'in_progress' }
}
