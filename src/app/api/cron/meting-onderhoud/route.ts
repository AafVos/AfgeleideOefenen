import { createServiceRoleClient } from '@/lib/supabase/server'

/**
 * De nachtelijke taak die de dagtotalen van de klikmeting bijwerkt en oude
 * gebeurtenissen opruimt (AFG-667). Roept `site_meting_onderhoud()` aan
 * (migraties 0072 en 0081); die doet zelf hoogstens één keer per dag iets en
 * vult ontbrekende dagen aan vanaf waar hij gebleven was.
 *
 * Eerder liftte dit mee op 1% van de verzoeken naar `/api/meet`. Bij weinig
 * verkeer (zoals in een schoolvakantie) kon dat dagenlang niet gebeuren,
 * waardoor de dagtotalen stil bleven staan terwijl er wel gebeurtenissen
 * binnenkwamen. Deze database heeft geen pg_cron, dus roepen we dit nu elke
 * nacht aan via de Worker-cron, net als `/api/cron/herinneringen`. Zie de
 * `scheduled`-ingang in `scripts/statische-cache.mjs` en `triggers.crons` in
 * `wrangler.jsonc`.
 *
 * Met de hand draaien kan ook:
 *
 *   curl -X POST -H "x-webhook-secret: $WEBHOOK_SECRET" \
 *     http://localhost:3000/api/cron/meting-onderhoud
 */
export async function POST(req: Request) {
  const geheim = process.env.WEBHOOK_SECRET
  if (!geheim || req.headers.get('x-webhook-secret') !== geheim) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await createServiceRoleClient().rpc('site_meting_onderhoud')
  if (error) {
    console.error('[meting onderhoud]', error.message)
    return Response.json({ error: 'Mislukt' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
