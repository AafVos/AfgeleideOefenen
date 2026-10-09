import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, type Locator, type Page } from '@playwright/test'

/**
 * De vaste testleerling uit `supabase/seed.sql`. Dit account bestaat alleen
 * op een lokale Supabase, dus het wachtwoord is hier geen geheim.
 */
export const TESTLEERLING = {
  id: 'e2e00000-0000-4000-8000-000000000001',
  email: 'leerling@test.local',
  wachtwoord: 'oefenen123',
}

/**
 * Een verbinding met de lokale testdatabase, om te controleren wat er
 * daadwerkelijk is opgeslagen. Alleen lokaal: de echte database is gedeeld
 * met integraaloefenen.nl.
 */
export function testDatabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Start de tests met `npm run test:e2e`.')
  }
  if (!['localhost', '127.0.0.1', '::1'].includes(new URL(url).hostname)) {
    throw new Error(`Niet lokaal: ${url}.`)
  }
  return createClient(url, serviceKey)
}

/** Het testhoofdstuk uit de seed. */
export const TESTHOOFDSTUK = {
  titel: 'Testhoofdstuk voor de e2e-tests',
  anker: '#hoofdstuk-e2e',
}

/**
 * Klik op een knop tot het verwachte gevolg zichtbaar is.
 *
 * De eerste klik op een pagina kan aankomen voordat de browser de pagina
 * helemaal klaar heeft staan; die klik doet dan niets. Dat overkomt een
 * leerling met een trage verbinding ook, en de test moet er niet op
 * omvallen.
 */
async function klikTot(knop: Locator, verwacht: Locator) {
  await expect(async () => {
    await knop.click()
    await expect(verwacht).toBeVisible({ timeout: 3_000 })
    // Na een klik in de zijbalk rolt de pagina rustig naar het juiste stuk,
    // en tijdens dat rollen past het menu zich nog aan. Even wachten tot dat
    // klaar is; anders klik je zo op iets wat net weer dichtklapt.
    await knop.page().waitForTimeout(1_200)
    await expect(verwacht).toBeVisible({ timeout: 1_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })
}

/** Inloggen zoals een leerling dat doet: formulier invullen en versturen. */
export async function logIn(page: Page) {
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(TESTLEERLING.email)
  await page.locator('input[name="password"]').fill(TESTLEERLING.wachtwoord)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
}

/**
 * Klik via het oefenoverzicht naar een opgave: hoofdstuk → onderwerp →
 * soort som → tegel. `onderwerp` mag weg als het onderwerp maar één soort
 * som heeft; in de zijbalk staat dan alleen die soort som.
 */
export async function kiesOpgave(
  page: Page,
  opgave: { onderwerp?: string; soortSom: string; nummer: number },
) {
  await page.goto('/nl/oefenen')

  const zijbalk = page.getByRole('complementary').first()
  const hoofdstuk = zijbalk.getByRole('button', { name: TESTHOOFDSTUK.titel })
  const soortSom = zijbalk.getByRole('button', { name: opgave.soortSom })

  if (opgave.onderwerp) {
    const onderwerp = zijbalk.getByRole('button', { name: opgave.onderwerp })
    await klikTot(hoofdstuk, onderwerp)
    await klikTot(onderwerp, soortSom)
  } else {
    await klikTot(hoofdstuk, soortSom)
  }
  await soortSom.click()

  await page
    .locator(TESTHOOFDSTUK.anker)
    .getByRole('link', { name: new RegExp(`^Opgave ${opgave.nummer}\\.`) })
    .click()

  await expect(nakijkKnop(page)).toBeVisible()
}

/**
 * De knop onder de opgave. `exact` is nodig: het onderwerp in de zijbalk
 * heet ook "Nakijken (e2e)".
 */
function nakijkKnop(page: Page): Locator {
  return page.getByRole('button', { name: 'Nakijken', exact: true })
}

/** Antwoord intypen en op Nakijken drukken. */
export async function geefAntwoord(page: Page, antwoord: string) {
  const invoer = page.getByPlaceholder('Bijv. 12x^2')
  const nakijken = nakijkKnop(page)

  // De knop staat uit zolang het antwoordveld leeg is. Gaat hij aan, dan
  // weten we zeker dat de pagina klaarstaat en dat het antwoord erin staat.
  await expect(async () => {
    await invoer.fill(antwoord)
    await expect(invoer).toHaveValue(antwoord, { timeout: 2_000 })
    await expect(nakijken).toBeEnabled({ timeout: 2_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })

  await nakijken.click()
}

/**
 * Klap het testhoofdstuk op het dashboard open en geef de regel van één
 * onderwerp terug.
 */
export async function dashboardRegel(
  page: Page,
  onderwerp: string,
): Promise<Locator> {
  const hoofdstuk = page.getByRole('button', { name: TESTHOOFDSTUK.titel })
  const regel = page.locator('li').filter({ hasText: onderwerp }).first()
  await klikTot(hoofdstuk, regel)
  return regel
}
