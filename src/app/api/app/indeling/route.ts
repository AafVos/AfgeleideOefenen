import { appCorsJson, appCorsPreflight } from '@/lib/api/app-cors'
import { vraagIsToepassing } from '@/lib/practice/answer-prefix'
import {
  loadAllClusters,
  loadAllTopics,
  loadAlleVragen,
  loadChapters,
  loadParagraphs,
  loadTheoryBlocks,
} from '@/lib/practice/chapter-overview'
import { bouwOefenOverzicht } from '@/lib/practice/oefenen-indeling'
import { authenticateBearer } from '@/lib/supabase/bearer'

/**
 * Hoofdstuk → paragraaf → theorieblok → soorten sommen, voor het kiesscherm
 * van de app (AFG-558). Dezelfde boom als `/oefenen` op de site:
 * `bouwOefenOverzicht` komt rechtstreeks uit `oefenen-indeling.ts`, dus een
 * wijziging in de indeling van de site verschijnt vanzelf ook in de app.
 */
export async function GET(req: Request) {
  const auth = await authenticateBearer(req)
  if (!auth) return appCorsJson({ error: 'Niet ingelogd.' }, { status: 401 })

  const { supabase } = auth
  try {
    const [chapters, paragraphs, blocks, topics, clusters, vragen] = await Promise.all([
      loadChapters(supabase),
      loadParagraphs(supabase),
      loadTheoryBlocks(supabase),
      loadAllTopics(supabase),
      loadAllClusters(supabase),
      loadAlleVragen(supabase),
    ])

    const tiles = vragen.map((v) => ({
      clusterId: v.cluster_id,
      verhaal: vraagIsToepassing(v.latex_body, v.answer_prefix),
    }))

    const hoofdstukken = bouwOefenOverzicht({ chapters, paragraphs, blocks, topics, clusters, tiles })
    return appCorsJson({ hoofdstukken })
  } catch (e) {
    console.error('[app indeling] ophalen mislukt:', e)
    return appCorsJson({ error: 'Er ging iets mis. Probeer het nog eens.' }, { status: 500 })
  }
}

export function OPTIONS() {
  return appCorsPreflight()
}
