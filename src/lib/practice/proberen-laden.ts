import { gooiAlsFout } from '@/lib/supabase/fouten'
import { createClient } from '@/lib/supabase/server'

import {
  kiesDrieProefopgaven,
  type ProefSelectie,
} from './proberen'

export type ProefOpgave = {
  id: string
  latexBody: string | null
  answerPrefix: string | null
}

export type ProefPakket = {
  titel: string
  opgaven: ProefOpgave[]
}

export type ProefStap = {
  id: string
  step_order: number
  step_description: string
}

export type ProefNakijkRij = {
  answer: string
  latex_answer: string | null
  answer_alternatives: string[] | null
  stappen: ProefStap[]
}

/**
 * Drie sommen van deze soort, zonder het antwoord. Die blijft op de server
 * tot de leerling iets instuurt.
 */
export async function laadProef(selectie: ProefSelectie): Promise<ProefPakket | null> {
  const db = await createClient()

  const { data: chapter, error: chapterFout } = await db
    .from('chapters')
    .select('id, title')
    .eq('slug', selectie.chapter)
    .maybeSingle()
  gooiAlsFout(chapterFout)
  if (!chapter) return null

  let topicQuery = db
    .from('topics_new')
    .select('id, title')
    .eq('chapter_id', chapter.id)
  if (selectie.topic) topicQuery = topicQuery.eq('slug', selectie.topic)
  const { data: topics, error: topicFout } = await topicQuery
  gooiAlsFout(topicFout)
  if (!topics?.length) return null

  let clusterQuery = db
    .from('topic_clusters_new')
    .select('id, title')
    .in(
      'topic_id',
      topics.map((topic) => topic.id),
    )
  if (selectie.cluster) clusterQuery = clusterQuery.eq('slug', selectie.cluster)
  const { data: clusters, error: clusterFout } = await clusterQuery
  gooiAlsFout(clusterFout)
  if (!clusters?.length) return null

  const { data: vragen, error: vraagFout } = await db
    .from('questions_new')
    .select('id, latex_body, answer_prefix, difficulty, order_index')
    .in(
      'cluster_id',
      clusters.map((cluster) => cluster.id),
    )
  gooiAlsFout(vraagFout)

  const gekozen = kiesDrieProefopgaven(vragen ?? [])
  if (!gekozen.length) return null

  const titel =
    selectie.cluster && clusters.length === 1
      ? clusters[0].title
      : selectie.topic && topics.length === 1
        ? topics[0].title
        : chapter.title

  return {
    titel,
    opgaven: gekozen.map((vraag) => ({
      id: vraag.id,
      latexBody: vraag.latex_body,
      answerPrefix: vraag.answer_prefix,
    })),
  }
}

/**
 * Antwoord en stappen van één som, maar alleen als die bij deze proef hoort.
 * Er wordt niets weggeschreven.
 */
export async function laadNakijkRij(
  selectie: ProefSelectie,
  questionId: string,
): Promise<ProefNakijkRij | null> {
  const pakket = await laadProef(selectie)
  if (!pakket?.opgaven.some((opgave) => opgave.id === questionId)) return null

  const db = await createClient()
  const { data: vraag, error } = await db
    .from('questions_new')
    .select('answer, latex_answer, answer_alternatives')
    .eq('id', questionId)
    .maybeSingle()
  gooiAlsFout(error)
  if (!vraag) return null

  const { data: stappen, error: stapFout } = await db
    .from('question_steps_new')
    .select('id, step_order, step_description')
    .eq('question_id', questionId)
    .order('step_order')
  gooiAlsFout(stapFout)

  return {
    answer: vraag.answer,
    latex_answer: vraag.latex_answer,
    answer_alternatives: vraag.answer_alternatives,
    stappen: stappen ?? [],
  }
}
