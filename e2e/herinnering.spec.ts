import { expect, test, type APIRequestContext } from '@playwright/test'

import { WEGWERP_WACHTWOORD, logIn, testDatabase, uniekAdres } from './leerling'
import { linkUitMail, sitemails, wachtOpSitemail } from './postbus'

/**
 * De opt-in herinneringsmail (zie AFG-487).
 *
 * De nachtelijke taak draait op Cloudflare met een cron-trigger, maar het werk
 * zelf zit in een gewone route. Die roepen we hier met het testgeheim aan, dus
 * er hoeft geen dag voorbij te gaan om dit na te lopen.
 *
 * De mail gaat via Resend en komt dus in de neppe Resend van `scripts/e2e.mjs`
 * terecht, niet in de testpostbus van Supabase.
 *
 * Elke test maakt een eigen wegwerpaccount. De vaste testleerling gebruiken we
 * hier bewust niet: of die net geoefend heeft, hangt af van welke tests er
 * eerder liepen, en juist dát bepaalt of er een herinnering uit mag.
 */

const CRON_PAD = '/api/cron/herinneringen'
const DAG_MS = 24 * 60 * 60 * 1000

function webhookGeheim(): string {
  const geheim = process.env.WEBHOOK_SECRET
  if (!geheim) throw new Error('Start de tests met `npm run test:e2e`.')
  return geheim
}

/** De taak draaien zoals de Worker dat 's avonds doet. */
async function draaiTaak(request: APIRequestContext, geheim = webhookGeheim()) {
  return request.post(CRON_PAD, { headers: { 'x-webhook-secret': geheim } })
}

type NieuwAccount = {
  /** Hoeveel dagen geleden de herinnering aangezet is. Weglaten = uit. */
  stilDagen?: number
  /** Zet een voortgangsregel klaar, zodat het dashboard niet het startblok toont. */
  alBegonnen?: boolean
}

/** Een vers account dat verder nergens in de tests gebruikt wordt. */
async function maakLeerling(opties: NieuwAccount = {}) {
  const db = testDatabase()
  const email = uniekAdres()
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: WEGWERP_WACHTWOORD,
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(error?.message ?? 'account niet aangemaakt')
  const id = data.user.id

  // De rondleiding heeft deze leerling gezien; anders dekt hij de kaart af.
  const aan = opties.stilDagen !== undefined
  const { error: updateFout } = await db
    .from('profiles')
    .update({
      tour_seen_at: new Date().toISOString(),
      herinnering_mail: aan,
      // Deze leerling heeft nog nooit geoefend, dus de stilte telt vanaf het
      // moment dat hij de herinnering aanzette.
      herinnering_aan_sinds: aan
        ? new Date(Date.now() - opties.stilDagen! * DAG_MS).toISOString()
        : null,
    })
    .eq('id', id)
  if (updateFout) throw new Error(updateFout.message)

  if (opties.alBegonnen) await zetVoortgangKlaar(id)

  const { data: profiel } = await db
    .from('profiles')
    .select('herinnering_sleutel')
    .eq('id', id)
    .single()

  return { id, email, sleutel: profiel!.herinnering_sleutel as string }
}

/**
 * Eén voortgangsregel. Het dashboard laat de rechterkolom — en dus de kaart —
 * pas zien zodra een leerling ergens aan begonnen is; daarvóór staat er één
 * startknop en verder niets (zie AFG-114).
 */
async function zetVoortgangKlaar(userId: string) {
  const db = testDatabase()
  const { data: cluster, error } = await db
    .from('topic_clusters_new')
    .select('id, topic_id')
    .order('order_index')
    .limit(1)
    .single()
  if (error || !cluster) throw new Error(error?.message ?? 'geen soort som gevonden')

  const { error: insertFout } = await db.from('user_progress_new').insert({
    user_id: userId,
    topic_id: cluster.topic_id,
    cluster_id: cluster.id,
    status: 'in_progress',
  })
  if (insertFout) throw new Error(insertFout.message)
}

/** Alleen de herinneringen; andere mail van de site telt hier niet mee. */
async function herinneringen(adres: string) {
  return sitemails(adres, { onderwerpBevat: 'Verder met' })
}

async function staatAan(userId: string): Promise<boolean> {
  const { data } = await testDatabase()
    .from('profiles')
    .select('herinnering_mail')
    .eq('id', userId)
    .single()
  return data?.herinnering_mail === true
}

test('de leerling zet de herinnering zelf aan, na de vraag of hij 16 is @telefoon', async ({
  page,
}) => {
  const leerling = await maakLeerling({ alBegonnen: true })
  await logIn(page, { email: leerling.email, wachtwoord: WEGWERP_WACHTWOORD })

  const kaart = page.getByText('Herinnering per mail').locator('..')
  await expect(kaart.getByText('Staat uit.')).toBeVisible()

  // Eerst de leeftijdsvraag; pas daarna gaat hij echt aan.
  await kaart.getByRole('button', { name: 'Zet aan' }).click()
  await expect(kaart.getByText('Ben je 16 of ouder?')).toBeVisible()

  // Wie nee zegt, krijgt hem niet.
  await kaart.getByRole('button', { name: 'Nee' }).click()
  await expect(kaart.getByText('Dan zetten we hem niet aan.')).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(false)

  await kaart.getByRole('button', { name: 'Zet aan' }).click()
  await kaart.getByRole('button', { name: 'Ja, zet aan' }).click()
  await expect(kaart.getByText('Staat aan.')).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(true)

  // En hij blijft aan staan na een herlaadactie.
  await page.reload()
  await expect(kaart.getByText('Staat aan.')).toBeVisible()

  // Uitzetten kan op dezelfde plek.
  await kaart.getByRole('button', { name: 'Zet uit' }).click()
  await expect(kaart.getByText('Staat uit.')).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(false)
})

test('de nachtelijke taak stuurt één herinnering en laat zich afmelden', async ({
  page,
  request,
}) => {
  const leerling = await maakLeerling({ stilDagen: 9 })

  // Zonder het juiste geheim doet de taak niets.
  const afgewezen = await draaiTaak(request, 'niet-het-geheim')
  expect(afgewezen.status()).toBe(401)
  expect(await herinneringen(leerling.email)).toHaveLength(0)

  const eerste = await draaiTaak(request)
  expect(eerste.status()).toBe(200)
  expect(await eerste.json()).toMatchObject({ ok: true, verstuurd: 1 })

  const mail = await wachtOpSitemail(leerling.email, { onderwerpBevat: 'Verder met' })
  expect(mail.aan).toEqual([leerling.email])
  expect(mail.html).toContain('Nog even verder?')
  expect(mail.html).toContain('/nl/oefenen?chapter=')
  expect(mail.tekst).toContain('Geen herinneringen meer')

  // Meteen nog een ronde stuurt niets: de afkoelperiode loopt nog.
  const tweede = await draaiTaak(request)
  expect(await tweede.json()).toMatchObject({ verstuurd: 0 })
  expect(await herinneringen(leerling.email)).toHaveLength(1)

  // De afmeldlink werkt zonder in te loggen.
  await page.goto(linkUitMail(mail, '/nl/herinnering-uit'))
  await expect(
    page.getByRole('heading', { name: 'Je krijgt geen herinneringen meer' }),
  ).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(false)

  // Dezelfde link nog een keer geeft hetzelfde geruststellende bericht. Een
  // leerling die twee keer klikt — of een mailprogramma dat de link alvast
  // ophaalt — hoort geen foutmelding te krijgen.
  await page.goto(`/nl/herinnering-uit?sleutel=${leerling.sleutel}`)
  await expect(
    page.getByRole('heading', { name: 'Je krijgt geen herinneringen meer' }),
  ).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(false)
})

test('een afmeldlink met een onbekend nummer meldt niemand af', async ({ page }) => {
  // Verzonnen nummer: hier hoort geen account bij. De pagina zegt dat de link
  // niet werkt, en verder niets — of er een account bij hoort, gaat een
  // voorbijganger niet aan.
  await page.goto('/nl/herinnering-uit?sleutel=00000000-0000-4000-8000-000000000000')
  await expect(
    page.getByRole('heading', { name: 'Deze link werkt niet meer' }),
  ).toBeVisible()

  // En een nummer dat niet eens de goede vorm heeft, geeft geen rauwe fout.
  await page.goto('/nl/herinnering-uit?sleutel=geen-nummer')
  await expect(
    page.getByRole('heading', { name: 'Deze link werkt niet meer' }),
  ).toBeVisible()
})

test('wie pas net begon, krijgt nog geen herinnering', async ({ request }) => {
  const leerling = await maakLeerling({ stilDagen: 2 })

  const uitslag = await draaiTaak(request)
  expect(uitslag.status()).toBe(200)
  expect(await herinneringen(leerling.email)).toHaveLength(0)
})
