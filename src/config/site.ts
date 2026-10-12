/**
 * Merknaam, domein en vakwoorden van deze site.
 *
 * Integraaloefenen heeft sinds 9 oktober 2026 een eigen database. De
 * kolom `site` en de integralen-rijen zijn hier weg (migratie 0034).
 */

export const SITE_CONFIG = {
  brand: 'AfgeleideOefenen',
  domain: 'afgeleideoefenen.nl',
  subjectVerbNl: 'differentiëren',
  /** Zin die in AI-prompts de opgave inleidt. */
  taskPromptNl: 'Bepaal de afgeleide van',
} as const
