/**
 * Theorie-content voor integraaloefenen.nl.
 *
 * Voorlopig leeg — wordt gevuld zodra de integralen-content klaar is.
 * Behoudt dezelfde shape als `afgeleiden.ts` zodat de loader en consumers
 * niets hoeven aan te passen.
 */

import type {
  ClusterTheory,
  OverviewChapter,
} from './afgeleiden'

export type { ClusterTheory, OverviewChapter }

export const CLUSTER_THEORY: Record<string, ClusterTheory> = {}

export const CLUSTER_THEORY_EN: Record<string, ClusterTheory> = {}

export const TOPIC_FORMULA: Record<string, string> = {}

export const TOPIC_INTROS: Record<string, string> = {}

export const TOPIC_INTROS_EN: Record<string, string> = {}

export const THEORY_OVERVIEW: OverviewChapter[] = []
