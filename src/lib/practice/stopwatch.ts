/**
 * Een stopwatch die stil kan staan.
 *
 * Hiermee meten we hoe lang een opgave op het scherm stond. De klok hoort
 * alleen te lopen zolang het tabblad in beeld is: wie tussendoor een bericht
 * beantwoordt en tien minuten later terugkomt, heeft niet tien minuten op
 * deze opgave zitten denken.
 *
 * `now` is er voor de tests; in de app is dat gewoon de klok van de browser.
 */
export type Stopwatch = {
  /** De klok staat stil (tabblad weg). */
  pause: () => void
  /** De klok loopt weer (tabblad terug in beeld). */
  resume: () => void
  /** Opnieuw vanaf nul; of hij daarna loopt, blijft zoals het was. */
  reset: () => void
  /** Alles wat tot nu toe gelopen heeft, in seconden. */
  elapsedSec: () => number
}

export function createStopwatch(now: () => number = Date.now): Stopwatch {
  /** Opgeteld: de stukken die al afgerond zijn. */
  let totalMs = 0
  /** Begin van het stuk dat nu loopt; leeg als de klok stilstaat. */
  let runningSince: number | null = null

  // Een klok die achteruit wordt gezet (zomertijd, handmatig) mag geen
  // negatieve tijd opleveren.
  function sinceStart(): number {
    return runningSince === null ? 0 : Math.max(0, now() - runningSince)
  }

  return {
    pause() {
      if (runningSince === null) return
      totalMs += sinceStart()
      runningSince = null
    },
    resume() {
      if (runningSince === null) runningSince = now()
    },
    reset() {
      const wasRunning = runningSince !== null
      totalMs = 0
      runningSince = wasRunning ? now() : null
    },
    elapsedSec() {
      return (totalMs + sinceStart()) / 1000
    },
  }
}
