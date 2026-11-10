import { expect, test } from '@playwright/test'

import {
  TESTHOOFDSTUK,
  TESTLEERLING,
  dashboardKaart,
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
  // Bij twee goed op rij vervangt "nog één goed" de gewone reekszin.
  await expect(
    page.getByText(/\d van de 3 goed op rij|Nog één goed, dan beheers je/),
  ).toBeVisible()
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

  // De korte uitleg waarom dit antwoord fout is, staat meteen op het scherm.
  const uitleg = page.getByRole('status')
  await expect(uitleg).toContainText('Wat ging er mis?')
  await expect(uitleg).toContainText(
    'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
  )

  // En het goede antwoord staat er netjes als je erom vraagt. De uitleg
  // blijft staan, ook naast het stappenplan.
  await page.getByRole('button', { name: 'Laat het goede antwoord zien' }).click()
  await expect(page.getByText('Juiste antwoord')).toBeVisible()
  await expect(page.getByText(/stappenplan/i)).toBeVisible()
  await expect(uitleg).toContainText(
    'Je antwoord is niet correct. Kijk je tussenstappen eens goed na.',
  )
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

    if (i === 1) {
      await expect(
        page.getByText('Nog één goed, dan beheers je Drie goed op rij (e2e).'),
      ).toBeVisible()
      await expect(page.getByText('2 van de 3 goed op rij')).toBeHidden()
    } else if (i < opgaven.length - 1) {
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

  // De kaarten bovenaan tellen alles wat de leerling ooit gedaan heeft,
  // niet alleen de laatste twee weken (zie AFG-106).
  await expect(dashboardKaart(page, 'Dagen op rij')).toHaveText('1')
  const beantwoord = await dashboardKaart(page, 'Vragen').innerText()
  expect(Number(beantwoord)).toBeGreaterThanOrEqual(opgaven.length)

  const regel = await dashboardRegel(page, 'Beheersen (e2e)')
  await expect(regel).toContainText('1/1')
  await expect(regel).toContainText('100%')
})

/**
 * AFG-808: de volgende opgave (via "Volgende", of via het opgavenummer in de
 * zijbalk) moest soms nog van de server komen — nog niet in de cache van de
 * browser. Zonder zichtbare feedback leek dat niets te doen, en leerlingen
 * gingen dan verder klikken: op het opgavenummer, of op een leeg vlak. Dit
 * test dat er binnen een seconde iets te zien is, en dat "Volgende" én het
 * opgavenummer daarna gewoon naar de nieuwe opgave gaan.
 */
test('bij een trage verbinding blijft "Volgende" en het opgavenummer werken', async ({
  page,
}) => {
  await page.goto(`/nl/oefenen?chapter=${TESTHOOFDSTUK.slug}`)
  const hoofdstuk = page.locator(TESTHOOFDSTUK.anker)

  // Een tegel buiten "Trage verbinding (e2e)", voor de klik op het
  // opgavenummer verderop: "Volgende" gaat daar nooit vanzelf naartoe, dus
  // die staat gegarandeerd nog niet in de cache van de browser.
  // De tekst van de bronregel staat ook in het (langere) opschrift van de
  // tegel zelf; de link van de bronregel gaat naar de externe bron (geen
  // vraag-id), dus de tegel zelf (de laatste treffer) is wat we willen.
  const bronHref = await hoofdstuk
    .getByRole('link', { name: /CE vwo wiskunde B 2099/ })
    .last()
    .getAttribute('href')
  if (!bronHref) throw new Error('kon de bron-testopgave niet vinden')
  const bronVraagId = new URL(bronHref, 'http://localhost').searchParams.get('q')
  if (!bronVraagId) throw new Error('de bron-testopgave heeft geen vraag-id in de link')

  const eersteTegel = hoofdstuk.getByRole('link', { name: /f\(x\) = 9x/ })
  // De eerste klik kan aankomen voordat de pagina klaarstaat; die doet dan
  // niets. Dat overkomt een leerling met een trage verbinding ook.
  await expect(async () => {
    await eersteTegel.click()
    await expect(
      page.getByRole('button', { name: 'Nakijken', exact: true }),
    ).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  await geefAntwoord(page, '9')

  // Simuleer een trage verbinding: de volgende opgave en de opgave uit de
  // zijbalk staan nog niet in de cache van de browser.
  await page.route('**/oefenen*', async (route) => {
    if (route.request().method() === 'POST') {
      await new Promise((resolve) => setTimeout(resolve, 1_200))
    }
    await route.continue()
  })

  await page.getByRole('button', { name: 'Volgende' }).click()
  await expect(page.getByText('Opgave openen…')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible({ timeout: 5_000 })

  // Het opgavenummer in de zijbalk (niet de tegel uit het overzicht) werkt
  // ook nog, naar de bron-opgave die nog nergens in deze pagina geopend is.
  await page.locator('aside').locator(`a[href*="q=${bronVraagId}"]`).click()
  await expect(page.getByText('Opgave openen…')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible({ timeout: 5_000 })
})

/**
 * AFG-665: in een dashboardrij was alleen de titeltekst een link; het
 * bolletje en de cijfers ernaast waren losse tekst zonder link eromheen.
 * Een klik daar landde op de rij zelf en deed niets, terwijl de hele rij
 * er als één klikbaar blok uitziet. De hele rij hoort naar /oefenen te
 * linken, niet alleen de titel.
 */
test('een klik op de cijfers in een dashboardrij opent de oefenpagina', async ({
  page,
}) => {
  const regel = await dashboardRegel(page, 'Beheersen (e2e)')
  await regel.getByText(/^\d+%$/).click()
  await expect(page).toHaveURL(/\/nl\/oefenen\?chapter=e2e&topic=e2e_beheersen/)
})

test('wie een opgave niet weet, krijgt de uitwerking zonder te gokken @telefoon', async ({
  page,
}) => {
  // f(x) = x^5  →  f'(x) = 5x^4. De leerling weet het niet en typt niets.
  await kiesOpgave(page, { soortSom: 'Ik weet het niet (e2e)', nummer: 7 })

  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeDisabled()

  // `exact`: in de zijbalk staat ook "Ik weet het niet (e2e)".
  const nietWeten = page.getByRole('button', {
    name: 'Ik weet het niet',
    exact: true,
  })
  // Met een duim te raken.
  const vak = await nietWeten.boundingBox()
  expect(vak?.height ?? 0).toBeGreaterThanOrEqual(44)
  await nietWeten.click()

  // Het goede antwoord én het stappenplan staan er.
  await expect(page.getByText('Juiste antwoord')).toBeVisible()
  await expect(page.getByText('Stappenplan')).toBeVisible()
  await expect(page.getByText('Gebruik de machtsregel')).toBeVisible()

  // Deze opgave is niet als fout nagekeken.
  await expect(page.getByText('Jouw antwoord')).toBeHidden()

  // Deze sessie nog geen antwoord gehad: zachte zet om het toch te typen
  // (AFG-883), naast de knop om de som alsnog te proberen.
  await expect(
    page.getByText('Probeer het toch nog eens zelf te typen'),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Opnieuw proberen' })).toBeVisible()
  await page.getByRole('button', { name: 'Volgende' }).click()
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible()

  // In de database staat het anders dan een fout antwoord: geen antwoord,
  // geen goed/fout, en hulp opgevraagd (zie AFG-102).
  const { data, error } = await testDatabase()
    .from('session_answers_new')
    .select('user_answer, is_correct, hints_used, user_sessions_new!inner(user_id)')
    .eq('user_sessions_new.user_id', TESTLEERLING.id)
    .is('is_correct', null)
  expect(error).toBeNull()
  expect(data?.length ?? 0).toBeGreaterThan(0)
  expect(data?.[0]).toMatchObject({
    user_answer: null,
    is_correct: null,
    hints_used: 1,
  })

  // En het telt niet mee als poging: de teller van dit onderdeel blijft 0,
  // dus het percentage goed verandert er niet van.
  const { data: voortgang } = await testDatabase()
    .from('user_progress_new')
    .select('total_answered, total_correct, topic_clusters_new!inner(slug)')
    .eq('user_id', TESTLEERLING.id)
    .eq('topic_clusters_new.slug', 'e2e_niet_weten')
  expect(voortgang?.[0]).toMatchObject({ total_answered: 0, total_correct: 0 })
})

/**
 * AFG-883: wie deze sessie al een antwoord verzonden heeft (goed of fout),
 * ziet de zachte zet niet meer bij een volgende Overslaan — dat is het
 * bestaande skip-gedrag, ongewijzigd.
 */
test('na een eerder antwoord deze sessie blijft de zachte zet bij Overslaan weg', async ({
  page,
}) => {
  // Eerst één antwoord geven, goed of fout maakt niet uit.
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Goed antwoord (e2e)',
    nummer: 1,
  })
  await geefAntwoord(page, '12x^2')
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()

  // Dan een andere opgave overslaan: f(x) = x^6  →  f'(x) = 6x^5.
  await kiesOpgave(page, { soortSom: 'Ik weet het niet (e2e)', nummer: 8 })
  await page.getByRole('button', { name: 'Ik weet het niet', exact: true }).click()

  await expect(page.getByText('Juiste antwoord')).toBeVisible()
  await expect(
    page.getByText('Probeer het toch nog eens zelf te typen'),
  ).toBeHidden()
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
