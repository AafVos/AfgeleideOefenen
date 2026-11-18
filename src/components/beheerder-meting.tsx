'use client'

import { useEffect } from 'react'

import { zetMetenUitVoorBeheerder } from '@/lib/meten/schakelaar'

/**
 * Zet de meet-uit-vlag (`src/lib/meten/schakelaar.ts`) voor de beheerder, op
 * elk apparaat waar ze inlogt. Net als de schakelaar in de adresregel: alleen
 * een vlag in `localStorage`, geen koekje en geen persoonsgegeven.
 */
export function BeheerderMeting({ isAdmin }: { isAdmin: boolean }) {
  useEffect(() => {
    if (isAdmin) zetMetenUitVoorBeheerder()
  }, [isAdmin])

  return null
}
