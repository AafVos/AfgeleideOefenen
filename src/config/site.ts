/**
 * Merknaam, domein en vakwoorden van deze site.
 *
 * `SITE` is ook de waarde van de kolom `site` in de database. Sinds 9 oktober
 * 2026 heeft integraaloefenen.nl een eigen database, maar de oude
 * integralen-rijen staan hier nog, dus élke query filtert hierop — anders zie
 * je hier integralen-opgaven staan.
 */

export const SITE = 'afgeleiden' as const

export const SITE_CONFIG = {
  brand: 'AfgeleideOefenen',
  domain: 'afgeleideoefenen.nl',
  subjectVerbNl: 'differentiëren',
  /** Zin die in AI-prompts de opgave inleidt. */
  taskPromptNl: 'Bepaal de afgeleide van',
} as const
