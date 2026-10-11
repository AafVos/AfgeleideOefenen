/**
 * Tekst vóór het antwoordvak.
 *
 * Staat er iets in `answer_prefix` (bijvoorbeeld `t =`), dan tonen we dat.
 * Is het veld leeg, dan blijft het `f'(x) =`, afgeleid van de letter in de
 * formule. Zo verandert een kale som niet.
 */
export function answerPrefix(
  latexBody: string | null,
  storedPrefix?: string | null,
): string {
  const custom = storedPrefix?.replaceAll('$', '').trim()
  if (custom) return custom
  const letter = latexBody?.match(/([a-zA-Z])\s*\(\s*x\s*\)\s*=/)?.[1] ?? 'f'
  return `${letter}'(x) =`
}
