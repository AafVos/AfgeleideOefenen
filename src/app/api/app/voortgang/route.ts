import { appCorsJson, appCorsPreflight } from '@/lib/api/app-cors'
import { bouwOnderwerpVoortgang, telBeheerst } from '@/lib/dashboard/indeling'
import { loadAllClusters, loadAllTopics, loadChapters, loadVoortgang } from '@/lib/practice/chapter-overview'
import { authenticateBearer } from '@/lib/supabase/bearer'

export type VoortgangSoort = {
  id: string
  title: string
  isKnown: boolean
  correctStreak: number
}

export type VoortgangHoofdstuk = {
  id: string
  slug: string
  title: string
  mastered: number
  total: number
  pct: number
  soorten: VoortgangSoort[]
}

/**
 * Voortgang per hoofdstuk en soort som, voor het tabblad Voortgang van de app
 * (AFG-560). Zelfde berekening als het dashboard van de site:
 * `bouwOnderwerpVoortgang` en `telBeheerst` komen rechtstreeks uit
 * `lib/dashboard/indeling.ts`, dus de cijfers zijn hier identiek.
 */
export async function GET(req: Request) {
  const auth = await authenticateBearer(req)
  if (!auth) return appCorsJson({ error: 'Niet ingelogd.' }, { status: 401 })

  const { supabase, userId } = auth
  try {
    const [chapters, topics, clusters, voortgang] = await Promise.all([
      loadChapters(supabase),
      loadAllTopics(supabase),
      loadAllClusters(supabase),
      loadVoortgang(supabase, userId),
    ])

    const oud = bouwOnderwerpVoortgang({ chapters, topics, clusters, voortgang })

    const hoofdstukken: VoortgangHoofdstuk[] = oud.map((hoofdstuk) => {
      const soorten = hoofdstuk.topics.flatMap((topic) => topic.clusters)
      const { mastered, total, pct } = telBeheerst(soorten)
      return {
        id: hoofdstuk.id,
        slug: hoofdstuk.slug,
        title: hoofdstuk.title,
        mastered,
        total,
        pct,
        soorten: soorten.map((cluster) => ({
          id: cluster.id,
          title: cluster.title,
          isKnown: cluster.isKnown,
          correctStreak: cluster.correctStreak,
        })),
      }
    })

    return appCorsJson({ hoofdstukken })
  } catch (e) {
    console.error('[app voortgang] ophalen mislukt:', e)
    return appCorsJson({ error: 'Er ging iets mis. Probeer het nog eens.' }, { status: 500 })
  }
}

export function OPTIONS() {
  return appCorsPreflight()
}
