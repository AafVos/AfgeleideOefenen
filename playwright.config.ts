import { defineConfig, devices } from '@playwright/test'

/**
 * Instellingen voor de e2e-tests: een echte browser die door de site klikt
 * zoals een leerling.
 *
 * Draai ze met `npm run test:e2e`. Dat commando start deze tests via
 * `scripts/e2e.mjs`, dat de sleutels van de lokale Supabase opzoekt en
 * `AI_CHECK_MODE=stub` meegeeft. Rechtstreeks `npx playwright test` draaien
 * werkt daarom niet — zie AGENTS.md.
 *
 * De site draait hier bewust in ontwikkelstand (`npm run dev`). In
 * productiestand doet de neppe AI-controle niets (dat is de veiligheidsgrens
 * uit src/lib/ai/stub.ts) en zou de test de echte Gemini aanroepen.
 */

// Een eigen poort, zodat een `npm run dev` op 3000 blijft draaien tijdens
// de tests. Zit hij toch bezet: E2E_PORT=3178 npm run test:e2e
const PORT = Number(process.env.E2E_PORT ?? 3177)
// Met opzet `localhost` en niet `127.0.0.1`: de ontwikkelserver van Next
// blokkeert zijn eigen javascript als je hem via een ander adres opvraagt,
// en dan doet geen enkele knop het meer.
const BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/schone-start.ts',
  // Eén leerling, één database: tests mogen elkaar niet in de weg zitten.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // De ontwikkelserver bouwt een pagina pas als je hem opvraagt; de eerste
  // keer duurt dat even.
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }]]
    : [['list']],
  use: {
    baseURL: BASE_URL,
    locale: 'nl-NL',
    navigationTimeout: 60_000,
    actionTimeout: 20_000,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'computer',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      // De meeste leerlingen oefenen op hun telefoon. Daar draaien we de
      // belangrijkste weg nog een keer, op telefoonformaat (390x844).
      // Wel in Chromium: alleen dan hoeft de testomgeving één browser te
      // downloaden in plaats van twee.
      name: 'telefoon',
      grep: /@telefoon/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
