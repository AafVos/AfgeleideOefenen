import { expect, test } from '@playwright/test'

import { geefAntwoord, testDatabase } from './leerling'

/**
 * Drie sommen zonder account. De opgaven komen uit het testhoofdstuk in
 * `supabase/seed.sql`, zodat de test niet omvalt als de echte oefenstof
 * verandert.
 */
test('drie sommen zonder account, daarna aanmelden @telefoon', async ({ page }) => {
  const db = testDatabase()
  const { count: voor, error } = await db
    .from('session_answers_new')
    .select('id', { count: 'exact', head: true })
  if (error) throw new Error(error.message)

  await page.goto('/nl/theorie/machtsregel')
  await page.getByRole('link', { name: 'Probeer 3 sommen' }).click()
  await expect(page).toHaveURL(/\/nl\/proberen\?chapter=h2&topic=h2_termsgewijs$/)
  await expect(page).not.toHaveURL(/inloggen/)
  await expect(page.getByText(/Som 1 van /)).toBeVisible()

  await page.goto(
    '/nl/proberen?chapter=e2e&topic=e2e_beheersen&cluster=e2e_rij',
  )
  await expect(page.getByText('Som 1 van 3')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Nakijken', exact: true })).toBeDisabled()

  // Een leeg of onzin-antwoord wordt niet goedgekeurd. Het stappenplan
  // komt pas als je het goede antwoord laat zien.
  await geefAntwoord(page, 'onzin')
  await expect(page.getByText('Goed!', { exact: true })).toBeHidden()
  await expect(page.getByText('Niet helemaal goed')).toBeVisible()
  await page.getByRole('button', { name: 'Laat het goede antwoord zien' }).click()
  await expect(page.getByText('Schrijf de macht naar voren')).toBeVisible()

  await page.getByRole('button', { name: 'Volgende som' }).click()
  await expect(page.getByText('Som 2 van 3')).toBeVisible()
  await geefAntwoord(page, '3x^2')
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await expect(page.getByText('Schrijf de macht naar voren')).toBeVisible()

  await page.getByRole('button', { name: 'Volgende som' }).click()
  await expect(page.getByText('Som 3 van 3')).toBeVisible()
  await geefAntwoord(page, '4x^3')
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Klaar' }).click()

  await expect(page.getByRole('heading', { name: 'Goed bezig!' })).toBeVisible()
  await expect(
    page.getByText('Maak een gratis account om je voortgang te bewaren en verder te oefenen'),
  ).toBeVisible()

  await page.getByRole('link', { name: 'Account aanmaken' }).click()
  await expect(page).toHaveURL(/\/nl\/registreren\?van=proberen$/)
  await expect(page.locator('input[name="van"]')).toHaveValue('proberen')

  const { count: na, error: naFout } = await db
    .from('session_answers_new')
    .select('id', { count: 'exact', head: true })
  if (naFout) throw new Error(naFout.message)
  expect(na).toBe(voor)

  const namen = (await page.context().cookies()).map((cookie) => cookie.name)
  expect(namen.some((naam) => /proberen|analytics|gtag/i.test(naam))).toBe(false)
})

test('de oefenpagina blijft achter de inlog', async ({ page }) => {
  await page.goto('/nl/oefenen')
  await expect(page).toHaveURL(/\/nl\/inloggen/)
})

/**
 * AFG-665: een klik tussen het antwoordblok en de knoppenrij (de marge van
 * space-y-3) landde rechtstreeks op het <form>-element en deed niets — een
 * dode klik die de bezoeker als een kapotte pagina ervaart. Zo'n klik hoort
 * nu het antwoordveld te focussen.
 */
test('een klik in de marge van het antwoordformulier focust het antwoordveld', async ({
  page,
}) => {
  await page.goto('/nl/proberen?chapter=e2e&topic=e2e_beheersen&cluster=e2e_rij')
  await expect(page.getByText('Som 1 van 3')).toBeVisible()

  const label = page.locator('form label')
  const knoppenrij = page.getByRole('button', { name: 'Nakijken' }).locator('..')
  const labelBox = await label.boundingBox()
  const knoppenrijBox = await knoppenrij.boundingBox()
  if (!labelBox || !knoppenrijBox) throw new Error('kon de vorm van het formulier niet lezen')

  // Het midden van de marge tussen het antwoordblok en de knoppenrij: geen
  // enkel kind-element dekt dit stukje, dus dit landt op het formulier zelf.
  const x = labelBox.x + 20
  const y = (labelBox.y + labelBox.height + knoppenrijBox.y) / 2
  await page.mouse.click(x, y)

  await expect(page.getByPlaceholder('Typ je antwoord')).toBeFocused()
})

test('de voorbeeldpagina heeft dezelfde knop, met van=voorbeeld voor de bronmeting', async ({
  page,
}) => {
  await page.goto('/nl/voorbeeld/wortel-x')
  await page.getByRole('link', { name: 'Probeer 3 sommen' }).click()
  await expect(page).toHaveURL(
    /\/nl\/proberen\?chapter=h6&topic=h6_machten&cluster=wortelvorm&van=voorbeeld$/,
  )
  await expect(page).not.toHaveURL(/inloggen/)
  await expect(page.getByText(/Som 1 van /)).toBeVisible()
})

test('een uitlegvideo-pagina heeft een knop "Oefen dit nu", met van=uitlegvideo voor de bronmeting', async ({
  page,
}) => {
  await page.goto('/nl/uitleg-videos/machten-herschrijven')
  await page.getByRole('link', { name: 'Oefen dit nu' }).click()
  await expect(page).toHaveURL(
    /\/nl\/proberen\?chapter=h6&topic=h6_machten&cluster=negatieve_macht&van=uitlegvideo$/,
  )
  await expect(page).not.toHaveURL(/inloggen/)
  await expect(page.getByText(/Som 1 van /)).toBeVisible()
})
