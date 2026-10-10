import { expect, test } from '@playwright/test'

import {
  TESTLEERLING,
  dashboardRegel,
  geefAntwoord,
  kiesOpgave,
  logIn,
  testDatabase,
} from './leerling'

/**
 * De weg van een leerling, van begin tot eind nagelopen in een echte browser:
 * inloggen → oefenen → antwoord nakijken → voortgang op het dashboard.
 *
 * De opgaven komen uit het testhoofdstuk in `supabase/seed.sql`, zodat de
 * tests niet omvallen als de echte oefenstof verandert.
 */

test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('een goed antwoord wordt goedgekeurd @telefoon', async ({ page }) => {
  // f(x) = 4x^3  →  f'(x) = 12x^2
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Goed antwoord (e2e)',
    nummer: 1,
  })

  await geefAntwoord(page, '12x^2')

  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  // Geen vast getal: deze test draait twee keer (computer én telefoon) op
  // dezelfde oefenleerling, dus de reeks staat de tweede keer een hoger.
  await expect(page.getByText(/\d van de 3 goed op rij/)).toBeVisible()
})

test('een fout antwoord wordt afgekeurd', async ({ page }) => {
  // g(x) = 5x^2 + 3x  →  g'(x) = 10x + 3, dus "10x" is fout
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Fout antwoord (e2e)',
    nummer: 2,
  })

  await geefAntwoord(page, '10x')

  await expect(
    page.getByRole('button', { name: 'Laat het goede antwoord zien' }),
  ).toBeVisible()
  await expect(page.getByText('Goed!', { exact: true })).toBeHidden()

  // En het goede antwoord staat er netjes als je erom vraagt.
  await page.getByRole('button', { name: 'Laat het goede antwoord zien' }).click()
  await expect(page.getByText('Juiste antwoord')).toBeVisible()
})

test('een goed antwoord in een andere notatie telt één keer', async ({ page }) => {
  // h(x) = 1/x  →  h'(x) = -x^-2. De leerling schrijft -1/x^2; dat is
  // hetzelfde antwoord, anders opgeschreven. Het mag niet eerst fout en
  // daarna nog eens goed geteld worden (zie AFG-5).
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Andere notatie (e2e)',
    nummer: 3,
  })

  await geefAntwoord(page, '-1/x^2')

  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()
  await expect(page.getByText('1 van de 3 goed op rij')).toBeVisible()
  await expect(page.getByText('2 van de 3 goed op rij')).toBeHidden()
})

test('na drie goede antwoorden staat het onderwerp op beheerst', async ({
  page,
}) => {
  const opgaven: Array<{ nummer: number; antwoord: string }> = [
    { nummer: 4, antwoord: '2x' }, // f(x) = x^2
    { nummer: 5, antwoord: '3x^2' }, // f(x) = x^3
    { nummer: 6, antwoord: '4x^3' }, // f(x) = x^4
  ]

  for (const [i, opgave] of opgaven.entries()) {
    await kiesOpgave(page, {
      soortSom: 'Drie goed op rij (e2e)',
      nummer: opgave.nummer,
    })
    await geefAntwoord(page, opgave.antwoord)

    if (i < opgaven.length - 1) {
      await expect(page.getByText(`${i + 1} van de 3 goed op rij`)).toBeVisible()
    } else {
      await expect(page.getByText('Geweldig, onderdeel afgerond!')).toBeVisible()
      // En de kaart belooft niets wat de site niet doet: er wordt niets
      // ontgrendeld, het onderdeel staat gewoon als afgerond (zie AFG-85).
      await expect(
        page.getByText(
          'Dit onderdeel staat nu als afgerond op je voortgangspagina.',
        ),
      ).toBeVisible()
    }
  }

  // En dat zie je terug op het dashboard.
  await page.goto('/nl/dashboard')
  const regel = await dashboardRegel(page, 'Beheersen (e2e)')
  await expect(regel).toContainText('1/1')
  await expect(regel).toContainText('100%')
})

test('een leerling kan een opgave melden die niet klopt @telefoon', async ({
  page,
}) => {
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Fout antwoord (e2e)',
    nummer: 2,
  })

  await page.getByRole('button', { name: 'Klopt niet?' }).click()
  await page.getByPlaceholder('Wat klopt er niet?').fill('Hier klopt iets niet (e2e)')
  await page.getByRole('button', { name: 'Versturen' }).click()

  await expect(page.getByText('Bedankt — we kijken er naar.')).toBeVisible()

  // En de melding komt echt in de database terecht, want daar leest
  // /admin/flags uit (zie AFG-8).
  const { data, error } = await testDatabase()
    .from('question_flags_new')
    .select('reason')
    .eq('user_id', TESTLEERLING.id)
  expect(error).toBeNull()
  expect(data?.map((r) => r.reason)).toContain('Hier klopt iets niet (e2e)')
})
