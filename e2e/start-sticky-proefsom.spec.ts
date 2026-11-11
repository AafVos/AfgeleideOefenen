import { expect, test } from '@playwright/test'

/**
 * Vangnet tegen bounce op de startpagina (AFG-739): sinds AFG-778 staat de
 * proefsom-kaart al direct onder de H1, dus wie niet scrolt ziet hem meteen.
 * Deze balk vangt het andere geval op: wie wél voorbij de proefsom scrolt
 * (bijvoorbeeld naar de uitleg of de FAQ) zonder hem te maken, krijgt een
 * plakkende knop terug naar de proefsom — en die blijft staan, net als
 * `StickyProbeerBalk` op de voorbeeldpagina's (board-keuze AFG-751).
 */
test('plakkende proefsom-knop verschijnt pas als de proefsom uit beeld scrolt, en blijft staan @telefoon', async ({
  page,
}) => {
  await page.goto('/nl')

  const stickyKnop = page.locator('[data-meet="start-sticky-proefsom"]')
  const proefsom = page.locator('#proefsom')

  // De proefsom-kaart staat direct onder de H1 (AFG-778): bovenaan, zonder
  // scrollen, is hij al in beeld en is de plakkende knop overbodig.
  await expect(proefsom).toBeInViewport()
  await expect(stickyKnop).toBeHidden()

  // Voorbij de proefsom scrollen (richting de uitleg/FAQ): de knop verschijnt
  // en blijft staan.
  await page.getByRole('heading', { name: 'Veelgestelde vragen' }).scrollIntoViewIfNeeded()
  await expect(stickyKnop).toBeVisible()
})
