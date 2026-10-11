#!/usr/bin/env node
/**
 * Een neppe Resend voor de e2e-tests: een postkantoortje dat mail aanneemt en
 * bewaart in plaats van hem echt te versturen.
 *
 * De welkomstmail van de site gaat via Resend en komt dus niet in de
 * testpostbus van Supabase (Mailpit) terecht. De Resend-bibliotheek kijkt zelf
 * naar `RESEND_BASE_URL` (zie node_modules/resend/dist/index.mjs), dus kan hij
 * in de tests hierheen gewezen worden zonder dat er één regel productiecode
 * verandert. `scripts/e2e.mjs` start dit servertje en zet die variabele;
 * `e2e/postbus.ts` haalt de opgevangen mail weer op.
 *
 * Wat dit servertje kent:
 *
 *   POST   /emails       de Resend-bibliotheek levert hier een mail af
 *   GET    /opgevangen   alles wat er tot nu toe is afgeleverd
 *   DELETE /opgevangen   alles weggooien, voor een schone start
 *
 * Het luistert alleen op deze computer (127.0.0.1) en bewaart niets op schijf:
 * stopt het servertje, dan is de mail weg.
 */
import { randomUUID } from 'node:crypto'
import { createServer } from 'node:http'

/** De mail die de site tijdens deze run "verstuurd" heeft, oudste eerst. */
const opgevangen = []

function antwoord(res, status, data) {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(data))
}

async function leesJson(req) {
  const stukken = []
  for await (const stuk of req) stukken.push(stuk)
  const tekst = Buffer.concat(stukken).toString('utf8')
  return tekst ? JSON.parse(tekst) : {}
}

/** `to` mag bij Resend één adres zijn of een rijtje; hier altijd een rijtje. */
function adressen(waarde) {
  const rij = Array.isArray(waarde) ? waarde : [waarde]
  return rij.filter((a) => typeof a === 'string' && a.trim() !== '')
}

const server = createServer(async (req, res) => {
  const pad = new URL(req.url ?? '/', 'http://postkantoor').pathname

  if (req.method === 'POST' && pad === '/emails') {
    // Zonder sleutel geeft de echte Resend een foutcode. Hier ook, zodat een
    // test die de sleutel vergeet dat ziet in plaats van stil niets te doen.
    if (!(req.headers.authorization ?? '').startsWith('Bearer ')) {
      return antwoord(res, 401, {
        name: 'missing_api_key',
        message: 'Missing API key.',
        statusCode: 401,
      })
    }

    let mail
    try {
      mail = await leesJson(req)
    } catch {
      return antwoord(res, 422, {
        name: 'validation_error',
        message: 'Geen leesbare JSON.',
        statusCode: 422,
      })
    }

    const id = randomUUID()
    opgevangen.push({
      id,
      ontvangenOp: new Date().toISOString(),
      from: typeof mail.from === 'string' ? mail.from : '',
      to: adressen(mail.to),
      subject: typeof mail.subject === 'string' ? mail.subject : '',
      html: typeof mail.html === 'string' ? mail.html : '',
      text: typeof mail.text === 'string' ? mail.text : '',
    })
    return antwoord(res, 200, { id })
  }

  if (pad === '/opgevangen') {
    if (req.method === 'GET') return antwoord(res, 200, { mails: opgevangen })
    if (req.method === 'DELETE') {
      opgevangen.length = 0
      return antwoord(res, 200, { mails: [] })
    }
  }

  antwoord(res, 404, {
    name: 'not_found',
    message: `Het neppe postkantoor kent ${req.method} ${pad} niet.`,
    statusCode: 404,
  })
})

// Poort 0: het besturingssysteem kiest een vrije poort. Welke dat werd, leest
// `scripts/e2e.mjs` van deze regel af.
server.listen(0, '127.0.0.1', () => {
  console.log(`poort=${server.address().port}`)
})
