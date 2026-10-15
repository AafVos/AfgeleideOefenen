import { expect, test } from '@playwright/test'

/**
 * De knop hoort weg te blijven zolang NEXT_PUBLIC_GOOGLE_LOGIN niet op 1
 * staat. De testrun zet die vlag expres leeg (scripts/e2e.mjs).
 */
test('Doorgaan met Google is verborgen op inloggen en registreren @telefoon', async ({
  page,
}) => {
  const knop = page.getByRole('button', { name: 'Doorgaan met Google' })

  await page.goto('/nl/inloggen')
  await expect(page.getByRole('heading', { name: 'Inloggen' })).toBeVisible()
  await expect(knop).toHaveCount(0)

  await page.goto('/nl/registreren')
  await expect(page.getByRole('heading', { name: 'Account aanmaken' })).toBeVisible()
  await expect(knop).toHaveCount(0)
})
