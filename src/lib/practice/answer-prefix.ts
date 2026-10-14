/**
 * Tekst vóór het antwoordvak.
 *
 * Staat er iets in `answer_prefix` (bijvoorbeeld `t =`), dan tonen we dat.
 * Is het veld leeg bij een kale som, dan blijft het `f'(x) =`, afgeleid van
 * de letter in de formule. Bij een verhaaltje zonder voorvoegsel typt de
 * leerling alleen het getal; daar zetten we geen afgeleide voor.
 */
const PROZA =
  /\b(de|het|een|van|is|na|op|voor|met|bij|door|tot|naar|bereken|bepaal|hoeveel|wanneer|welk|welke|hoogte|tijdstip|seconden|seconde|meter|minuten|minuut|uur|uren)\b/i

export function isVerhaaltje(latexBody: string): boolean {
  const buitenWiskunde = latexBody.replace(/\$[^$]*\$/g, ' ')
  return buitenWiskunde.includes('?') || PROZA.test(buitenWiskunde)
}

/**
 * Een toepassing of verhaaltje: er staat een context bij de som, of er
 * staat tekst vóór het antwoordvak (bijvoorbeeld `t =`). Een kale
 * afgeleide heeft geen van beide.
 */
export function vraagIsToepassing(
  latexBody: string | null,
  storedPrefix?: string | null,
): boolean {
  const custom = storedPrefix?.replaceAll('$', '').trim()
  if (custom) return true
  return Boolean(latexBody && isVerhaaltje(latexBody))
}

export function answerPrefix(
  latexBody: string | null,
  storedPrefix?: string | null,
): string {
  const custom = storedPrefix?.replaceAll('$', '').trim()
  if (custom) return custom
  if (latexBody && isVerhaaltje(latexBody)) return ''
  const letter = latexBody?.match(/([a-zA-Z])\s*\(\s*x\s*\)\s*=/)?.[1] ?? 'f'
  return `${letter}'(x) =`
}
