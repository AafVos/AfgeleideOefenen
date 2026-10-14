/** Codes die een aanmeldlink mag meegeven. Iets anders slaan we niet op. */
export const TOEGESTANE_HERKOMST = [
  'docent',
  'youtube',
  'klas',
  'forum',
  'proberen',
] as const

export type Herkomst = (typeof TOEGESTANE_HERKOMST)[number]

const TOEGESTANE = new Set<string>(TOEGESTANE_HERKOMST)

/**
 * Leest `?van=` of het verborgen formulierveld.
 * Alleen een code uit de lijst telt, na trimmen en kleine letters.
 * Een naam, een adres of een andere tekst wordt `null`.
 */
export function leesHerkomst(waarde: unknown): Herkomst | null {
  const ruw = Array.isArray(waarde) ? waarde[0] : waarde
  if (typeof ruw !== 'string') return null
  const code = ruw.trim().toLowerCase()
  if (!TOEGESTANE.has(code)) return null
  return code as Herkomst
}
