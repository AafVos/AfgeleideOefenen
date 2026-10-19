/**
 * Merknaam, domein en vakwoorden van deze site.
 *
 * Er staan twee sites in deze repo, met dezelfde code, dezelfde database en
 * dezelfde accounts:
 *
 * * `afgeleide` — afgeleideoefenen.nl, differentiëren per onderwerp;
 * * `wiskundemetaaf` — wiskundemetaaf.nl, gericht op het eindexamen.
 *
 * Welke van de twee er gebouwd wordt, zegt `NEXT_PUBLIC_SITE_VARIANT` bij de
 * bouw. Zonder die variabele is het `afgeleide`, zodat een bestaande bouw
 * precies blijft doen wat hij deed. De naam staat voluit in de code en niet
 * in een variabele, want Next bakt alleen een letterlijke
 * `process.env.NEXT_PUBLIC_...` in de browserbundel in.
 *
 * Integraaloefenen heeft sinds 9 oktober 2026 een eigen database. De
 * kolom `site` en de integralen-rijen zijn hier weg (migratie 0034).
 */

export const SITE_VARIANTEN = ['afgeleide', 'wiskundemetaaf'] as const
export type SiteVariant = (typeof SITE_VARIANTEN)[number]

export type SiteInstellingen = {
  variant: SiteVariant
  /** De naam voluit, in lopende tekst en in mail. */
  brandNaam: string
  /** Eerste deel van de naam in de kop. */
  brandVoor: string
  /** Tweede deel van de naam in de kop, in de accentkleur. */
  brandAccent: string
  domain: string
  subjectVerbNl: string
  /** Zin die in AI-prompts de opgave inleidt. */
  taskPromptNl: string
}

const INSTELLINGEN: Record<SiteVariant, SiteInstellingen> = {
  afgeleide: {
    variant: 'afgeleide',
    brandNaam: 'AfgeleideOefenen',
    brandVoor: 'AfgeleideOefenen',
    brandAccent: '.nl',
    domain: 'afgeleideoefenen.nl',
    subjectVerbNl: 'differentiëren',
    taskPromptNl: 'Bepaal de afgeleide van',
  },
  wiskundemetaaf: {
    variant: 'wiskundemetaaf',
    brandNaam: 'Wiskunde met Aaf',
    // \u00A0 is een harde spatie: anders valt "Aaf" op een smal scherm
    // alleen op de volgende regel.
    brandVoor: 'Wiskunde met\u00A0',
    brandAccent: 'Aaf',
    domain: 'wiskundemetaaf.nl',
    subjectVerbNl: 'differentiëren',
    taskPromptNl: 'Bepaal de afgeleide van',
  },
}

/** Hoort deze tekst bij een site die we kennen? */
export function isSiteVariant(waarde: string | undefined): waarde is SiteVariant {
  return !!waarde && (SITE_VARIANTEN as readonly string[]).includes(waarde)
}

function kiesVariant(): SiteVariant {
  const gevraagd = process.env.NEXT_PUBLIC_SITE_VARIANT?.trim()
  return isSiteVariant(gevraagd) ? gevraagd : 'afgeleide'
}

export const SITE_CONFIG: SiteInstellingen = INSTELLINGEN[kiesVariant()]

/** De instellingen van één site, los van wat er nu gebouwd wordt. Voor tests. */
export function instellingenVan(variant: SiteVariant): SiteInstellingen {
  return INSTELLINGEN[variant]
}
