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
    const leeg = zijbalk.locator('[aria-disabled="true"]').filter({ hasText: 'Soorten van stijgen' })
    await expect(leeg).toBeVisible()
    await expect(leeg).toHaveClass(/text-xs/)
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
    await expect(
      menu.locator('[aria-disabled="true"]').filter({ hasText: 'Soorten van stijgen' }),
    ).toBeVisible()
    await menu.getByRole('button', { name: /H7 –/ }).click()
    await expect(menu.getByRole('button', { name: /7\.[1-4]/ })).toHaveCount(0)
    await expect(menu.getByRole('button', { name: /7\.5/ })).toBeVisible()
    await menu.getByRole('button', { name: /H9 –/ }).click()
    await expect(menu.getByRole('button', { name: /9\.1/ })).toHaveCount(0)
    await expect(menu.getByRole('button', { name: /9\.3/ })).toBeVisible()
    await menu.getByRole('button', { name: /2\.3/ }).click()
    await expect(menu.getByRole('button', { name: /2\.3/ })).toHaveAttribute('aria-expanded', 'true')
    await menu.getByRole('button', { name: /Differentiëren/ }).click()
  }

  await expect(page.locator('#blok-h2-3d')).toBeInViewport()
  await expect(page.locator('#blok-h2-1d')).toBeAttached()
})
