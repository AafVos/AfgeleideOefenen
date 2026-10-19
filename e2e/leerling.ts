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
 * De tweede testleerling uit `supabase/seed.sql`: net aangemeld, heeft de
 * rondleiding nog nooit gezien. Apart account, zodat de rondleiding niet
 * over de knoppen van de andere tests heen valt.
 */
export const NIEUWE_LEERLING = {
  id: 'e2e00000-0000-4000-8000-000000000003',
  email: 'nieuw@test.local',
  wachtwoord: 'oefenen123',
}

/**
 * Het begin van elk adres dat een test zelf aanmaakt. `e2e/schone-start.ts`
 * veegt alles met dit begin weg, zodat de lokale database niet volloopt met
 * wegwerpaccounts.
 */
export const WEGWERP_ADRES_BEGIN = 'nieuw-'

/** Vast wachtwoord voor de accounts die de tests zelf aanmaken. Lokaal, dus geen geheim. */
export const WEGWERP_WACHTWOORD = 'oefenen123'

let teller = 0

/**
 * Een adres dat nog nooit gebruikt is. Uniek per run én per test: twee tests
 * mogen elkaars bevestigingsmail niet oppakken.
 */
export function uniekAdres(): string {
  teller += 1
  return `${WEGWERP_ADRES_BEGIN}${Date.now()}-${teller}@test.local`
}

/**
 * Een verbinding met de lokale testdatabase, om te controleren wat er
 * daadwerkelijk is opgeslagen. Alleen lokaal: de echte database is de
 * productiedatabase met echte accounts en voortgang.
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
  slug: 'e2e',
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
export async function logIn(
  page: Page,
  leerling: { email: string; wachtwoord: string } = TESTLEERLING,
) {
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(leerling.email)
  await page.locator('input[name="password"]').fill(leerling.wachtwoord)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
}

/** Uitloggen zoals een leerling dat doet: via het menu in de bovenbalk. */
export async function logUit(page: Page, naamInMenu: string) {
  // Op een smal scherm zit het menu achter het hamburgerknopje; daarboven
  // achter het rondje met de eerste letter van je naam.
  const smal = (page.viewportSize()?.width ?? 0) < 768
  await page
    .getByRole('button', { name: smal ? 'Menu openen' : naamInMenu, exact: !smal })
    .click()

  await page.getByRole('button', { name: 'Uitloggen' }).click()

  // Echt uitgelogd: het dashboard stuurt je nu terug naar de inlogpagina.
  await page.goto('/nl/dashboard')
  await expect(page).toHaveURL(/\/nl\/inloggen/)
}

/**
 * Klik de rondleiding weg die bij een kersverse leerling vanzelf start, zodat
 * hij de knoppen eronder niet afdekt.
 *
 * Hij start op computer en telefoon, maar alleen bij een leerling die hem
 * nog nooit gezien heeft (zie `rondleiding.spec.ts`). Komt hij niet, dan valt
 * er ook niets weg te klikken.
 */
export async function sluitRondleiding(page: Page) {
  const ballon = page.getByRole('dialog')
  const gestart = await ballon
    .waitFor({ state: 'visible', timeout: 5_000 })
    .then(() => true)
    .catch(() => false)
  if (!gestart) return

  await page.getByRole('button', { name: 'Overslaan' }).click()
  await expect(ballon).toBeHidden()
}

/**
 * Open een opgave in het testhoofdstuk.
 *
 * Dat hoofdstuk heeft geen boekparagrafen, dus de pagina toont alle tegels
 * onder elkaar, genummerd over het hele hoofdstuk. `onderwerp` en `soortSom`
 * blijven in de aanroep staan zodat een test laat zien wélke som hij maakt;
 * de tegel zelf zoek je op nummer.
 */
export async function kiesOpgave(
  page: Page,
  opgave: { onderwerp?: string; soortSom: string; nummer: number },
) {
  await page.goto(`/nl/oefenen?chapter=${TESTHOOFDSTUK.slug}`)

  const tegel = page
    .locator(TESTHOOFDSTUK.anker)
    .getByRole('link', { name: new RegExp(`^Opgave ${opgave.nummer}\\.`) })

  // De eerste klik kan aankomen voordat de pagina klaarstaat; die doet dan
  // niets. Dat overkomt een leerling met een trage verbinding ook.
  await expect(async () => {
    await tegel.click()
    await expect(nakijkKnop(page)).toBeVisible({ timeout: 3_000 })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })
}

/**
 * De knop onder de opgave. `exact` is nodig: het onderwerp in de zijbalk
 * heet ook "Nakijken (e2e)".
 */
function nakijkKnop(page: Page): Locator {
  return page.getByRole('button', { name: 'Nakijken', exact: true })
}

/**
 * Antwoord intypen en op Nakijken drukken. Werkt op /oefenen, de zelf-toets
 * en /proberen: die laatste heeft een neutraal voorbeeld in het antwoordvak
 * (verklapt anders het antwoord), de andere twee een voorbeeldinvoer.
 */
export async function geefAntwoord(page: Page, antwoord: string) {
  const invoer = page.getByPlaceholder(/Bijv\. 12x\^2|Typ je antwoord/)
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

/**
 * Het getal op een van de kaarten bovenaan het dashboard, bijvoorbeeld
 * "Dagen op rij". Het getal staat in het blokje direct onder het kopje.
 */
export function dashboardKaart(page: Page, kopje: string): Locator {
  return page
    .getByText(kopje, { exact: true })
    .first()
    .locator('xpath=following-sibling::div[1]')
}
