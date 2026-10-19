// =====================================================================
// "Even opfrissen?" — de zachte uitnodiging om oude, al beheerste stof
// nog eens te doen (zie AFG-488).
//
// Een soort som is beheerst na drie goede antwoorden op rij en blijft dat
// daarna. Dat blijft zo: hier verandert niets aan de status, wat de
// leerling ook doet met de suggestie. Het enige wat we doen is één soort
// som aanwijzen die hij al weken niet meer gedaan heeft, zodat hij er zelf
// voor kan kiezen hem op te frissen.
//
// Waarom niet alleen naar `mastered_at` kijken: die datum blijft staan op
// het moment van beheersen en wordt nooit bijgewerkt. Wie de soort som
// daarna nog tien keer oefent, heeft nog steeds dezelfde `mastered_at`, en
// zou de suggestie dus voor altijd blijven zien. Daarom halen we er de
// soorten sommen af die in de afgelopen weken nog geoefend zijn.
// =====================================================================

import type { EersteOnderdeel } from './start'
import type { ChapterData } from './topic-block'

/** Vanaf hoeveel dagen stilte we iets durven voor te stellen. */
export const OPFRIS_DAGEN = 21

const DAG = 24 * 60 * 60 * 1000

export type VoortgangRij = {
  cluster_id: string
  status: string
  mastered_at: string | null
}

/** Vanaf welk moment een oefensessie als "pas nog gedaan" telt. */
export function opfrisGrens(nu: Date, dagen: number = OPFRIS_DAGEN): Date {
  return new Date(nu.getTime() - dagen * DAG)
}

/**
 * De soort som die het langst geleden beheerst is en sindsdien niet meer
 * geoefend. Is er niets ouds genoeg, dan komt er niets terug en staat er
 * ook geen regel op het dashboard.
 *
 * `recentGeoefend` zijn de soorten sommen waar in de afgelopen `dagen` nog
 * een oefensessie voor was. Een zelf-toets telt daar niet in mee: die hangt
 * niet aan één soort som.
 */
export function opfrisCluster(
  voortgang: readonly VoortgangRij[],
  recentGeoefend: ReadonlySet<string>,
  nu: Date,
  dagen: number = OPFRIS_DAGEN,
): string | null {
  const grens = opfrisGrens(nu, dagen).getTime()

  let gekozen: string | null = null
  let oudste = Infinity

  for (const rij of voortgang) {
    if (rij.status !== 'mastered' || !rij.mastered_at) continue
    if (recentGeoefend.has(rij.cluster_id)) continue

    const beheerstOp = new Date(rij.mastered_at).getTime()
    if (!Number.isFinite(beheerstOp) || beheerstOp > grens) continue

    if (beheerstOp < oudste) {
      oudste = beheerstOp
      gekozen = rij.cluster_id
    }
  }

  return gekozen
}

/**
 * De soort som opzoeken in de lijst van het dashboard, met hoofdstuk en
 * onderwerp erbij. Staat hij er niet (bijvoorbeeld omdat hij uit het aanbod
 * gehaald is), dan komt er niets terug.
 */
export function onderdeelVanCluster(
  chapters: readonly ChapterData[],
  clusterId: string,
): EersteOnderdeel | null {
  for (const chapter of chapters) {
    for (const topic of chapter.topics) {
      for (const cluster of topic.clusters) {
        if (cluster.id !== clusterId) continue
        return {
          chapterId: chapter.id,
          chapterSlug: chapter.slug,
          chapterTitle: chapter.title,
          topicSlug: topic.slug,
          topicTitle: topic.title,
          clusterId: cluster.id,
          clusterSlug: cluster.slug,
          clusterTitle: cluster.title,
        }
      }
    }
  }
  return null
}
