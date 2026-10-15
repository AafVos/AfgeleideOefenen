import type { SupabaseClient } from '@supabase/supabase-js'

import {
  eersteOnderdeel,
  eersteOpgaveId,
  opgaveLink,
  type EersteOnderdeel,
} from '@/app/[locale]/(paginas)/dashboard/start'
import { bouwOnderwerpVoortgang } from '@/lib/dashboard/indeling'
import type { Database } from '@/lib/supabase/types'

import { padMetTaal, veiligOefenpad } from './oefenpad'

type Db = SupabaseClient<Database>

/**
 * Waar een nieuwe leerling na het bevestigen van zijn mail terechtkomt.
 * Zonder gekozen soort is dat de eerste opgave, dezelfde link als de
 * startknop op het dashboard. Lukt die link niet, dan het dashboard.
 * Mét een oefenpad: dat pad, en bij een onderwerp meteen de eerste som.
 */
export async function bestemmingNaBevestigen(db: Db, ruwPad: unknown): Promise<string> {
  const gekozen = veiligOefenpad(ruwPad)
  if (gekozen) return padMetTaal(await padMetEersteVraag(db, gekozen))

  const eerste = await linkNaarEersteSom(db)
  return eerste ? padMetTaal(eerste) : '/nl/dashboard'
}

/**
 * Waar een leerling na het inloggen terechtkomt. Zonder gekozen soort
 * blijft dat het dashboard. Mét een oefenpad gaat hij daarheen, en bij
 * een onderwerp meteen naar de eerste som van die soort.
 */
export async function bestemmingNaInloggen(
  db: Db,
  ruwPad: unknown,
  taal: string,
): Promise<string> {
  const gekozen = veiligOefenpad(ruwPad)
  if (!gekozen) return `/${taal}/dashboard`
  return padMetTaal(await padMetEersteVraag(db, gekozen), taal)
}

/**
 * De link van de startknop op het dashboard: eerste hoofdstuk, eerste
 * onderwerp, eerste soort som, makkelijkste opgave. `null` als er nergens
 * een opgave klaarstaat.
 */
export async function linkNaarEersteSom(db: Db): Promise<string | null> {
  const [{ data: chapters }, { data: topics }, { data: clusters }] = await Promise.all([
    db.from('chapters').select('id, slug, title, order_index').order('order_index'),
    db
      .from('topics_new')
      .select('id, title, slug, chapter_id, order_index')
      .order('order_index'),
    db
      .from('topic_clusters_new')
      .select('id, title, slug, topic_id, order_index')
      .order('order_index'),
  ])

  const onderdeel = eersteOnderdeel(
    bouwOnderwerpVoortgang({
      chapters: chapters ?? [],
      topics: topics ?? [],
      clusters: clusters ?? [],
      voortgang: [],
    }),
  )
  if (!onderdeel) return null

  const vraagId = await eersteOpgaveId(db, onderdeel.clusterId)
  if (!vraagId) return null
  return opgaveLink(onderdeel, vraagId)
}

/**
 * Staat er een onderwerp in het pad en nog geen opgave, dan de eerste
 * som van die soort. Lukt dat niet, dan het pad zelf: het menu van die
 * soort, niet het hoofdstukkenmenu van de hele site.
 */
export async function padMetEersteVraag(db: Db, pad: string): Promise<string> {
  const url = new URL(pad, 'https://afgeleideoefenen.nl')
  const topicSlug = url.searchParams.get('topic')?.trim()
  if (!topicSlug || url.searchParams.get('q')?.trim()) return pad

  const { data: topic } = await db
    .from('topics_new')
    .select('id, slug, title, chapter_id')
    .eq('slug', topicSlug)
    .maybeSingle()
  if (!topic) return pad

  const { data: chapter } = await db
    .from('chapters')
    .select('id, slug, title')
    .eq('id', topic.chapter_id)
    .maybeSingle()
  if (!chapter) return pad

  const { data: clusters } = await db
    .from('topic_clusters_new')
    .select('id, slug, title')
    .eq('topic_id', topic.id)
    .order('order_index', { ascending: true })

  const gewenst = url.searchParams.get('cluster')?.trim()
  const lijst = clusters ?? []
  const volgorde = gewenst ? lijst.filter((cluster) => cluster.slug === gewenst) : lijst

  for (const cluster of volgorde) {
    const vraagId = await eersteOpgaveId(db, cluster.id)
    if (!vraagId) continue
    const onderdeel: EersteOnderdeel = {
      chapterId: chapter.id,
      chapterSlug: chapter.slug,
      chapterTitle: chapter.title,
      topicSlug: topic.slug,
      topicTitle: topic.title,
      clusterId: cluster.id,
      clusterSlug: cluster.slug,
      clusterTitle: cluster.title,
    }
    return opgaveLink(onderdeel, vraagId)
  }

  return pad
}
