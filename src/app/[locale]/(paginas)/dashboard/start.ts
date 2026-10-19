import type { SupabaseClient } from '@supabase/supabase-js'

import type { Database } from '@/lib/supabase/types'

import type { ChapterData } from './topic-block'

/**
 * Waar een leerling begint die nog nooit iets gemaakt heeft.
 *
 * Het dashboard stond voor zo iemand vol nullen, met alle hoofdstukken
 * dichtgeklapt en geen enkele knop naar een opgave. Hier zoeken we de eerste
 * soort som uit het aanbod op, zodat het dashboard één knop kan laten zien
 * die meteen een opgave opent (zie AFG-114).
 */
export type EersteOnderdeel = {
  chapterId: string
  chapterSlug: string
  chapterTitle: string
  topicSlug: string
  topicTitle: string
  clusterId: string
  clusterTitle: string
  clusterSlug: string
}

/**
 * Het eerste onderdeel uit het aanbod: hoofdstuk 1, onderwerp 1, soort som 1.
 * De lijst komt al op volgorde binnen. Hoofdstukken en onderwerpen zonder
 * soorten sommen slaan we over; daar valt niets te oefenen.
 */
export function eersteOnderdeel(
  chapters: ChapterData[],
): EersteOnderdeel | null {
  for (const chapter of chapters) {
    for (const topic of chapter.topics) {
      const cluster = topic.clusters[0]
      if (!cluster) continue
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
  return null
}

/**
 * Waar een leerling verdergaat die al eerder geoefend heeft (zie AFG-484).
 *
 * De eerstvolgende soort som die nog niet beheerst is, in boekvolgorde.
 * `volgorde` is de lijst soorten sommen zoals ze op het dashboard en de
 * oefenpagina onder elkaar staan (`clusterVolgorde`). Wat daar niet in staat
 * komt erachter, in de volgorde van `chapters`, zodat er nooit een soort som
 * buiten beeld valt.
 *
 * Is alles beheerst, dan komt er niets terug: dan hoort er ook geen kaart te
 * staan.
 */
export function volgendeOnderdeel(
  chapters: ChapterData[],
  volgorde: string[] = [],
): EersteOnderdeel | null {
  const perCluster = new Map<string, { onderdeel: EersteOnderdeel; isKnown: boolean }>()
  const eigenVolgorde: string[] = []

  for (const chapter of chapters) {
    for (const topic of chapter.topics) {
      for (const cluster of topic.clusters) {
        if (perCluster.has(cluster.id)) continue
        eigenVolgorde.push(cluster.id)
        perCluster.set(cluster.id, {
          isKnown: cluster.isKnown,
          onderdeel: {
            chapterId: chapter.id,
            chapterSlug: chapter.slug,
            chapterTitle: chapter.title,
            topicSlug: topic.slug,
            topicTitle: topic.title,
            clusterId: cluster.id,
            clusterSlug: cluster.slug,
            clusterTitle: cluster.title,
          },
        })
      }
    }
  }

  const gezien = new Set<string>()
  for (const clusterId of [...volgorde, ...eigenVolgorde]) {
    if (gezien.has(clusterId)) continue
    gezien.add(clusterId)
    const regel = perCluster.get(clusterId)
    if (!regel || regel.isKnown) continue
    return regel.onderdeel
  }
  return null
}

/**
 * De link naar één opgave op de oefenpagina. Hoofdstuk, onderwerp en soort
 * som moeten erbij: de oefenpagina opent `q` alleen als die opgave ook in de
 * gekozen soort som zit.
 */
export function opgaveLink(
  onderdeel: EersteOnderdeel,
  questionId: string,
): string {
  const vraagtekst = [
    ['chapter', onderdeel.chapterSlug],
    ['topic', onderdeel.topicSlug],
    ['cluster', onderdeel.clusterSlug],
    ['q', questionId],
  ]
    .map(([naam, waarde]) => `${naam}=${encodeURIComponent(waarde!)}`)
    .join('&')

  return `/oefenen?${vraagtekst}`
}

/**
 * De makkelijkste opgave van een soort som, in dezelfde volgorde als de
 * tegels op de oefenpagina: eerst op moeilijkheid, dan op volgorde.
 */
export async function eersteOpgaveId(
  db: SupabaseClient<Database>,
  clusterId: string,
): Promise<string | null> {
  const { data } = await db
    .from('questions_new')
    .select('id')
    .eq('cluster_id', clusterId)
    .order('difficulty', { ascending: true })
    .order('order_index', { ascending: true })
    .limit(1)
    .maybeSingle()

  return data?.id ?? null
}

/**
 * De opgave waar een leerling verdergaat binnen een soort som: de eerste die
 * nu niet groen is, in dezelfde volgorde als de tegels. Groen is dezelfde
 * kleur als op de oefenpagina: het laatste antwoord was goed. Een opgave die
 * hij eerst goed had en later fout, komt dus weer langs.
 *
 * Staat alles op groen (maar is de soort nog niet beheerst, want daar horen
 * drie goede op rij bij), dan weer de makkelijkste.
 */
export async function volgendeOpgaveId(
  db: SupabaseClient<Database>,
  clusterId: string,
  laatsteAntwoorden: Map<string, boolean>,
): Promise<string | null> {
  const { data: vragen } = await db
    .from('questions_new')
    .select('id')
    .eq('cluster_id', clusterId)
    .order('difficulty', { ascending: true })
    .order('order_index', { ascending: true })

  const opVolgorde = (vragen ?? []).map((vraag) => vraag.id)
  if (opVolgorde.length === 0) return null

  return opVolgorde.find((id) => laatsteAntwoorden.get(id) !== true) ?? opVolgorde[0]!
}
