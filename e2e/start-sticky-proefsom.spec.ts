import { expect, test } from '@playwright/test'

/**
 * Vangnet tegen bounce op de startpagina (AFG-739): zodra de hero-CTA uit
 * beeld scrolt, moet een plakkende knop naar de proefsom verschijnen — maar
 * nooit zolang de proefsom zelf al (deels) in beeld is. Eerdere versie liet
 * de knop over het antwoordveld en de knoppenrij van de proefsom heen staan,
 * tot je er helemaal voorbij was gescrold (controle-FAIL op PR #451): die
 * verdween pas als de hele, vaak hoger-dan-het-scherm, proefsom-sectie
 * volledig gepasseerd was. Op deze pagina staat de proefsom maar een
 * handvol pixels onder de hero, dus deze test scrolt in kleine stappen door
 * de hele overgang en controleert bij elke stap de invariant: de plakkende
 * knop en de proefsom zijn nooit allebei tegelijk in beeld.
 */
test('plakkende proefsom-knop overlapt nooit de proefsom zelf @telefoon', async ({ page }) => {
  await page.goto('/nl')

  // Zelfde tekst als de hero-CTA, dus op `data-meet` zoeken in plaats van op
  // de rol/naam (die zou ook de hero-knop zelf kunnen raken).
  const stickyKnop = page.locator('[data-meet="start-sticky-proefsom"]')

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
  // proefsom: nergens mogen de plakkende knop en de proefsom allebei
  // zichtbaar zijn.
  for (let i = 1; i <= aantalStappen; i++) {
    // Scrollen en daarna een paar animatieframes wachten: de
    // `IntersectionObserver` in het component vuurt pas na de volgende
    // lay-out, niet synchroon binnen dezelfde `evaluate`-aanroep.
    const zichtbaarheid = await page.evaluate(
      ({ i, stap }) =>
        new Promise<{ doelZichtbaar: boolean; stickyZichtbaar: boolean }>((resolve) => {
          document.querySelector('main')!.scrollTop = i * stap
          requestAnimationFrame(() =>
            requestAnimationFrame(() => {
              const doel = document.getElementById('proefsom')!
              const rect = doel.getBoundingClientRect()
              const doelZichtbaar = rect.top < window.innerHeight && rect.bottom > 0
              const sticky = document.querySelector('[data-meet="start-sticky-proefsom"]')
              resolve({ doelZichtbaar, stickyZichtbaar: !!sticky })
            }),
          )
        }),
      { i, stap },
    )
    if (zichtbaarheid.stickyZichtbaar) {
      expect(
        zichtbaarheid.doelZichtbaar,
        `bij scrollTop ${i * stap}: de plakkende knop en de proefsom staan tegelijk in beeld`,
      ).toBe(false)
    }
  }

  // Ruim voorbij de proefsom (richting de FAQ): de knop is en blijft weg.
  await page.getByRole('heading', { name: 'Veelgestelde vragen' }).scrollIntoViewIfNeeded()
  await expect(stickyKnop).toBeHidden()
})
