import { expect, test } from '@playwright/test'

/**
 * Vangnet tegen bounce op de startpagina (AFG-739): zodra de hero-CTA uit
 * beeld scrolt, verschijnt een plakkende knop naar de proefsom en blijft
 * die staan — net als `StickyProbeerBalk` op de voorbeeldpagina's.
 *
 * Board-keuze na twee controle-FAILs (AFG-751): eerst verdween de knop pas
 * als de hele (vaak hoger-dan-het-scherm) proefsom-sectie volledig
 * gepasseerd was, waardoor hij over het antwoordveld en de knoppenrij heen
 * bleef staan. Daarna verdween hij juist helemaal nooit meer op realistische
 * schermen, omdat hero en proefsom maar een handvol pixels uit elkaar
 * staan. Nu blijft de knop gewoon staan, en vangt `home-demo.tsx` het
 * overlap-risico op met extra onderpadding na de proefsom-sectie. Deze test
 * scrolt in kleine stappen door de hele proefsom heen en controleert bij
 * elke stap de invariant: de plakkende knop overlapt nooit de "Nakijken"
 * knop van de proefsom zelf.
 */
test('plakkende proefsom-knop blijft staan en overlapt nooit de proefsom zelf @telefoon', async ({
  page,
}) => {
  await page.goto('/nl')

  // Zelfde tekst als de hero-CTA, dus op `data-meet` zoeken in plaats van op
  // de rol/naam (die zou ook de hero-knop zelf kunnen raken).
  const stickyKnop = page.locator('[data-meet="start-sticky-proefsom"]')
  const nakijkenKnop = page.locator('[data-meet="home-proefsom-nakijken"]')

  // Bovenaan (hero in beeld): geen plakkende knop nodig.
  await expect(stickyKnop).toBeHidden()

  const { stap, aantalStappen } = await page.evaluate(() => {
    const main = document.querySelector('main')
    const doel = document.getElementById('proefsom')
    if (!main || !doel) throw new Error('main of doel niet gevonden')
    const totaal = doel.getBoundingClientRect().bottom + main.scrollTop
    return { stap: 30, aantalStappen: Math.ceil(totaal / 30) }
  })

  // De pagina scrolt zelf niet op `window` maar op de `main` (zie
  // `(start)/layout.tsx`). In kleine stappen van de hero tot ruim voorbij de
  // proefsom: zodra de plakkende knop er is, mag hij nooit de "Nakijken"
  // knop overlappen.
  let ooitZichtbaar = false
  for (let i = 1; i <= aantalStappen; i++) {
    // Scrollen en daarna een paar animatieframes wachten: de
    // `IntersectionObserver` in het component vuurt pas na de volgende
    // lay-out, niet synchroon binnen dezelfde `evaluate`-aanroep.
    await page.evaluate(
      (scrollTop) =>
        new Promise<void>((resolve) => {
          document.querySelector('main')!.scrollTop = scrollTop
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        }),
      i * stap,
    )

    const stickyBox = await stickyKnop.boundingBox()
    if (!stickyBox) continue
    ooitZichtbaar = true

    const nakijkenBox = await nakijkenKnop.boundingBox()
    if (!nakijkenBox) continue

    const overlapt =
      stickyBox.x < nakijkenBox.x + nakijkenBox.width &&
      stickyBox.x + stickyBox.width > nakijkenBox.x &&
      stickyBox.y < nakijkenBox.y + nakijkenBox.height &&
      stickyBox.y + stickyBox.height > nakijkenBox.y
    expect(
      overlapt,
      `bij scrollTop ${i * stap}: de plakkende knop overlapt de "Nakijken"-knop`,
    ).toBe(false)
  }
  expect(ooitZichtbaar, 'de plakkende knop is tijdens het scrollen nooit verschenen').toBe(true)

  // Ruim voorbij de proefsom (richting de FAQ): de knop blijft staan.
  await page.getByRole('heading', { name: 'Veelgestelde vragen' }).scrollIntoViewIfNeeded()
  await expect(stickyKnop).toBeVisible()
})
