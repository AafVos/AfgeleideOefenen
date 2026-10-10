import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { TESTLEERLING, WEGWERP_ADRES_BEGIN } from './leerling'
import { leegPostbus } from './postbus'

/**
 * Draait één keer vóór alle e2e-tests.
 *
 * 1. Controleert dat we tegen een LOKALE Supabase werken. De echte database
 *    is gedeeld met integraaloefenen.nl; daar mag een test nooit aankomen.
 * 2. Veegt de voortgang van de testleerling schoon en zet de oefenstof van
 *    het testhoofdstuk terug in de begintoestand, zodat elke run hetzelfde
 *    begint — ook als je de tests twee keer achter elkaar draait.
 * 3. Ruimt de wegwerpaccounts en de mail van een vorige run op.
 */
export default async function schoneStart() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL en SUPABASE_SERVICE_ROLE_KEY ontbreken. Start de tests met `npm run test:e2e`.',
    )
  }

  const host = new URL(url).hostname
  if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
    throw new Error(
      `De e2e-tests draaien alleen tegen een lokale Supabase, niet tegen ${url}.`,
    )
  }

  const db = createClient(url, serviceKey)

  await ruimWegwerpAccountsOp(db)
  // Mail van een vorige run weg, anders ziet een test die op een
  // bevestigingsmail wacht misschien een oude aan voor een verse.
  await leegPostbus()

  // Welke vragen horen bij het testhoofdstuk?
  const ONDERWERPEN = ['e2e_nakijken', 'e2e_beheersen', 'e2e_uitwerking']
  const { data: topics, error: topicError } = await db
    .from('topics_new')
    .select('id, slug')
    .in('slug', ONDERWERPEN)
  if (topicError) throw new Error(topicError.message)

  const topicIds = (topics ?? []).map((t) => t.id)
  if (topicIds.length !== ONDERWERPEN.length) {
    throw new Error(
      'De oefenstof voor de e2e-tests staat niet in de database. Draai eerst `npx supabase db reset`.',
    )
  }

  // Het onderwerp "Uitwerking (e2e)" heeft een vast stappenplan uit de seed;
  // dat moet blijven staan, want de knop "Ik weet het niet" laat het zien.
  const uitwerkingTopicId = (topics ?? []).find(
    (t) => t.slug === 'e2e_uitwerking',
  )?.id

  const { data: vragen, error: vraagError } = await db
    .from('questions_new')
    .select('id, topic_id')
    .in('topic_id', topicIds)
  if (vraagError) throw new Error(vraagError.message)
  const vraagIds = (vragen ?? []).map((q) => q.id)
  const vraagIdsMetAiStappen = (vragen ?? [])
    .filter((q) => q.topic_id !== uitwerkingTopicId)
    .map((q) => q.id)

  // Voortgang van de testleerling weg (sessies nemen hun antwoorden mee).
  await db.from('user_sessions_new').delete().eq('user_id', TESTLEERLING.id)
  await db.from('user_progress_new').delete().eq('user_id', TESTLEERLING.id)
  // Ook de gemelde opgaven: een leerling mag dezelfde opgave maar één keer
  // melden, dus anders meldt de volgende run niets meer.
  await db.from('question_flags_new').delete().eq('user_id', TESTLEERLING.id)

  // De rondleiding heeft deze leerling gezien; anders dekt hij knoppen af.
  await db
    .from('profiles')
    .update({ tour_seen_at: new Date().toISOString() })
    .eq('id', TESTLEERLING.id)

  // Wat de AI-controle eerder opsloeg, hoort niet in een volgende run mee te
  // tellen: dan zou "goed antwoord in andere notatie" al vanuit de database
  // goedgekeurd worden en test je het AI-pad niet meer.
  if (vraagIds.length > 0) {
    await db
      .from('questions_new')
      .update({ answer_alternatives: [] })
      .in('id', vraagIds)
    await db.from('known_wrong_answers_new').delete().in('question_id', vraagIds)
  }
  if (vraagIdsMetAiStappen.length > 0) {
    await db
      .from('question_steps_new')
      .delete()
      .in('question_id', vraagIdsMetAiStappen)
  }
}

/**
 * De tests die registreren maken elke run een paar nieuwe accounts aan. Die
 * horen niet te blijven staan: anders groeit de lokale database bij elke run
 * en wordt het zoeken naar een echte fout lastiger.
 */
async function ruimWegwerpAccountsOp(db: SupabaseClient) {
  // `listUsers` geeft per keer maximaal honderd rijen; meer dan één pagina
  // aan wegwerpaccounts hoort er niet te zijn, maar we lopen ze netjes af.
  for (let pagina = 1; pagina <= 20; pagina += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page: pagina, perPage: 100 })
    if (error) throw new Error(error.message)

    const wegwerp = (data.users ?? []).filter((u) =>
      u.email?.startsWith(WEGWERP_ADRES_BEGIN),
    )
    for (const gebruiker of wegwerp) {
      await db.auth.admin.deleteUser(gebruiker.id)
    }

    if ((data.users ?? []).length < 100) return
  }
}
