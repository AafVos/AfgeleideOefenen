#!/usr/bin/env node
/**
 * `npm run test:e2e` — draait de Playwright-tests tegen de LOKALE Supabase.
 *
 * Waarom een scriptje en niet gewoon `playwright test`: de sleutels van de
 * lokale Supabase horen niet in de repo. Dit script vraagt ze op bij de CLI
 * (`supabase status`) en geeft ze door aan de tests. Draait er geen lokale
 * Supabase, dan stopt het met uitleg in plaats van per ongeluk tegen de echte
 * database te testen.
 */
import { spawnSync } from 'node:child_process'

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

/** Haalt de gegevens van de lokale Supabase op; null als die niet draait. */
function lokaleSupabase() {
  const res = spawnSync(npx, ['supabase', 'status', '-o', 'env'], {
    encoding: 'utf8',
  })
  if (res.status !== 0) return null

  /** @type {Record<string, string>} */
  const waarden = {}
  for (const regel of (res.stdout ?? '').split('\n')) {
    const m = /^([A-Z0-9_]+)="(.*)"$/.exec(regel.trim())
    if (m) waarden[m[1]] = m[2]
  }
  return waarden.API_URL ? waarden : null
}

const supabase = lokaleSupabase()
if (!supabase) {
  console.error(
    [
      '',
      'Er draait geen lokale Supabase.',
      '',
      '  Starten:          npx supabase start',
      '  Verse database:   npx supabase db reset',
      '',
    ].join('\n'),
  )
  process.exit(1)
}

const host = new URL(supabase.API_URL).hostname
if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(
    `\nDe e2e-tests draaien alleen tegen een lokale Supabase, niet tegen ${supabase.API_URL}.\n`,
  )
  process.exit(1)
}

// De testpostbus (Mailpit). Oudere CLI's noemen hem INBUCKET_URL; draait hij
// niet, dan valt dit terug op de standaardpoort en zegt de test zelf dat er
// geen postbus is.
const postbus =
  supabase.MAILPIT_URL ?? supabase.INBUCKET_URL ?? 'http://127.0.0.1:54324'

const env = {
  ...process.env,
  E2E_POSTBUS_URL: postbus,
  NEXT_PUBLIC_SUPABASE_URL: supabase.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabase.SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SITE: 'afgeleiden',
  // Geen echte Gemini en geen echte mail in de tests.
  AI_CHECK_MODE: 'stub',
  RESEND_API_KEY: '',
}

const run = spawnSync(npx, ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
})
process.exit(run.status ?? 1)
