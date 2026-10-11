'use client'

import { useCallback, useEffect, useState } from 'react'

import { createStopwatch } from './stopwatch'

/**
 * Hoe lang deze opgave op het scherm stond, in seconden.
 *
 * De klok loopt alleen zolang het tabblad in beeld is (zie `stopwatch.ts`);
 * zonder die pauze zou "tijd per opgave" vooral meten hoe vaak iemand van app
 * wisselt. `restart()` is voor "nog een keer proberen": dan telt de tijd voor
 * het volgende antwoord weer vanaf nul.
 *
 * De kaart krijgt per opgave een eigen `key`, dus bij een volgende opgave
 * begint deze teller vanzelf opnieuw.
 */
export function useTimeSpent() {
  const [stopwatch] = useState(() => createStopwatch())

  useEffect(() => {
    if (document.visibilityState === 'visible') stopwatch.resume()

    function onVisibilityChange() {
      if (document.visibilityState === 'visible') {
        stopwatch.resume()
      } else {
        stopwatch.pause()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange)
  }, [stopwatch])

  const secondsSpent = useCallback(() => stopwatch.elapsedSec(), [stopwatch])
  const restart = useCallback(() => stopwatch.reset(), [stopwatch])

  return { secondsSpent, restart }
}
