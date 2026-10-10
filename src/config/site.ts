/**
 * Merknaam, domein en vakwoorden van deze site.
 *
 * `SITE` is ook de waarde van de kolom `site` in de database. Die database is
 * gedeeld met integraaloefenen.nl (eigen repo sinds oktober 2026), dus élke
 * query filtert hierop — anders zie je hier integralen-opgaven staan.
 */

export const SITE = 'afgeleiden' as const

export const SITE_CONFIG = {
  brand: 'AfgeleideOefenen',
  domain: 'afgeleideoefenen.nl',
  subjectVerbNl: 'differentiëren',
  /** Zin die in AI-prompts de opgave inleidt. */
  taskPromptNl: 'Bepaal de afgeleide van',
} as const
