'use client'

import { memo } from 'react'

import { Math as TeX, RichMath } from '@/components/math'

/**
 * Zelfde keuze als PracticeCard; inline zodat meerdere rijen netjes passen onder max-h.
 *
 * De formule wordt maar één keer getekend. Een andere tegel aanklikken of
 * een kleur die verandert, tekent de rest niet opnieuw.
 */
export const ExerciseTileMathPreview = memo(function ExerciseTileMathPreview({
  latex_body,
}: {
  latex_body: string | null
}) {
  const src = latex_body ?? ''
  return (
    <div
      className="pointer-events-none mt-2 max-h-[5rem] overflow-hidden text-left [&_.katex-html]:tracking-tight"
      aria-hidden
    >
      <div className="font-serif text-sm leading-snug text-text">
        {src.includes('$') ? (
          <RichMath source={src} blockDisplay={false} />
        ) : (
          <TeX tex={src} displayMode={false} className="inline-block align-middle" />
        )}
      </div>
    </div>
  )
})
