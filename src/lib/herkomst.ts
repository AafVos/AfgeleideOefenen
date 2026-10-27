/** Codes die een aanmeldlink mag meegeven. Iets anders slaan we niet op. */
export const TOEGESTANE_HERKOMST = [
  'docent',
  'youtube',
  'klas',
  'forum',
  'proberen',
  'proefsom',
  'chatgpt',
  'zoeken',
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

/**
 * Welk domein in `utm_source` bij welke herkomstcode hoort. Een gedeelde
 * ChatGPT-link zet er zelf `utm_source=chatgpt.com` bij; een zoekmachine
 * valt onder `zoeken`.
 */
const UTM_SOURCE_HERKOMST: Record<string, Herkomst> = {
  'chatgpt.com': 'chatgpt',
  'chat.openai.com': 'chatgpt',
  google: 'zoeken',
  'google.com': 'zoeken',
  bing: 'zoeken',
  'bing.com': 'zoeken',
  duckduckgo: 'zoeken',
  'duckduckgo.com': 'zoeken',
}

/**
 * Leest `?utm_source=` en vertaalt bekende domeinen naar een herkomstcode,
 * bijvoorbeeld `chatgpt.com` naar `chatgpt`. Een onbekende waarde wordt `null`.
 */
export function herkomstVanUtmSource(waarde: unknown): Herkomst | null {
  const ruw = Array.isArray(waarde) ? waarde[0] : waarde
  if (typeof ruw !== 'string') return null
  const code = ruw.trim().toLowerCase()
  return UTM_SOURCE_HERKOMST[code] ?? null
}
