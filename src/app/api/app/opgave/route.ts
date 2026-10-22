import { appCorsJson, appCorsPreflight } from '@/lib/api/app-cors'
import { answerPrefix } from '@/lib/practice/answer-prefix'
import {
  loadLaatsteAntwoorden,
  loadQuestionNew,
  loadVragenVoorCluster,
} from '@/lib/practice/chapter-overview'
import { authenticateBearer } from '@/lib/supabase/bearer'

/**
 * Eén opgave om te oefenen, voor een gekozen soort som (AFG-558).
 *
 * De site toont per soort som een heel tegeloverzicht waar de leerling zelf
 * een opgave uit kiest; de app toont er één tegelijk, zoals een setje
 * flashcards. Welke dat is: de eerste in boekvolgorde (moeilijkheid, dan
 * `order_index`) die deze leerling niet als laatste goed had — oefenen blijft
 * dus vanzelf bij wat nog niet lukt. Zijn ze allemaal laatst goed, dan
 * gewoon de eerste, om te blijven herhalen.
 */
export async function GET(req: Request) {
  const auth = await authenticateBearer(req)
  if (!auth) return appCorsJson({ error: 'Niet ingelogd.' }, { status: 401 })

  const clusterId = new URL(req.url).searchParams.get('clusterId')
  if (!clusterId) return appCorsJson({ error: 'clusterId ontbreekt.' }, { status: 400 })

  const { supabase } = auth
  try {
    const [vragen, cluster, laatsteGoed] = await Promise.all([
      loadVragenVoorCluster(supabase, clusterId),
      supabase.from('topic_clusters_new').select('title').eq('id', clusterId).maybeSingle(),
      loadLaatsteAntwoorden(supabase),
    ])

    if (vragen.length === 0) {
      return appCorsJson({ error: 'Geen opgaven in deze soort som.' }, { status: 404 })
    }

    const volgende = vragen.find((v) => laatsteGoed.get(v.id) !== true) ?? vragen[0]
    const opgave = await loadQuestionNew(supabase, volgende.id)
    if (!opgave) return appCorsJson({ error: 'Opgave niet gevonden.' }, { status: 404 })

    return appCorsJson({
      clusterTitle: cluster.data?.title?.trim() ?? '',
      aantalOpgaven: vragen.length,
      opgave: {
        ...opgave,
        answerPrefix: answerPrefix(opgave.latex_body, opgave.answer_prefix),
      },
    })
  } catch (e) {
    console.error('[app opgave] ophalen mislukt:', e)
    return appCorsJson({ error: 'Er ging iets mis. Probeer het nog eens.' }, { status: 500 })
  }
}

export function OPTIONS() {
  return appCorsPreflight()
}
