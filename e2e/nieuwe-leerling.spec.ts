import { expect, test, type Locator, type Page } from '@playwright/test'

import {
  WEGWERP_WACHTWOORD,
  geefAntwoord,
  kiesOpgave,
  TESTLEERLING,
  logIn,
  logUit,
  sluitRondleiding,
  testDatabase,
  uniekAdres,
} from './leerling'
import {
  linkUitMail,
  sitemails,
  wachtOpMail,
  wachtOpSitemail,
  type Mail,
} from './postbus'

/**
 * De weg van een leerling die hier nog nooit geweest is: registreren, de
 * bevestigingsmail openmaken, op de link klikken, inloggen en zijn eerste
 * antwoord geven. En de paden waar het misgaat: een adres dat al bestaat, een
 * te kort wachtwoord, inloggen vóór bevestigen, en wachtwoord vergeten.
 *
 * Alle mail komt echt aan, in twee lokale postbussen (zie `e2e/postbus.ts`):
 * wat Supabase stuurt in Mailpit, en wat de site zelf stuurt — de
 * welkomstmail — in een neppe Resend. Er gaat dus nooit een mail de deur uit.
 */

const GEBRUIKERSNAAM = 'Sanne'

/** Een naam die nog nooit gebruikt is, zodat de test niet kan slagen op
 *  een eerder achtergebleven account. */
function uniekeNaam(): string {
  return `${GEBRUIKERSNAAM}-${Date.now()}`
}

/** De onderwerpregels uit `supabase/config.toml`. */
const ONDERWERP_BEVESTIGEN = 'Bevestig je e-mailadres'
const ONDERWERP_RESET = 'Nieuw wachtwoord'

/** Het onderwerp van de welkomstmail uit `src/lib/email/welkom.ts`. */
const ONDERWERP_WELKOM = 'Welkom bij AfgeleideOefenen!'

/** Waar de link in een mail van Supabase altijd langs gaat. */
const VERIFY_PAD = '/auth/v1/verify'

/**
 * Het blokje met de melding boven of onder het formulier.
 *
 * Met opzet niet `getByRole('alert')`: Next.js zet zelf een leeg
 * `<div role="alert">` in elke pagina om schermlezers te vertellen welke
 * pagina je opent. Dat blokje staat er altijd, en dan weet Playwright niet
 * welke van de twee je bedoelt.
 */
function melding(page: Page): Locator {
  return page.locator('p[role="alert"], p[role="status"]')
}

/** Alleen de foutmelding; voor "en er staat geen rode melding op het scherm". */
function foutmelding(page: Page): Locator {
  return page.locator('p[role="alert"]')
}

/** Het registratieformulier invullen en versturen, zoals een leerling het doet. */
async function vulRegistratieIn(
  page: Page,
  velden: { email: string; wachtwoord: string; gebruikersnaam?: string },
) {
  await page.goto('/nl/registreren')
  if (velden.gebruikersnaam) {
    await page.locator('input[name="username"]').fill(velden.gebruikersnaam)
  }
  await page.locator('input[name="email"]').fill(velden.email)
  await page.locator('input[name="password"]').fill(velden.wachtwoord)
  await page.locator('input[name="passwordConfirm"]').fill(velden.wachtwoord)
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
}

/** Loopt elke mail na op Engelse systeemtaal die een leerling niet hoort te zien. */
function isNederlands(mail: Mail) {
  const tekst = `${mail.onderwerp} ${mail.html}`
  expect(tekst).not.toMatch(/Confirm your signup|Reset Password|Follow this link/i)
}

/**
 * Registreren én bevestigen in één keer, voor de tests die een werkend
 * account nodig hebben maar niet over het registreren zelf gaan.
 */
async function registreerEnBevestig(page: Page, opts?: { gebruikersnaam?: string }): Promise<string> {
  const email = uniekAdres()
  await vulRegistratieIn(page, {
    email,
    wachtwoord: WEGWERP_WACHTWOORD,
    gebruikersnaam: opts?.gebruikersnaam,
  })
  await expect(melding(page)).toBeVisible()

  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  // Meteen de eerste som, niet het hoofdstukkenmenu.
  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  expect(new URL(page.url()).searchParams.get('q')).toBeTruthy()

  return email
}

test('een nieuwe leerling komt van registreren tot zijn eerste antwoord @telefoon', async ({
  page,
}) => {
  const email = uniekAdres()
  const naam = uniekeNaam()

  // 1. Het formulier invullen en versturen.
  await vulRegistratieIn(page, {
    email,
    wachtwoord: WEGWERP_WACHTWOORD,
    gebruikersnaam: naam,
  })

  // 2. De site zegt dat er een bevestigingsmail onderweg is, met een knop om
  //    de mail opnieuw te laten sturen, en een link naar de inlogpagina.
  await expect(
    page.getByText('Klik op de link in de bevestigingsmail'),
  ).toBeVisible()
  await expect(
    page.getByText('Check ook je spammap'),
  ).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Stuur bevestigingsmail opnieuw' }),
  ).toBeVisible()
  await expect(page.getByRole('link', { name: 'Naar inlogpagina' })).toBeVisible()

  // 3. De mail komt echt aan, is Nederlands en komt van afgeleideoefenen.nl.
  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })
  expect(mail.aan).toContain(email)
  expect(mail.onderwerp).toContain('AfgeleideOefenen')
  expect(mail.afzenderNaam).toBe('AfgeleideOefenen')
  expect(mail.afzenderAdres).toContain('afgeleideoefenen.nl')
  expect(mail.html).toContain('Account bevestigen')
  expect(mail.html).toContain('Bevestig je e-mailadres')
  isNederlands(mail)

  // 4. Op de link klikken: de code wordt ingewisseld voor een sessie en je
  //    landt direct op de eerste som — geen inlogformulier, geen hoofdstukkenmenu.
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  expect(new URL(page.url()).searchParams.get('q')).toBeTruthy()

  // De welkomstmail gaat nu uit via `after()` in de callback, net als na
  // inloggen. Hij komt ná het antwoord aan de leerling, dus hier even op
  // wachten.
  const welkom = await wachtOpSitemail(email, { onderwerpBevat: 'Welkom' })
  expect(welkom.aan).toEqual([email])
  expect(welkom.onderwerp).toBe(ONDERWERP_WELKOM)
  expect(welkom.afzenderNaam).toBe('AfgeleideOefenen')
  expect(welkom.afzenderAdres).toContain('afgeleideoefenen.nl')
  for (const versie of [welkom.html, welkom.tekst]) {
    expect(versie).toContain('Je account is klaar.')
    expect(versie).toContain('Groeten van Aaf')
  }
  isNederlands(welkom)

  // De naam die hij bij het registreren koos staat in de bovenbalk, niet zijn
  // e-mailadres. Op telefoonformaat zit die naam in het menu.
  if ((page.viewportSize()?.width ?? 0) >= 768) {
    await expect(
      page.getByRole('button', { name: naam, exact: true }),
    ).toBeVisible()
  }

  // 6. De eerste stappen: Aaf stelt zich voor, op computer en op telefoon.
  //    (De rest van de rondleiding controleert `rondleiding.spec.ts`.)
  await expect(page.getByRole('dialog')).toContainText('Hoi! Ik ben Aaf.')
  await sluitRondleiding(page)

  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible()

  // 7. Uitloggen en opnieuw inloggen: het account blijft gewoon werken.
  await logUit(page, naam)
  await logIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
  await sluitRondleiding(page)

  // 8. En dan de eerste opgave. f(x) = 4x^3 → f'(x) = 12x^2.
  await kiesOpgave(page, {
    onderwerp: 'Nakijken (e2e)',
    soortSom: 'Goed antwoord (e2e)',
    nummer: 1,
  })
  await geefAntwoord(page, '12x^2')
  await expect(page.getByText('Goed!', { exact: true })).toBeVisible()

  // 9. En na dat tweede keer inloggen is er nog steeds maar één welkomstmail
  //    de deur uit. Hij hoort niet bij elk bezoek opnieuw te komen.
  expect(await sitemails(email, { onderwerpBevat: 'Welkom' })).toHaveLength(1)
})

test('vanaf het dashboard staat de eerste opgave één klik verderop @telefoon', async ({
  page,
}) => {
  await registreerEnBevestig(page)
  // Net geregistreerd en bevestigd: de callback zet je meteen op de eerste som.
  await sluitRondleiding(page)
  await page.goto('/nl/dashboard')

  // Geen lege voortgangsrapportage, maar een knop naar een opgave. Die moet
  // met een duim te raken zijn (zie AFG-114).
  const beginnen = page.getByRole('link', { name: 'Begin met oefenen' })
  await expect(beginnen).toBeVisible()
  const vak = await beginnen.boundingBox()
  expect(vak?.height ?? 0).toBeGreaterThanOrEqual(44)

  // Eén klik, en er staat echt een opgave op het scherm: een invoerveld en
  // de knop om hem na te laten kijken.
  await beginnen.click()
  await expect(page.getByPlaceholder('Bijv. 12x^2')).toBeVisible()
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible()

  // En met de terugknop van de browser staat hij weer op het dashboard, met
  // het eerste hoofdstuk opengeklapt: er is meteen een link naar oefenen,
  // zonder dat hij eerst ergens op moet klikken.
  await page.goBack()
  await expect(page.locator('li a[href*="/oefenen?"]').first()).toBeVisible()
})

const GEKOZEN_SOORT = '/oefenen?chapter=h2&topic=h2_termsgewijs'

test('wie niet ingelogd is, houdt de gekozen soort tot na het inloggen @telefoon', async ({
  page,
}) => {
  await page.goto(`/nl${GEKOZEN_SOORT}`)
  await expect(page).toHaveURL(/\/nl\/inloggen/)
  const inlog = new URL(page.url())
  expect(inlog.searchParams.get('naar')).toBe(GEKOZEN_SOORT)
  expect(inlog.searchParams.get('chapter')).toBeNull()
  expect(inlog.searchParams.get('topic')).toBeNull()

  await page.locator('input[name="email"]').fill(TESTLEERLING.email)
  await page.locator('input[name="password"]').fill(TESTLEERLING.wachtwoord)
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  const geland = new URL(page.url())
  expect(geland.searchParams.get('topic')).toBe('h2_termsgewijs')
  expect(geland.searchParams.get('q')).toBeTruthy()
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible()
})

test('een gekozen soort blijft bewaard tot na de bevestigingsmail', async ({ page }) => {
  await page.goto(`/nl${GEKOZEN_SOORT}`)
  await page.getByRole('link', { name: 'Registreer' }).click()
  await expect(page).toHaveURL(/\/nl\/registreren/)
  expect(new URL(page.url()).searchParams.get('naar')).toBe(GEKOZEN_SOORT)

  const email = uniekAdres()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WEGWERP_WACHTWOORD)
  await page.locator('input[name="passwordConfirm"]').fill(WEGWERP_WACHTWOORD)
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
  await expect(melding(page)).toBeVisible()

  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  const geland = new URL(page.url())
  expect(geland.searchParams.get('topic')).toBe('h2_termsgewijs')
  expect(geland.searchParams.get('q')).toBeTruthy()
  await sluitRondleiding(page)
  await expect(
    page.getByRole('button', { name: 'Nakijken', exact: true }),
  ).toBeVisible()
})

test('wie al ingelogd is, gaat vanaf de theorie direct naar oefenen', async ({ page }) => {
  await logIn(page)
  await page.goto(`/nl${GEKOZEN_SOORT}`)
  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  const geland = new URL(page.url())
  expect(geland.searchParams.get('chapter')).toBe('h2')
  expect(geland.searchParams.get('topic')).toBe('h2_termsgewijs')
  expect(geland.searchParams.get('q')).toBeNull()
})

test('een andere pagina dan oefenen bewaart het adres niet', async ({ page }) => {
  await page.goto('/nl/dashboard')
  await expect(page).toHaveURL(/\/nl\/inloggen$/)
  expect(new URL(page.url()).searchParams.get('naar')).toBeNull()
})

test('een al gebruikte bevestigingslink zegt niet dat je bevestigd bent', async ({
  page,
}) => {
  const email = uniekAdres()
  await vulRegistratieIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
  await expect(melding(page)).toBeVisible()

  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })
  const link = linkUitMail(mail, VERIFY_PAD)

  // De eerste klik gaat goed: de code wordt ingewisseld en je landt direct
  // op de eerste som. Geen "bevestigd"-melding, geen inlogformulier.
  await page.goto(link)
  await expect(page).toHaveURL(/\/nl\/oefenen\?/)
  expect(new URL(page.url()).searchParams.get('q')).toBeTruthy()

  // Uitloggen voor de tweede klik, anders stuurt de nog actieve sessie je
  // meteen door vanaf de inlogpagina en zie je de foutmelding niet.
  // Op een breed scherm ligt de rondleiding over het menu heen.
  await sluitRondleiding(page)
  await logUit(page, email)

  // Dezelfde link een tweede keer: hij is op. Dan hoort er géén groene
  // "bevestigd" te staan, maar een Nederlandse melding die zegt wat de
  // leerling nu moet doen.
  await page.goto(link)
  await expect(page).toHaveURL(/\/nl\/inloggen/)
  await expect(page.getByText('Je account is bevestigd!')).toHaveCount(0)
  await expect(foutmelding(page)).toContainText(
    'Deze link is verlopen of al gebruikt.',
  )
  // En niet de Engelse systeemtekst van Supabase.
  await expect(page.locator('body')).not.toContainText('Email link is invalid')

  // Dezelfde afloop als bij een echt verlopen link: Supabase hangt dan
  // dezelfde foutparameters aan de terugkeer-URL.
  await page.goto(
    '/auth/callback?next=%2Fnl%2Finloggen&error=access_denied&error_code=otp_expired',
  )
  await expect(page).toHaveURL(/\/nl\/inloggen/)
  await expect(page.getByText('Je account is bevestigd!')).toHaveCount(0)
  await expect(foutmelding(page)).toContainText(
    'Deze link is verlopen of al gebruikt.',
  )

  // En de link uit een opnieuw gestuurde mail: die zet het antwoord achter de
  // `#`. Dat stuk stuurt een browser nooit naar de server, dus de inlogpagina
  // moet het zelf opvangen. Het blijft ook niet in de adresregel staan.
  await page.goto(
    '/auth/callback?next=%2Fnl%2Finloggen#error=access_denied&error_code=otp_expired',
  )
  await expect(foutmelding(page)).toContainText(
    'Deze link is verlopen of al gebruikt.',
  )
  await expect(page.getByText('Je account is bevestigd!')).toHaveCount(0)
  expect(await page.evaluate(() => window.location.hash)).toBe('')

  // Het account zelf is bij die eerste klik wél bevestigd, dus inloggen lukt.
  await logIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
})

test('een te kort wachtwoord komt er niet doorheen', async ({ page }) => {
  const email = uniekAdres()

  // Zoals een leerling het meemaakt: de browser laat het formulier niet eens
  // weg, want de velden eisen acht tekens.
  await vulRegistratieIn(page, { email, wachtwoord: 'kort' })
  await expect(page).toHaveURL(/\/nl\/registreren/)
  await expect(page.getByText('Minstens 8 tekens.').first()).toBeVisible()
  const teKort = await page
    .locator('input[name="password"]')
    .evaluate((veld: HTMLInputElement) => veld.validity.tooShort)
  expect(teKort).toBe(true)

  // Het formulier zet native validatie uit (noValidate, AFG-675); de server
  // vangt een te kort wachtwoord dus zelf op, in het Nederlands.
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
  await expect(
    page.getByText('Je wachtwoord moet minstens 8 tekens lang zijn.'),
  ).toBeVisible()

  // Er is dus geen account aangemaakt en er is geen mail de deur uit.
  const { data } = await testDatabase().auth.admin.listUsers({ perPage: 100 })
  expect(data.users.map((u) => u.email)).not.toContain(email)
})

test('leeg registratieformulier toont een Nederlandse melding, geen Engelse systeemballon (AFG-675)', async ({
  page,
}) => {
  await page.goto('/nl/registreren')
  await page.getByRole('button', { name: 'Account aanmaken' }).click()

  // Zonder `noValidate` op het formulier had de browser hier zelf een
  // Engelse foutballon getoond ("Please fill out this field") en was de
  // server-actie nooit aangeroepen — dan zou deze melding niet verschijnen.
  await expect(page).toHaveURL(/\/nl\/registreren/)
  await expect(foutmelding(page)).toHaveText('Vul een e-mailadres en wachtwoord in.')
})

test('leeg inlogformulier toont een Nederlandse melding, geen Engelse systeemballon (AFG-675)', async ({
  page,
}) => {
  await page.goto('/nl/inloggen')
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(page).toHaveURL(/\/nl\/inloggen/)
  await expect(foutmelding(page)).toHaveText('Vul je e-mailadres en wachtwoord in.')
})

test('niet-overeenkomende wachtwoorden wissen niet het e-mailadres en de gebruikersnaam (AFG-553)', async ({
  page,
}) => {
  const email = uniekAdres()
  const naam = uniekeNaam()

  await page.goto('/nl/registreren')
  await page.locator('input[name="username"]').fill(naam)
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WEGWERP_WACHTWOORD)
  await page.locator('input[name="passwordConfirm"]').fill('iets-anders-12')
  await page.getByRole('button', { name: 'Account aanmaken' }).click()

  await expect(melding(page)).toContainText('De wachtwoorden komen niet overeen.')

  // De leerling hoeft zijn e-mailadres en gebruikersnaam niet opnieuw te
  // typen; alleen de wachtwoordvelden mogen om veiligheidsredenen leeg zijn.
  await expect(page.locator('input[name="email"]')).toHaveValue(email)
  await expect(page.locator('input[name="username"]')).toHaveValue(naam)
  await expect(page.locator('input[name="password"]')).toHaveValue('')
  await expect(page.locator('input[name="passwordConfirm"]')).toHaveValue('')
})

test('registreren met een adres dat al bestaat maakt geen tweede account', async ({
  page,
}) => {
  const email = await registreerEnBevestig(page)

  // Uitloggen: de registreren-pagina stuurt ingelogde gebruikers door naar
  // het dashboard, en daar is het registratieformulier niet te vinden.
  // Op een breed scherm ligt de rondleiding over het menu heen.
  await sluitRondleiding(page)
  await logUit(page, email)

  await vulRegistratieIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })

  // Eén nette Nederlandse zin, geen Engelse systeemtaal van Supabase, en
  // geen "we hebben je een mail gestuurd" terwijl er niets komt.
  await expect(melding(page)).toContainText(
    'Er bestaat al een account met dit e-mailadres.',
  )

  // En er komt geen tweede account op hetzelfde adres bij.
  const { data } = await testDatabase().auth.admin.listUsers({ perPage: 100 })
  expect(data.users.filter((u) => u.email === email)).toHaveLength(1)
})

test('inloggen vóór het bevestigen geeft een duidelijke melding', async ({
  page,
}) => {
  const email = uniekAdres()
  await vulRegistratieIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
  await expect(melding(page)).toBeVisible()
  const eerste = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })

  // Niet op de link geklikt, wel proberen in te loggen.
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WEGWERP_WACHTWOORD)
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(foutmelding(page)).toContainText(
    'Je hebt je e-mailadres nog niet bevestigd.',
  )
  await expect(page).toHaveURL(/\/nl\/inloggen/)

  // En je kunt de mail opnieuw laten sturen zonder opnieuw te registreren.
  await page.getByRole('button', { name: 'Stuur bevestigingsmail opnieuw' }).click()
  await expect(page.getByText('Mail verstuurd.')).toBeVisible()
  const opnieuw = await wachtOpMail(email, {
    onderwerpBevat: ONDERWERP_BEVESTIGEN,
    andersDan: eerste.id,
  })

  // Die tweede mail werkt ook echt: erop klikken bevestigt het account.
  await page.goto(linkUitMail(opnieuw, VERIFY_PAD))
  await expect(page.getByText('Je account is bevestigd!')).toBeVisible()
  await logIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
})

test('een verkeerd wachtwoord wist het e-mailadres niet (AFG-553)', async ({
  page,
}) => {
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(TESTLEERLING.email)
  await page.locator('input[name="password"]').fill('dit-is-fout-123')
  await page.getByRole('button', { name: 'Inloggen' }).click()

  await expect(foutmelding(page)).toContainText(
    'Onjuiste combinatie van e-mail en wachtwoord.',
  )

  // Het e-mailadres hoeft niet opnieuw getypt te worden; het wachtwoord mag
  // om veiligheidsredenen leeg zijn.
  await expect(page.locator('input[name="email"]')).toHaveValue(TESTLEERLING.email)
  await expect(page.locator('input[name="password"]')).toHaveValue('')
})

test('wachtwoord vergeten: mail, link, nieuw wachtwoord, inloggen', async ({
  page,
}) => {
  const email = await registreerEnBevestig(page)
  const nieuwWachtwoord = 'anderswachtwoord42'

  // Aanvragen.
  await page.goto('/nl/wachtwoord-vergeten')
  await page.locator('input[name="email"]').fill(email)
  await page.getByRole('button', { name: 'Stuur een nieuwe link' }).click()
  await expect(page.getByText('ontvang je zo een link om je wachtwoord opnieuw in te stellen')).toBeVisible()

  // De mail komt aan, is Nederlands en komt van afgeleideoefenen.nl.
  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_RESET })
  expect(mail.onderwerp).toContain('AfgeleideOefenen')
  expect(mail.afzenderNaam).toBe('AfgeleideOefenen')
  expect(mail.afzenderAdres).toContain('afgeleideoefenen.nl')
  isNederlands(mail)

  // De link volgen en een nieuw wachtwoord zetten.
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/wachtwoord-opnieuw/)
  await page.locator('input[name="password"]').fill(nieuwWachtwoord)
  await page.getByRole('button', { name: 'Wachtwoord opslaan' }).click()
  await expect(page).toHaveURL(/\/nl\/dashboard/)

  // Uitloggen en met het níéuwe wachtwoord weer naar binnen.
  await sluitRondleiding(page)
  await logUit(page, email)
  await logIn(page, { email, wachtwoord: nieuwWachtwoord })

  // En het oude wachtwoord werkt niet meer.
  await logUit(page, email)
  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WEGWERP_WACHTWOORD)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(foutmelding(page)).toContainText(
    'Onjuiste combinatie van e-mail en wachtwoord.',
  )

  // Dezelfde resetlink is nu verbruikt. Opnieuw aanklikken stuurt niet naar
  // een inlogfout, maar naar wachtwoord-vergeten met een eigen melding.
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/wachtwoord-vergeten/)
  await expect(
    page.getByText('Deze link is verlopen of al gebruikt.'),
  ).toBeVisible()
})

/**
 * Het geheim waarmee Supabase zich bij onze webhooks meldt. Verzonnen voor de
 * tests; `scripts/e2e.mjs` geeft dezelfde waarde aan de site mee.
 */
function webhookGeheim(): string {
  const geheim = process.env.WEBHOOK_SECRET
  if (!geheim) throw new Error('Start de tests met `npm run test:e2e`.')
  return geheim
}

test('de webhook op e-mailbevestiging stuurt de welkomstmail, maar alleen met het juiste geheim', async ({
  page,
  request,
}) => {
  // De callback heeft tijdens het bevestigen al een welkomstmail gestuurd
  // via `after()`, net als bij inloggen.
  const email = await registreerEnBevestig(page)
  expect(await sitemails(email)).toHaveLength(1)
  const { data } = await testDatabase().auth.admin.listUsers({ perPage: 100 })
  const leerling = data.users.find((u) => u.email === email)
  expect(leerling, 'het verse account staat in de database').toBeTruthy()

  // Het bericht zoals Supabase het stuurt: `email_confirmed_at` ging van leeg
  // naar gevuld.
  const bericht = {
    type: 'UPDATE',
    record: { id: leerling!.id, email_confirmed_at: new Date().toISOString() },
    old_record: { email_confirmed_at: null },
  }

  // Met een verkeerd geheim komt er niets door: geen extra mail, en een 401.
  const afgewezen = await request.post('/api/webhooks/welkom', {
    headers: { 'x-webhook-secret': 'niet-het-geheim' },
    data: bericht,
  })
  expect(afgewezen.status()).toBe(401)
  // De mail die de callback al stuurde is er nog steeds; er is geen tweede bij.
  expect(await sitemails(email)).toHaveLength(1)

  // Met het juiste geheim wél, maar de welkomstmail is al eerder gegaan
  // (de callback was sneller dan de webhook). De functie is idempotent.
  const toegelaten = await request.post('/api/webhooks/welkom', {
    headers: { 'x-webhook-secret': webhookGeheim() },
    data: bericht,
  })
  expect(toegelaten.status()).toBe(200)
  expect(await toegelaten.json()).toMatchObject({ ok: true, verstuurd: false, reden: 'al-verstuurd' })

  const welkom = await wachtOpSitemail(email, { onderwerpBevat: 'Welkom' })
  expect(welkom.aan).toEqual([email])
  expect(welkom.html).toContain('Je account is klaar.')

  // Komt hetzelfde bericht nog een keer langs — Supabase probeert het opnieuw
  // — dan blijft het bij die ene mail.
  const nogEens = await request.post('/api/webhooks/welkom', {
    headers: { 'x-webhook-secret': webhookGeheim() },
    data: bericht,
  })
  expect(await nogEens.json()).toMatchObject({ verstuurd: false, reden: 'al-verstuurd' })
  expect(await sitemails(email, { onderwerpBevat: 'Welkom' })).toHaveLength(1)
})
