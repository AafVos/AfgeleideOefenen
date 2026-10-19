import { expect, test, type APIRequestContext } from '@playwright/test'

import { TESTLEERLING, logIn, testDatabase, uniekAdres } from './leerling'
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
 */

const CRON_PAD = '/api/cron/herinneringen'
const DAG_MS = 24 * 60 * 60 * 1000

function webhookGeheim(): string {
  const geheim = process.env.WEBHOOK_SECRET
  if (!geheim) throw new Error('Start de tests met `npm run test:e2e`.')
  return geheim
}

/** De taak draaien zoals de Worker dat 's nachts doet. */
async function draaiTaak(request: APIRequestContext, geheim = webhookGeheim()) {
  return request.post(CRON_PAD, { headers: { 'x-webhook-secret': geheim } })
}

/**
 * Een vers account dat verder nergens in de tests gebruikt wordt, zodat de
 * voortgang van de vaste testleerling deze test niet kan beïnvloeden. Het
 * adres begint met `nieuw-`, dus `e2e/schone-start.ts` ruimt het weer op.
 */
async function stilleLeerling(stilDagen: number) {
  const db = testDatabase()
  const email = uniekAdres()
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: 'oefenen123',
    email_confirm: true,
  })
  if (error || !data.user) throw new Error(error?.message ?? 'account niet aangemaakt')

  // Herinnering aan, en al zo lang stil dat hij vanavond aan de beurt is.
  // Deze leerling heeft nog nooit geoefend, dus de stilte telt vanaf het
  // aanzetten.
  const { error: updateFout } = await db
    .from('profiles')
    .update({
      herinnering_mail: true,
      herinnering_aan_sinds: new Date(Date.now() - stilDagen * DAG_MS).toISOString(),
    })
    .eq('id', data.user.id)
  if (updateFout) throw new Error(updateFout.message)

  const { data: profiel } = await db
    .from('profiles')
    .select('herinnering_sleutel')
    .eq('id', data.user.id)
    .single()

  return { id: data.user.id, email, sleutel: profiel!.herinnering_sleutel as string }
}

test('de leerling zet de herinnering zelf aan, na de vraag of hij 16 is', async ({
  page,
}) => {
  await logIn(page)

  const kaart = page.getByText('Herinnering per mail').locator('..')
  await expect(kaart.getByText('Staat uit.')).toBeVisible()

  // Eerst de leeftijdsvraag; pas daarna gaat hij echt aan.
  await kaart.getByRole('button', { name: 'Zet aan' }).click()
  await expect(kaart.getByText('Ben je 16 of ouder?')).toBeVisible()

  // Wie nee zegt, krijgt hem niet.
  await kaart.getByRole('button', { name: 'Nee' }).click()
  await expect(kaart.getByText('Dan zetten we hem niet aan.')).toBeVisible()
  expect(await staatAan(TESTLEERLING.id)).toBe(false)

  await kaart.getByRole('button', { name: 'Zet aan' }).click()
  await kaart.getByRole('button', { name: 'Ja, zet aan' }).click()
  await expect(kaart.getByText('Staat aan.')).toBeVisible()
  expect(await staatAan(TESTLEERLING.id)).toBe(true)

  // En hij blijft aan staan na een herlaadactie.
  await page.reload()
  await expect(kaart.getByText('Staat aan.')).toBeVisible()

  // Uitzetten kan op dezelfde plek.
  await kaart.getByRole('button', { name: 'Zet uit' }).click()
  await expect(kaart.getByText('Staat uit.')).toBeVisible()
  expect(await staatAan(TESTLEERLING.id)).toBe(false)
})

async function staatAan(userId: string): Promise<boolean> {
  const { data } = await testDatabase()
    .from('profiles')
    .select('herinnering_mail')
    .eq('id', userId)
    .single()
  return data?.herinnering_mail === true
}

test('de nachtelijke taak stuurt één herinnering en laat zich afmelden', async ({
  page,
  request,
}) => {
  const leerling = await stilleLeerling(9)

  // Zonder het juiste geheim doet de taak niets.
  const afgewezen = await draaiTaak(request, 'niet-het-geheim')
  expect(afgewezen.status()).toBe(401)
  expect(await sitemails(leerling.email)).toHaveLength(0)

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
  expect(await sitemails(leerling.email)).toHaveLength(1)

  // De afmeldlink werkt zonder in te loggen.
  await page.goto(linkUitMail(mail, '/nl/herinnering-uit'))
  await expect(
    page.getByRole('heading', { name: 'Je krijgt geen herinneringen meer' }),
  ).toBeVisible()
  expect(await staatAan(leerling.id)).toBe(false)

  // Dezelfde link nog een keer meldt niemand opnieuw af.
  await page.goto(`/nl/herinnering-uit?sleutel=${leerling.sleutel}`)
  await expect(
    page.getByRole('heading', { name: 'Deze link werkt niet meer' }),
  ).toBeVisible()
})

test('wie pas net begon, krijgt nog geen herinnering', async ({ request }) => {
  const leerling = await stilleLeerling(2)

  const uitslag = await draaiTaak(request)
  expect(uitslag.status()).toBe(200)
  expect(await sitemails(leerling.email)).toHaveLength(0)
})
