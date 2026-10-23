import { expect, test } from '@playwright/test'

import { logIn } from './leerling'

/**
 * Het hoofdmenu (computerformaat): "Theorie" en "Oefenen" hebben een
 * pijltje-omlaag dat een dropdown met hoofdstukken belooft. Een klik op het
 * label moet dat menu openen, niet meteen naar de overzichtspagina
 * navigeren (AFG-594).
 */
test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('een klik op "Theorie" opent het dropdown-menu in plaats van te navigeren', async ({
  page,
}) => {
  const knop = page.getByRole('button', { name: 'Theorie' })
  await knop.click()

  await expect(page.getByRole('link', { name: 'Overzicht' })).toBeVisible()
  await expect(page).toHaveURL(/\/nl\/dashboard/)

  // Buiten het menu klikken sluit het weer, zonder te navigeren.
  await page.locator('body').click({ position: { x: 5, y: 5 } })
  await expect(page.getByRole('link', { name: 'Overzicht' })).toBeHidden()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
})

test('Tab naar "Oefenen" toont het menu in plaats van weg te navigeren', async ({
  page,
}) => {
  const knop = page.getByRole('button', { name: 'Oefenen' })
  await knop.focus()

  await expect(page.getByRole('link', { name: 'Overzicht' })).toBeVisible()
  await expect(page).toHaveURL(/\/nl\/dashboard/)
})
