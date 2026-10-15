import { expect, test } from '@playwright/test'

import { logIn } from './leerling'

/**
 * De oefenpagina toont de blokken onder elkaar. Een adres met ?blok=
 * scrolt daarheen, en een leeg blok staat alleen in de zijbalk.
 */
test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('de blokken staan onder elkaar, ook met een hoofdstuk in het adres @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  await expect(page.locator('#hoofdstuk-h2')).toBeVisible()
  await expect(page.locator('#blok-h2-1d')).toBeAttached()
  await expect(page.locator('#blok-h2-3d')).toBeAttached()
  // 2.5 gaat niet over differentiëren en hoort nergens te staan.
  await expect(page.locator('#blok-h2-5a')).toHaveCount(0)
  await expect(page.locator('#paragraaf-h2-5')).toHaveCount(0)

  const titel = page.getByRole('heading', { level: 1, name: 'Oefenen' })
  const deel = page.getByRole('button', { name: 'Stuur naar een klasgenoot' })
  await expect(titel).toBeVisible()
  await expect(deel).toBeVisible()
  const deelVak = await deel.boundingBox()
  expect(deelVak?.height ?? 0).toBeGreaterThanOrEqual(44)

  const breed = (page.viewportSize()?.width ?? 0) >= 1024
  if (breed) {
    const titelVak = await titel.boundingBox()
    expect(Math.abs((titelVak?.y ?? 0) - (deelVak?.y ?? 0))).toBeLessThan(20)
    const zijbalk = page.locator('aside')
    const klikbaar = zijbalk.getByRole('button', { name: /Differentiequotiënten berekenen/ })
    await expect(klikbaar).toContainText(/\d+/)
    await expect(klikbaar).toHaveClass(/cursor-pointer/)
    await expect(zijbalk.getByRole('button', { name: /2\.5/ })).toHaveCount(0)
    await zijbalk.getByRole('button', { name: /2\.1/ }).click()
    await expect(zijbalk.getByText('Soorten van stijgen')).toHaveCount(0)
    await zijbalk.getByRole('button', { name: /H7 –/ }).click()
    await expect(zijbalk.getByRole('button', { name: /7\.[1-4]/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /7\.5/ })).toBeVisible()
    await zijbalk.getByRole('button', { name: /H9 –/ }).click()
    await expect(zijbalk.getByRole('button', { name: /9\.1/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /9\.2/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /9\.3/ })).toBeVisible()
    await zijbalk.getByRole('button', { name: /2\.3/ }).click()
    await expect(zijbalk.getByRole('button', { name: /2\.3/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await zijbalk.getByRole('button', { name: /Differentiëren/ }).click()
  } else {
    await page.getByRole('button', { name: /H2 –/ }).click()
    const menu = page.getByRole('dialog')
    const klikbaar = menu.getByRole('button', { name: /Differentiequotiënten berekenen/ })
    await expect(klikbaar).toContainText(/\d+/)
    await expect(menu.getByRole('button', { name: /2\.5/ })).toHaveCount(0)
    await menu.getByRole('button', { name: /2\.1/ }).click()
    await expect(menu.getByText('Soorten van stijgen')).toHaveCount(0)
    // Een klik op het hoofdstuk sluit dit menu. 7.1–7.4 en 9.1–9.2
    // controleert de computerzijbalk hierboven.
    await menu.getByRole('button', { name: /2\.3/ }).click()
    await expect(menu.getByRole('button', { name: /2\.3/ })).toHaveAttribute('aria-expanded', 'true')
    await menu.getByRole('button', { name: /Differentiëren/ }).click()
  }

  await expect(page.locator('#blok-h2-3d')).toBeInViewport()
  await expect(page.locator('#blok-h2-1d')).toBeAttached()
})

test('een open hoofdstuk klapt weer dicht en blijft dicht @telefoon', async ({ page }) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const breed = (page.viewportSize()?.width ?? 0) >= 1024
  if (breed) {
    const h2 = page.locator('aside').getByRole('button', { name: /H2 –/ })
    await expect(h2).toHaveAttribute('aria-expanded', 'true')
    await h2.click()
    await expect(h2).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('aside').getByRole('button', { name: /2\.1/ })).toHaveCount(0)
    return
  }

  await page.getByRole('button', { name: /H2 –/ }).click()
  const menu = page.getByRole('dialog')
  const h2 = menu.getByRole('button', { name: /H2 –/ })
  await expect(h2).toHaveAttribute('aria-expanded', 'true')
  await h2.click()
  await expect(h2).toHaveAttribute('aria-expanded', 'false')
  await expect(menu.getByRole('button', { name: /2\.1/ })).toHaveCount(0)
  await expect(menu).toBeVisible()
})

function vakkenOverlappen(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

test('omhoog scrollen schuift de kop meteen, en het poppetje dekt de link niet @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/oefenen')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const header = page.locator('header')
  const titel = page.getByRole('heading', { level: 1, name: 'Oefenen' })
  const scroller = page.locator('[data-oefen-scroll]')
  const voor = await titel.boundingBox()
  const headerVoor = await header.boundingBox()
  expect(voor && headerVoor && voor.y >= headerVoor.y + headerVoor.height - 1).toBeTruthy()

  const vak = await scroller.boundingBox()
  expect(vak).toBeTruthy()
  await page.mouse.move(vak!.x + vak!.width / 2, vak!.y + Math.min(280, vak!.height / 2))
  await page.mouse.wheel(0, 220)
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(40)
  const naOmlaag = await scroller.evaluate((el) => el.scrollTop)
  await page.mouse.wheel(0, -220)
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeLessThan(naOmlaag - 30)

  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  const terug = await titel.boundingBox()
  const headerNa = await header.boundingBox()
  expect(terug && headerNa && terug.y >= headerNa.y + headerNa.height - 1).toBeTruthy()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  const poppetje = await page.getByRole('button', { name: 'Vraag het Aaf' }).boundingBox()
  const link = await page.getByRole('link', { name: /integraaloefenen\.nl/ }).boundingBox()
  expect(poppetje && link && !vakkenOverlappen(poppetje, link)).toBeTruthy()
})
