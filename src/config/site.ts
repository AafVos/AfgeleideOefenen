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
  subjectNounNl: string
  subjectNounNlPlural: string
  subjectVerbNl: string
  /** Zin die in AI-prompts de opgave inleidt, bv. "Bepaal de afgeleide van". */
  taskPromptNl: string
}

const SITES: Record<SiteId, SiteDef> = {
  afgeleiden: {
    id: 'afgeleiden',
    brand: 'AfgeleideOefenen',
    domain: 'afgeleideoefenen.nl',
    subjectNounNl: 'afgeleide',
    subjectNounNlPlural: 'afgeleides',
    subjectVerbNl: 'differentiëren',
    taskPromptNl: 'Bepaal de afgeleide van',
  },
  integralen: {
    id: 'integralen',
    brand: 'IntegraalOefenen',
    domain: 'integraaloefenen.nl',
    subjectNounNl: 'integraal',
    subjectNounNlPlural: 'integralen',
    subjectVerbNl: 'integreren',
    taskPromptNl: 'Bereken de integraal van',
  },
}

export const SITE_CONFIG = SITES[SITE]
