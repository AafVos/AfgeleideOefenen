/**
 * Theorie-loader: dispatcht naar het content-bestand van de actieve site
 * (`afgeleiden` of `integralen`), bepaald door NEXT_PUBLIC_SITE.
 *
 * Consumers blijven `from '@/lib/theory'` importeren — alleen de data eronder
 * verandert per site.
 */

import { SITE } from '@/config/site'

import * as afgeleiden from '@/content/theory/afgeleiden'
import * as integralen from '@/content/theory/integralen'

const SOURCE = SITE === 'integralen' ? integralen : afgeleiden

export type { OverviewCard } from '@/content/theory/afgeleiden'

export const THEORY_OVERVIEW = SOURCE.THEORY_OVERVIEW
