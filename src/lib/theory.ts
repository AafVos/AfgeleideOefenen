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

export type {
  ClusterTheory,
  OverviewExample,
  OverviewTable,
  OverviewCard,
  OverviewChapter,
} from '@/content/theory/afgeleiden'

export const CLUSTER_THEORY = SOURCE.CLUSTER_THEORY
export const CLUSTER_THEORY_EN = SOURCE.CLUSTER_THEORY_EN
export const TOPIC_FORMULA = SOURCE.TOPIC_FORMULA
export const TOPIC_INTROS = SOURCE.TOPIC_INTROS
export const TOPIC_INTROS_EN = SOURCE.TOPIC_INTROS_EN
export const THEORY_OVERVIEW = SOURCE.THEORY_OVERVIEW
