/**
 * Site-specific configuration.
 *
 * Selected at build/runtime via the `NEXT_PUBLIC_SITE` env var. Lets the same
 * codebase serve afgeleideoefenen.nl and integraaloefenen.nl from one
 * deployment per Vercel project — only brand text, domain, and subject vocab
 * differ.
 */

export type SiteId = 'afgeleiden' | 'integralen'

const RAW_SITE = (process.env.NEXT_PUBLIC_SITE ?? 'afgeleiden') as string
export const SITE: SiteId =
  RAW_SITE === 'integralen' ? 'integralen' : 'afgeleiden'

type SiteDef = {
  id: SiteId
  brand: string
  domain: string
  brandEn: string
  domainEn: string
  subjectNounNl: string
  subjectNounNlPlural: string
  subjectVerbNl: string
  subjectNounEn: string
  subjectVerbEn: string
  /** Zin die in AI-prompts de opgave inleidt, bv. "Bepaal de afgeleide van". */
  taskPromptNl: string
  taskPromptEn: string
}

const SITES: Record<SiteId, SiteDef> = {
  afgeleiden: {
    id: 'afgeleiden',
    brand: 'AfgeleideOefenen',
    domain: 'afgeleideoefenen.nl',
    brandEn: 'DerivativePractice',
    domainEn: 'derivativepractice.nl',
    subjectNounNl: 'afgeleide',
    subjectNounNlPlural: 'afgeleides',
    subjectVerbNl: 'differentiëren',
    subjectNounEn: 'derivative',
    subjectVerbEn: 'differentiate',
    taskPromptNl: 'Bepaal de afgeleide van',
    taskPromptEn: 'Find the derivative of',
  },
  integralen: {
    id: 'integralen',
    brand: 'IntegraalOefenen',
    domain: 'integraaloefenen.nl',
    brandEn: 'IntegralPractice',
    domainEn: 'integralpractice.nl',
    subjectNounNl: 'integraal',
    subjectNounNlPlural: 'integralen',
    subjectVerbNl: 'integreren',
    subjectNounEn: 'integral',
    subjectVerbEn: 'integrate',
    taskPromptNl: 'Bereken de integraal van',
    taskPromptEn: 'Compute the integral of',
  },
}

export function brandForLocale(locale: string): string {
  return locale === 'en' ? SITE_CONFIG.brandEn : SITE_CONFIG.brand
}

export function domainForLocale(locale: string): string {
  return locale === 'en' ? SITE_CONFIG.domainEn : SITE_CONFIG.domain
}

export const SITE_CONFIG = SITES[SITE]
