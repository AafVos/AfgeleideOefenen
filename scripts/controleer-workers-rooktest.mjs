#!/usr/bin/env node
/**
 * Rooktest voor de Workers-bouw (AFG-563): start de net gebouwde
 * `.open-next`-worker met Wrangler en haalt een server-gerenderde pagina op.
 *
 * `npm run cf:build` controleert alleen of het bouwen zelf lukt. Een
 * onafgevangen fout in de worker (bijvoorbeeld een manifest dat
 * `@opennextjs/cloudflare` niet kent) zie je pas als er echt een verzoek
 * doorheen gaat — precies wat hier gebeurde met Next 16.4.2 en
 * `@opennextjs/cloudflare` 1.20.10 ("Unexpected loadManifest(...) call!").
 *
 * Geen Supabase nodig: de fout trad op in de NextNodeServer-constructor, nog
 * vóór enige paginalogica draait.
 */
import { spawn } from 'node:child_process'
import net from 'node:net'

const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx'
const PAD = '/nl/inloggen'

function vrijePoort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.once('error', reject)
    server.listen(0, '127.0.0.1', () => {
      const adres = server.address()
      const poort = typeof adres === 'object' && adres ? adres.port : 0
      server.close(() => resolve(poort))
    })
  })
}

const poort = await vrijePoort()
console.log(`Workers-worker starten op poort ${poort}.`)

const worker = spawn(
  npx,
  ['opennextjs-cloudflare', 'preview', '--', '--port', String(poort), '--ip', '127.0.0.1'],
  { stdio: ['ignore', 'pipe', 'pipe'], env: process.env },
)

let uitvoer = ''
worker.stdout.setEncoding('utf8')
worker.stdout.on('data', (stuk) => {
  uitvoer += stuk
})
worker.stderr.setEncoding('utf8')
worker.stderr.on('data', (stuk) => {
  uitvoer += stuk
})

const stop = () => {
  if (!worker.killed) worker.kill()
}

try {
  const einde = Date.now() + 60_000
  let antwoord
  while (Date.now() < einde) {
    if (worker.exitCode != null) {
      console.error('De worker stopte al tijdens het opstarten:\n' + uitvoer)
      process.exit(1)
    }
    try {
      antwoord = await fetch(`http://127.0.0.1:${poort}${PAD}`, {
        signal: AbortSignal.timeout(5_000),
      })
      break
    } catch {
      await new Promise((r) => setTimeout(r, 400))
    }
  }

  if (!antwoord) {
    console.error('De worker reageerde niet binnen zestig seconden.\n' + uitvoer)
    process.exit(1)
  }

  const tekst = await antwoord.text()
  const isOnafgevangenFout =
    tekst.startsWith('Error:') || tekst.includes('Unexpected loadManifest')
  if (isOnafgevangenFout) {
    console.error(
      `De worker gooide een onafgevangen fout op ${PAD} (status ${antwoord.status}):\n${tekst.slice(0, 2000)}`,
    )
    process.exit(1)
  }

  console.log(`${PAD} gaf status ${antwoord.status} zonder dat de worker crashte.`)
} finally {
  stop()
}
