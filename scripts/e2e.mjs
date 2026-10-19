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
import { spawn, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'

/** Adressen die op deze computer zelf uitkomen. */
const LOKAAL = ['localhost', '127.0.0.1', '::1']

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

/**
 * Start het neppe postkantoor (`scripts/nep-resend.mjs`) en wacht tot het
 * luistert. Het kiest zelf een vrije poort en zegt op zijn eerste regel welke.
 */
async function startNepResend() {
  const kind = spawn(
    process.execPath,
    [fileURLToPath(new URL('./nep-resend.mjs', import.meta.url))],
    { stdio: ['ignore', 'pipe', 'inherit'] },
  )

  const poort = await new Promise((klaar, mislukt) => {
    let gelezen = ''
    const grens = setTimeout(() => {
      mislukt(new Error('Het neppe postkantoor startte niet binnen tien seconden.'))
    }, 10_000)

    kind.stdout.setEncoding('utf8')
    kind.stdout.on('data', (stuk) => {
      gelezen += stuk
      const m = /^poort=(\d+)$/m.exec(gelezen)
      if (m) {
        clearTimeout(grens)
        klaar(Number(m[1]))
      }
    })
    kind.once('exit', (code) => {
      clearTimeout(grens)
      mislukt(new Error(`Het neppe postkantoor stopte meteen (afsluitcode ${code}).`))
    })
  })

  return { url: `http://127.0.0.1:${poort}`, stop: () => kind.kill() }
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
if (!LOKAAL.includes(host)) {
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

// De mail die de site zélf stuurt (de welkomstmail) gaat via Resend. In de
// tests nemen we die over met een postkantoortje op deze computer.
const nepResend = await startNepResend().catch((e) => {
  console.error(`\n${e.message}\n`)
  process.exit(1)
})

const env = {
  ...process.env,
  E2E_POSTBUS_URL: postbus,
  NEXT_PUBLIC_SUPABASE_URL: supabase.API_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: supabase.ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: supabase.SERVICE_ROLE_KEY,
  // Geen echte Gemini in de tests.
  AI_CHECK_MODE: 'stub',
  // En geen echte mail: Resend kijkt zelf naar RESEND_BASE_URL, dus hiermee
  // komt alles wat de site verstuurt in het postkantoortje terecht. De sleutel
  // is verzonnen, maar moet er wél zijn: zonder sleutel slaat de site het
  // versturen over en controleert de test niets.
  RESEND_BASE_URL: nepResend.url,
  RESEND_API_KEY: 're_nep',
  // De links in de mail die de site stuurt wijzen naar de testserver en niet
  // naar de echte site. Zo kan een test er ook echt op klikken — en kan een
  // link uit een test nooit op de echte site uitkomen.
  NEXT_PUBLIC_SITE_URL: `http://localhost:${process.env.E2E_PORT ?? 3177}`,
  // Verzonnen geheim voor de webhooks; niets uit productie.
  WEBHOOK_SECRET: 'e2e-nep-geheim',
  // De knop "Doorgaan met Google" blijft uit. Die hoort pas aan als de
  // provider in Supabase klaarstaat. Een waarde uit de omgeving van deze
  // computer mag de test daar niet omheen zetten.
  NEXT_PUBLIC_GOOGLE_LOGIN: '',
}

// Harde rem. Wijst Resend naar iets anders dan deze computer, dan gaat er
// echte mail naar echte leerlingen. Dan stoppen we, net als hierboven bij een
// niet-lokale Supabase.
const mailHost = new URL(env.RESEND_BASE_URL).hostname
if (!LOKAAL.includes(mailHost)) {
  nepResend.stop()
  console.error(
    `\nDe e2e-tests mogen geen echte mail versturen. RESEND_BASE_URL wijst naar ${env.RESEND_BASE_URL} en niet naar deze computer.\n`,
  )
  process.exit(1)
}

const run = spawnSync(npx, ['playwright', 'test', ...process.argv.slice(2)], {
  stdio: 'inherit',
  env,
})
nepResend.stop()
process.exit(run.status ?? 1)
