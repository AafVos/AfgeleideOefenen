import { expect, test, type Page } from '@playwright/test'

import { NIEUWE_LEERLING, WEGWERP_WACHTWOORD, logIn, testDatabase, uniekAdres } from './leerling'

/**
 * Wat een kersverse leerling bij binnenkomst krijgt.
 *
 * De rondleiding start zelf, op computer en op telefoon, maar pas nadat de
 * gebruikersnaam is ingevuld of overgeslagen. Daarna loopt hij door tot op
 * de oefenpagina. Aaf blijft daarna rechtsonder staan.
 */

const WELKOM = 'Hoi! Ik ben Aaf.'

test.describe('wie al een naam heeft', () => {
test.beforeEach(async ({ page }) => {
  // Deze leerling heeft de rondleiding nog nooit gezien. De tests hieronder
  // klikken hem uit, en dat wordt opgeslagen — dus elke test zet hem terug.
  const { error } = await testDatabase()
    .from('profiles')
    .update({ tour_seen_at: null })
    .eq('id', NIEUWE_LEERLING.id)
  expect(error).toBeNull()

  await logIn(page, NIEUWE_LEERLING)
})

test('op de telefoon start de rondleiding en blijft de ballon in beeld @telefoon', async ({
  page,
}) => {
  const breedte = page.viewportSize()?.width ?? 0
  const hoogte = page.viewportSize()?.height ?? 0
  test.skip(breedte >= 700, 'Dit gaat over telefoonformaat.')

  const ballon = page.getByRole('dialog')
  await expect(ballon).toBeVisible()
  await expect(ballon).toContainText(WELKOM)
  await expect(ballon.getByRole('button', { name: 'Volgende' })).toHaveCount(0)
  await expect(ballon.getByRole('button', { name: 'Ja, graag!' })).toBeVisible()
  await expect(ballon.getByRole('button', { name: 'Terug' })).toBeVisible()
  await expect(ballon.getByRole('button', { name: 'Overslaan' })).toBeVisible()

  const doos = await ballon.boundingBox()
  expect(doos?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect(doos?.y ?? -1).toBeGreaterThanOrEqual(0)
  expect((doos?.x ?? 0) + (doos?.width ?? 0)).toBeLessThanOrEqual(breedte + 1)
  expect((doos?.y ?? 0) + (doos?.height ?? 0)).toBeLessThanOrEqual(hoogte + 1)

  await ballon.getByRole('button', { name: 'Overslaan' }).click()
  const aafKnop = page.getByRole('button', { name: 'Vraag het Aaf' })
  await expect(aafKnop).toBeVisible()

  const vak = await aafKnop.boundingBox()
  expect(vak?.width ?? 0).toBeGreaterThanOrEqual(44)
  expect(vak?.height ?? 0).toBeGreaterThanOrEqual(44)

  await aafKnop.click()
  await expect(page.getByPlaceholder('Typ je vraag')).toBeVisible()
})

test('op een breed scherm start de rondleiding vanzelf', async ({ page }) => {
  test.skip((page.viewportSize()?.width ?? 0) < 900, 'Dit gaat over een breed scherm.')

  const ballon = page.getByRole('dialog')
  await expect(ballon).toBeVisible()
  await expect(ballon).toContainText(WELKOM)

  // De tweede stap wijst het menu aan, met een ring eromheen.
  await page.getByRole('button', { name: 'Ja, graag!' }).click()
  await expect(ballon).toContainText('In het menu')
  await expect(page.locator('[data-tour="menu"].tour-ring')).toBeVisible()

  await page.getByRole('button', { name: 'Overslaan' }).click()
  await expect(page.getByRole('button', { name: 'Vraag het Aaf' })).toBeVisible()
})
})

async function binnenBeeld(page: Page) {
  const ballon = page.getByRole('dialog')
  const doos = await ballon.boundingBox()
  const formaat = page.viewportSize()
  expect(doos).not.toBeNull()
  expect(doos!.x).toBeGreaterThanOrEqual(-1)
  expect(doos!.y).toBeGreaterThanOrEqual(-1)
  expect(doos!.x + doos!.width).toBeLessThanOrEqual((formaat?.width ?? 0) + 1)
  expect(doos!.y + doos!.height).toBeLessThanOrEqual((formaat?.height ?? 0) + 1)

  // Er kan meer dan één uitgelicht element zijn: de stap zelf, en op de
  // oefenpagina ook het menu-item "Oefenen". Elk moet uit de weg van de
  // ballon blijven, én boven de dimmende overlay uit steken — anders lijkt
  // de knop te verdwijnen (zie AFG-394).
  const ringen = await page.locator('.tour-ring').all()
  for (const el of ringen) {
    const doel = await el.boundingBox()
    if (!doel || !doos) continue
    const overlapt =
      doel.x < doos.x + doos.width &&
      doel.x + doel.width > doos.x &&
      doel.y < doos.y + doos.height &&
      doel.y + doel.height > doos.y
    expect(overlapt).toBe(false)

    const middenX = doel.x + doel.width / 2
    const middenY = doel.y + doel.height / 2
    const bovenOp = await page.evaluate(
      ([x, y]) => document.elementFromPoint(x, y)?.closest('.tour-ring') != null,
      [middenX, middenY],
    )
    expect(bovenOp).toBe(true)
  }
}

test('de rondleiding start pas na de gebruikersnaam en loopt tot op de oefenpagina @telefoon', async ({
  page,
}, testInfo) => {
  test.setTimeout(180_000)
  const email = uniekAdres()
  const admin = testDatabase().auth.admin
  const aangemaakt = await admin.createUser({
    email,
    password: WEGWERP_WACHTWOORD,
    email_confirm: true,
  })
  expect(aangemaakt.error).toBeNull()
  // Een wachtwoord-account krijgt vanzelf provider "email". Daarna
  // zetten we Google erop, anders stuurt de site niet naar de naamvraag.
  const bijgewerkt = await admin.updateUserById(aangemaakt.data.user!.id, {
    app_metadata: { provider: 'google', providers: ['google'] },
  })
  expect(bijgewerkt.error).toBeNull()
  expect(bijgewerkt.data.user?.app_metadata?.provider).toBe('google')

  await page.goto('/nl/inloggen')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(WEGWERP_WACHTWOORD)
  await page.getByRole('button', { name: 'Inloggen' }).click()
  await expect(page).toHaveURL(/\/gebruikersnaam/)
  await expect(page.getByRole('heading', { name: 'Hoe mogen we je noemen?' })).toBeVisible()

  // De ballon mag hier niet over het formulier liggen, ook niet na het
  // moment waarop hij bij een andere pagina wel zou starten.
  await page.waitForTimeout(1200)
  await expect(page.getByRole('dialog')).toHaveCount(0)

  await page.getByRole('button', { name: 'Verder' }).click()
  await expect(page).not.toHaveURL(/\/gebruikersnaam/)

  const ballon = page.getByRole('dialog')
  await expect(ballon).toBeVisible()
  await expect(ballon).toContainText(WELKOM)

  const gezien = new Set<string>()
  const map = process.env.RONDLEIDING_SCHERMEN
  let plaatje = 0
  for (let i = 0; i < 12; i++) {
    await expect(ballon).toBeVisible()
    const tekst = await ballon.innerText()
    if (/oefenpagina/.test(tekst)) gezien.add('oefenen')
    if (/hoofdstuk/.test(tekst)) gezien.add('hoofdstuk')
    if (/Nakijken/.test(tekst)) gezien.add('nakijken')
    if (/klasgenoot/.test(tekst)) gezien.add('delen')
    await binnenBeeld(page)
    if (map) {
      plaatje += 1
      await page.screenshot({
        path: `${map}/${testInfo.project.name}-${String(plaatje).padStart(2, '0')}.png`,
      })
    }
    if (await ballon.getByRole('button', { name: 'Klaar!' }).isVisible()) break
    const vorige = tekst
    const graag = ballon.getByRole('button', { name: 'Ja, graag!' })
    if (await graag.isVisible()) await graag.click()
    else await ballon.getByRole('button', { name: 'Volgende' }).click()
    await expect(ballon).not.toHaveText(vorige)
  }

  expect(gezien.has('oefenen')).toBe(true)
  expect(gezien.has('hoofdstuk')).toBe(true)
  expect(gezien.has('nakijken')).toBe(true)
  expect(gezien.has('delen')).toBe(true)
  await expect(page).toHaveURL(/\/oefenen/)
  await ballon.getByRole('button', { name: 'Klaar!' }).click()
  await expect(page.getByRole('button', { name: 'Vraag het Aaf' })).toBeVisible()
})
