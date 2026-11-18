import { expect, test } from '@playwright/test'

import { geefAntwoord, kiesOpgave, logIn } from './leerling'

/**
 * De format-hint boven het antwoordveld bij de eerste poging deze sessie
 * (AFG-816): nog geen antwoord verzonden → hint zichtbaar, met een
 * voorbeeldknop die netjes in- en uitklapt (AFG-718). Na het eerste
 * verzonden antwoord blijft de hint weg, ook bij de volgende opgave.
 */
test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('format-hint staat aan bij een lege sessie en verdwijnt na het eerste antwoord @telefoon', async ({
  page,
}) => {
  await kiesOpgave(page, { soortSom: 'e2e', nummer: 1 })

  await expect(page.getByText('Typ alleen het antwoord')).toBeVisible()

  // De voorbeeldknop klapt in- en uit: tekst én pijltje wisselen (ontwerpregels).
  const toonKnop = page.getByText('Voorbeeld van een antwoord', { exact: true })
  await expect(toonKnop).toBeVisible()
  await expect(page.getByText('Bijvoorbeeld: bij het antwoord')).toBeHidden()

  await toonKnop.click()
  const verbergKnop = page.getByText('Verberg voorbeeld', { exact: true })
  await expect(verbergKnop).toBeVisible()
  await expect(page.getByText('Bijvoorbeeld: bij het antwoord')).toBeVisible()

  await verbergKnop.click()
  await expect(page.getByText('Voorbeeld van een antwoord', { exact: true })).toBeVisible()
  await expect(page.getByText('Bijvoorbeeld: bij het antwoord')).toBeHidden()

  // Eerste antwoord van deze sessie verzenden: de hint mag niet meer terugkomen.
  await geefAntwoord(page, 'onzin')
  await expect(page.getByText('Wat ging er mis?')).toBeVisible()
  await expect(page.getByText('Typ alleen het antwoord')).toBeHidden()

  await page.getByRole('button', { name: 'Opnieuw proberen' }).click()
  await expect(page.getByText('Typ alleen het antwoord')).toBeHidden()
})
