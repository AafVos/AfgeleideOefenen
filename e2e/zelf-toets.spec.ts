import { expect, test } from '@playwright/test'

import { logIn, TESTLEERLING, testDatabase } from './leerling'

/**
 * De uitslag van een zelf-toets blijft dicht tot de toets af is.
 *
 * De resultaat-URL is te raden: naast `/zelf-toets/loop/<id>` staat
 * `/zelf-toets/resultaat/<id>`. Een leerling die "pas aan het einde
 * feedback" koos, mag daar halverwege niet de juiste antwoorden zien van
 * vragen die hij nog moet maken (AFG-504).
 *
 * De toets zelf wordt hier rechtstreeks in de lokale testdatabase gezet: zo
 * staat precies vast dat hij nog loopt, zonder eerst een heel formulier in
 * te vullen. Daarna doet de test wat een leerling zou doen: de URL intypen.
 */
test('de uitslag van een zelf-toets blijft dicht tot de toets af is', async ({
  page,
}) => {
  const db = testDatabase()

  const { data: cluster, error: clusterFout } = await db
    .from('topic_clusters_new')
    .select('id')
    .eq('slug', 'e2e_rij')
    .single()
  if (clusterFout) throw new Error(clusterFout.message)

  const { data: vragen, error: vraagFout } = await db
    .from('questions_new')
    .select('id, answer')
    .eq('cluster_id', cluster.id)
    .order('difficulty')
    .limit(2)
  if (vraagFout) throw new Error(vraagFout.message)
  expect(vragen).toHaveLength(2)

  const { data: toets, error: toetsFout } = await db
    .from('user_sessions_new')
    .insert({
      user_id: TESTLEERLING.id,
      session_type: 'custom_test',
      name: 'Toets die nog loopt (e2e)',
      show_answers: 'end',
    })
    .select('id')
    .single()
  if (toetsFout) throw new Error(toetsFout.message)

  const { error: vragenFout } = await db.from('custom_test_questions').insert(
    vragen.map((vraag, i) => ({
      session_id: toets.id,
      question_id: vraag.id,
      order_index: i,
    })),
  )
  if (vragenFout) throw new Error(vragenFout.message)

  try {
    await logIn(page)

    // Halverwege de resultaat-URL intypen: geen uitslag, geen antwoorden.
    await page.goto(`/nl/zelf-toets/resultaat/${toets.id}`)
    await expect(page.getByText('Deze toets is nog niet af.')).toBeVisible()
    await expect(page.getByText('Je hebt er nu 0 van de 2.')).toBeVisible()
    await expect(page.getByText('Juiste antwoord')).toBeHidden()
    await expect(page.getByText('Oefen dit onderdeel')).toBeHidden()
    await expect(page.getByRole('link', { name: 'Doorgaan' })).toBeVisible()

    // Is de toets afgerond, dan hoort de uitslag er wél te staan.
    await db
      .from('user_sessions_new')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', toets.id)

    await page.reload()
    await expect(page.getByText('Deze toets is nog niet af.')).toBeHidden()
    await expect(page.getByRole('heading', { name: /0\s*\/\s*2/ })).toBeVisible()
    await expect(page.getByText('Juiste antwoord').first()).toBeVisible()
  } finally {
    // De testleerling is van alle tests samen: zijn toetsen horen niet in de
    // volgende test nog rond te slingeren.
    await db.from('user_sessions_new').delete().eq('id', toets.id)
  }
})
