'use client'

import { Math as TeX, RichMath } from '@/components/math'

/** Zelfde keuze als PracticeCard; inline zodat meerdere rijen netjes passen onder max-h. */
export function ExerciseTileMathPreview({
  latex_body,
  body,
}: {
  latex_body: string | null
  body: string
}) {
  return (
    <div
      className="pointer-events-none mt-2 max-h-[5rem] overflow-hidden text-left [&_.katex-html]:tracking-tight"
      aria-hidden
    >
      <div className="font-serif text-sm leading-snug text-text">
        {latex_body?.trim().length ? (
          latex_body.includes('$') ? (
            <RichMath source={latex_body} blockDisplay={false} />
          ) : (
            <TeX tex={latex_body} displayMode={false} className="inline-block align-middle" />
          )
        ) : (
          <RichMath source={body} blockDisplay={false} />
        )}
      </div>
    </div>
  )
}
