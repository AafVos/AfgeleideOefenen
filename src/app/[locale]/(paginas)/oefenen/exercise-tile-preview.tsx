'use client'

import { memo } from 'react'

import { Math as TeX, RichMath } from '@/components/math'

/**
 * Zelfde keuze als PracticeCard; inline zodat meerdere rijen netjes passen in de tegel.
 *
 * `line-clamp-4` kapt af aan het eind van de laatste hele regel (met "…"),
 * nooit halverwege een regel. `inline-block align-middle` op de formules
 * voorkomt dat een hoge breuk of wortel die regel een stuk hoger maakt dan
 * de tekstregels eromheen.
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
    <div className="pointer-events-none mt-2 text-left [&_.katex-html]:tracking-tight" aria-hidden>
      <div className="line-clamp-4 w-full font-serif text-sm leading-snug text-text [&_.katex]:inline-block [&_.katex]:align-middle">
        {src.includes('$') ? (
          <RichMath source={src} blockDisplay={false} />
        ) : (
          <TeX tex={src} displayMode={false} className="inline-block align-middle" />
        )}
      </div>
    </div>
  )
})
