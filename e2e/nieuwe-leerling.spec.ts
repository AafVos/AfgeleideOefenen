import { expect, test, type Locator, type Page } from '@playwright/test'

import {
  WEGWERP_WACHTWOORD,
  geefAntwoord,
  kiesOpgave,
  logIn,
  logUit,
  sluitRondleiding,
  testDatabase,
  uniekAdres,
} from './leerling'
import { linkUitMail, wachtOpMail, type Mail } from './postbus'

/**
 * De weg van een leerling die hier nog nooit geweest is: registreren, de
 * bevestigingsmail openmaken, op de link klikken, inloggen en zijn eerste
 * antwoord geven. En de paden waar het misgaat: een adres dat al bestaat, een
 * te kort wachtwoord, inloggen vóór bevestigen, en wachtwoord vergeten.
 *
 * De mail komt echt aan: de lokale Supabase stuurt hem naar een testpostbus
 * in Docker (Mailpit) en `e2e/postbus.ts` maakt hem daar open. De
 * welkomstmail van de site zelf gaat via Resend en komt hier dus níét langs;
 * die hoort geen enkele stap op te houden. Wat erin staat, controleert
 * `src/lib/email/welkom.test.ts`.
 */

const GEBRUIKERSNAAM = 'Sanne'

/** De onderwerpregels uit `supabase/config.toml`. */
const ONDERWERP_BEVESTIGEN = 'Bevestig je e-mailadres'
const ONDERWERP_RESET = 'Nieuw wachtwoord'

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
async function registreerEnBevestig(page: Page): Promise<string> {
  const email = uniekAdres()
  await vulRegistratieIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })
  await expect(melding(page)).toBeVisible()

  const mail = await wachtOpMail(email, { onderwerpBevat: ONDERWERP_BEVESTIGEN })
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/inloggen/)

  return email
}

test('een nieuwe leerling komt van registreren tot zijn eerste antwoord @telefoon', async ({
  page,
}) => {
  const email = uniekAdres()

  // 1. Het formulier invullen en versturen.
  await vulRegistratieIn(page, {
    email,
    wachtwoord: WEGWERP_WACHTWOORD,
    gebruikersnaam: GEBRUIKERSNAAM,
  })

  // 2. De site zegt dat er een bevestigingsmail onderweg is — en stuurt je
  //    niet stiekem al ingelogd door.
  await expect(
    page.getByText('Klik op de link in de bevestigingsmail'),
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

  // 4. Op de link klikken: je komt op de inlogpagina met een nette melding,
  //    niet op een foutpagina en niet met een Engelse systeemtekst.
  await page.goto(linkUitMail(mail, VERIFY_PAD))
  await expect(page).toHaveURL(/\/nl\/inloggen/)
  await expect(page.getByText('Je account is bevestigd!')).toBeVisible()
  await expect(foutmelding(page)).toHaveCount(0)

  // 5. Inloggen met het verse account. Dit is ook het pad waarop de site de
  //    welkomstmail probeert te sturen; zonder Resend-sleutel hoort dat
  //    niemand op te houden.
  await logIn(page, { email, wachtwoord: WEGWERP_WACHTWOORD })

  // 6. De eerste stappen: Aaf stelt zich voor. Op een breed scherm start de
  //    rondleiding vanzelf, op telefoonformaat staat Aaf rechtsonder klaar.
  //    (Welke van de twee, controleert `rondleiding.spec.ts` in detail.)
  if ((page.viewportSize()?.width ?? 0) >= 900) {
    await expect(page.getByRole('dialog')).toContainText('Hoi! Ik ben Aaf.')
    await sluitRondleiding(page)
  } else {
    await expect(page.getByRole('button', { name: 'Vraag het Aaf' })).toBeVisible()
  }

  // 7. Uitloggen en opnieuw inloggen: het account blijft gewoon werken.
  await logUit(page, GEBRUIKERSNAAM)
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

  // En als de browser die controle niet doet (een oude telefoon, een
  // uitgezette instelling), dan vangt de server het alsnog op — in het
  // Nederlands.
  await page.locator('form').first().evaluate((form: HTMLFormElement) => {
    form.noValidate = true
  })
  await page.getByRole('button', { name: 'Account aanmaken' }).click()
  await expect(
    page.getByText('Je wachtwoord moet minstens 8 tekens lang zijn.'),
  ).toBeVisible()

  // Er is dus geen account aangemaakt en er is geen mail de deur uit.
  const { data } = await testDatabase().auth.admin.listUsers({ perPage: 100 })
  expect(data.users.map((u) => u.email)).not.toContain(email)
})

test('registreren met een adres dat al bestaat maakt geen tweede account', async ({
  page,
}) => {
  const email = await registreerEnBevestig(page)

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

test('wachtwoord vergeten: mail, link, nieuw wachtwoord, inloggen', async ({
  page,
}) => {
  const email = await registreerEnBevestig(page)
  const nieuwWachtwoord = 'anderswachtwoord42'

  // Aanvragen.
  await page.goto('/nl/wachtwoord-vergeten')
  await page.locator('input[name="email"]').fill(email)
  await page.getByRole('button', { name: 'Stuur reset-link' }).click()
  await expect(page.getByText('ontvang je zo een resetlink')).toBeVisible()

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
})
