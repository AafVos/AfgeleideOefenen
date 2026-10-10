import { expect, test } from '@playwright/test'

import { NIEUWE_LEERLING, logIn, testDatabase } from './leerling'

/**
 * Wat een kersverse leerling bij binnenkomst krijgt.
 *
 * Op een breed scherm start de rondleiding zelf. Op een telefoon doet hij
 * dat bewust niet — hij wijst items in de bovenbalk aan, en die zitten daar
 * in het menu — maar Aaf hoort dan wél rechtsonder te staan, zodat je iets
 * kunt vragen of de rondleiding alsnog kunt opvragen (zie AFG-101).
 */

/** Vanaf deze breedte start de rondleiding zelf; zie src/components/welcome-tour.tsx. */
const BREED_SCHERM = 900

const WELKOM = 'Hoi! Ik ben Aaf.'

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

test('op de telefoon staat Aaf klaar voor een nieuwe leerling @telefoon', async ({
  page,
}) => {
  const breedte = page.viewportSize()?.width ?? 0
  test.skip(breedte >= BREED_SCHERM, 'Dit gaat over telefoonformaat.')

  const aafKnop = page.getByRole('button', { name: 'Vraag het Aaf' })
  await expect(aafKnop).toBeVisible()

  // En hij is met een duim te raken.
  const vak = await aafKnop.boundingBox()
  expect(vak?.width ?? 0).toBeGreaterThanOrEqual(44)
  expect(vak?.height ?? 0).toBeGreaterThanOrEqual(44)

  // Een vraag stellen kan.
  await aafKnop.click()
  await expect(page.getByPlaceholder('Typ je vraag')).toBeVisible()

  // En de rondleiding alsnog bekijken ook — binnen beeld.
  await page.getByRole('button', { name: 'Rondleiding bekijken' }).click()
  const ballon = page.getByRole('dialog')
  await expect(ballon).toContainText(WELKOM)

  const doos = await ballon.boundingBox()
  expect(doos?.x ?? -1).toBeGreaterThanOrEqual(0)
  expect((doos?.x ?? 0) + (doos?.width ?? 0)).toBeLessThanOrEqual(breedte)

  // Na afloop staat Aaf weer gewoon rechtsonder.
  await page.getByRole('button', { name: 'Ja, graag!' }).click()
  await page.getByRole('button', { name: 'Overslaan' }).click()
  await expect(aafKnop).toBeVisible()
})

test('op een breed scherm start de rondleiding vanzelf', async ({ page }) => {
  test.skip(
    (page.viewportSize()?.width ?? 0) < BREED_SCHERM,
    'Dit gaat over een breed scherm.',
  )

  const ballon = page.getByRole('dialog')
  await expect(ballon).toContainText(WELKOM)

  // De tweede stap wijst Theorie in de bovenbalk aan, met een ring eromheen.
  await page.getByRole('button', { name: 'Ja, graag!' }).click()
  await expect(ballon).toContainText('Bij Theorie')
  await expect(page.locator('[data-tour="theorie"].tour-ring')).toBeVisible()

  await page.getByRole('button', { name: 'Overslaan' }).click()
  await expect(page.getByRole('button', { name: 'Vraag het Aaf' })).toBeVisible()
})
