// Na de OpenNext-bouw:
// 1. de cache bij de statische bestanden leggen (de live bouw doet dat niet
//    altijd zelf);
// 2. de startpagina, de theoriepagina's, het overzicht van de uitlegvideo's
//    en de voorbeeldpagina's als los HTML-bestand klaarzetten;
// 3. de worker klein houden voor een bezoeker zonder sessie. De zware
//    Next-bundel start pas als die echt nodig is.
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import { ontbrekendeSupabaseVariabelen } from './statische-cache-omgeving.mjs'

const wortel = '.open-next'
const cache = path.join(wortel, 'cache')
const bestanden = path.join(wortel, 'assets')
const cacheBijBestanden = path.join(bestanden, 'cdn-cgi/_next_cache')
const startHtml = path.join(bestanden, 'cdn-cgi/start.html')
const worker = path.join(wortel, 'worker.js')
const workerNext = path.join(wortel, 'worker-next.js')
const merkteken = 'STARTPAGINA_SNEL'

const ingang = `// ${merkteken}
// Bezoekers zonder sessie krijgen de startpagina, de theoriepagina's, het
// overzicht van de uitlegvideo's en de voorbeeldpagina's uit een bestand. De
// zware Next-bundel (worker-next.js) wordt pas geladen als die echt nodig
// is. Iemand die is ingelogd gaat wel door die bundel, zodat de kop klopt.
import {
  anoniemeInloggenPagina,
  anoniemeRegistrerenPagina,
  anoniemeStartpagina,
  anoniemeTheorieBestand,
  anoniemeUitlegVideosPagina,
  anoniemeVoorbeeldBestand,
  statischZonderPersoonlijk,
} from "../src/lib/startpagina-snel.ts";

export { DOQueueHandler } from "./.build/durable-objects/queue.js";
export { DOShardedTagCache } from "./.build/durable-objects/sharded-tag-cache.js";
export { BucketCachePurge } from "./.build/durable-objects/bucket-cache-purge.js";

function uitBestand(bestand) {
  const headers = new Headers();
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("x-nextjs-prerender", "1");
  return new Response(bestand.body, { status: 200, headers });
}

export default {
  async fetch(request, env, ctx) {
    if (env.ASSETS && anoniemeStartpagina(request)) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/start.html",
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        antwoord.headers.set(
          "cache-control",
          "s-maxage=31536000, stale-while-revalidate=2592000",
        );
        antwoord.headers.set("x-startpagina", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    const theorie = anoniemeTheorieBestand(request);
    if (env.ASSETS && theorie) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/theorie/" + theorie,
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        // Niet openbaar cachen: een ingelogde leerling mag deze versie
        // niet van de rand krijgen. Die gaat hieronder door de server.
        antwoord.headers.set("cache-control", "private, no-store");
        antwoord.headers.set("x-theorie", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    if (env.ASSETS && anoniemeUitlegVideosPagina(request)) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/uitleg-videos/index.html",
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        antwoord.headers.set("cache-control", "private, no-store");
        antwoord.headers.set("x-uitleg-videos", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    if (env.ASSETS && anoniemeInloggenPagina(request)) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/inloggen/index.html",
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        antwoord.headers.set("cache-control", "private, no-store");
        antwoord.headers.set("x-inloggen", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    if (env.ASSETS && anoniemeRegistrerenPagina(request)) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/registreren/index.html",
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        antwoord.headers.set("cache-control", "private, no-store");
        antwoord.headers.set("x-registreren", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    const voorbeeld = anoniemeVoorbeeldBestand(request);
    if (env.ASSETS && voorbeeld) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/voorbeeld/" + voorbeeld,
      );
      if (bestand.ok) {
        const antwoord = uitBestand(bestand);
        antwoord.headers.set("cache-control", "private, no-store");
        antwoord.headers.set("x-voorbeeld", "bestand");
        return antwoord;
      }
      await bestand.body?.cancel();
    }

    const url = new URL(request.url);
    const zonder = statischZonderPersoonlijk(url.pathname);
    if (zonder) {
      url.pathname = zonder;
      request = new Request(url, request);
    }

    const next = await import("./worker-next.js");
    return next.default.fetch(request, env, ctx);
  },

  // De nachtelijke taken. Cloudflare roept dit aan volgens triggers.crons in
  // wrangler.jsonc. Het echte werk staat in gewone routes van de site, dus
  // hier zetten we alleen de verzoeken in elkaar en geven ze aan de
  // Next-bundel — zonder het netwerk op te gaan. Eén route die mislukt mag de
  // andere niet tegenhouden.
  async scheduled(event, env, ctx) {
    const basis = env.NEXT_PUBLIC_SITE_URL || "https://www.afgeleideoefenen.nl";
    const next = await import("./worker-next.js");

    async function roepAan(pad) {
      const verzoek = new Request(basis + pad, {
        method: "POST",
        headers: { "x-webhook-secret": env.WEBHOOK_SECRET || "" },
      });
      try {
        const antwoord = await next.default.fetch(verzoek, env, ctx);
        // Alleen de status in de log: gegevens van leerlingen horen daar niet in.
        console.log("[" + pad + "] status " + antwoord.status);
        await antwoord.body?.cancel();
      } catch (fout) {
        console.error("[" + pad + "] " + fout);
      }
    }

    // AFG-667: de dagtotalen van de klikmeting moeten hier draaien, niet meer
    // afhankelijk van verkeer op /api/meet.
    await roepAan("/api/cron/meting-onderhoud");
    await roepAan("/api/cron/herinneringen");
  },
};
`

function verzamel(map, uitkomst, naam) {
  if (!fs.existsSync(map)) return
  for (const item of fs.readdirSync(map, { withFileTypes: true })) {
    const pad = path.join(map, item.name)
    if (item.isDirectory()) verzamel(pad, uitkomst, naam)
    else if (item.name === naam) uitkomst.push(pad)
  }
}

// Geen sessie gezien bij het binnenhalen van het verzoek (anoniemePagina),
// maar wel een sessiekoekje in de browser: dan toch naar het dashboard, in
// plaats van de leerling op een bezoekerspagina te laten staan.
const naarDashboardScript = `<script>(function(){var delen=document.cookie.split(";");for(var i=0;i<delen.length;i++){var naam=delen[i].split("=")[0].trim();if(/^sb-.+-auth-token(?:\\.\\d+)?$/.test(naam)){location.replace("/nl/dashboard");return}}})()</script>`

function schrijfStartpagina() {
  const kandidaten = []
  verzamel(cache, kandidaten, 'nl.cache')
  const gekozen = kandidaten.find((pad) => pad.includes(`${path.sep}$${path.sep}`))
  if (!gekozen) {
    throw new Error('Geen klaargezette startpagina in de OpenNext-cache.')
  }

  const pagina = JSON.parse(fs.readFileSync(gekozen, 'utf8'))
  const html = pagina.html
  if (typeof html !== 'string' || !html.startsWith('<!DOCTYPE')) {
    throw new Error('De klaargezette startpagina heeft geen HTML.')
  }
  if (!html.includes('Afgeleide oefenen')) {
    throw new Error('De klaargezette startpagina mist de kop.')
  }

  const metScript = html.includes(naarDashboardScript)
    ? html
    : html.replace('<head>', `<head>${naarDashboardScript}`)

  fs.mkdirSync(path.dirname(startHtml), { recursive: true })
  fs.writeFileSync(startHtml, metScript)
  // Zonder dit bestand start de worker voor /nl. Met het bestand geeft
  // Cloudflare de pagina zelf, zonder de worker af te wachten.
  const alsBestand = path.join(bestanden, 'nl/index.html')
  fs.mkdirSync(path.dirname(alsBestand), { recursive: true })
  fs.writeFileSync(alsBestand, metScript)
}

const THEORIE_WORTEL = 'src/app/[locale]/(paginas)/theorie'
const MESSAGES_BESTAND = 'messages/nl.json'
const VOORBEELDEN_BESTAND = 'src/content/voorbeelden.ts'
// Een ingelogde leerling mag het losse bestand niet houden: dat heeft de
// kop van een bezoeker. Het script stuurt hem naar het adres waarop de
// gewone server de pagina opbouwt.
const sessieScript = `<script>/*statisch-sessie*/(function(){var delen=document.cookie.split(";");for(var i=0;i<delen.length;i++){var naam=delen[i].split("=")[0].trim();if(/^sb-.+-auth-token(?:\\.\\d+)?$/.test(naam)){var pad=location.pathname;if(pad.length>1&&pad.slice(-1)==="/")pad=pad.slice(0,-1);location.replace(pad+"/persoonlijk"+location.search+location.hash);return}}})()</script>`
const THEORIE_TITEL = {
  index: 'Differentiëren: alle regels op één pagina',
}

function theoriePaginas() {
  const paginas = [
    {
      pad: '/nl/theorie',
      bestand: 'index.html',
      titel: THEORIE_TITEL.index,
    },
  ]
  for (const item of fs.readdirSync(THEORIE_WORTEL, { withFileTypes: true })) {
    if (!item.isDirectory()) continue
    if (!fs.existsSync(path.join(THEORIE_WORTEL, item.name, 'page.tsx'))) continue
    const bron = path.join('src/content/theory', `${item.name}.ts`)
    const tekst = fs.readFileSync(bron, 'utf8')
    const titel = tekst.match(/_TITEL = '([^']+)'/)
    if (!titel) {
      throw new Error(`Geen titel gevonden voor de theoriepagina ${item.name}.`)
    }
    paginas.push({
      pad: `/nl/theorie/${item.name}`,
      bestand: `${item.name}.html`,
      titel: titel[1],
    })
  }
  return paginas
}

function uitlegVideosPaginas() {
  const tekst = fs.readFileSync(MESSAGES_BESTAND, 'utf8')
  const titel = tekst.match(/"UitlegVideos":\s*{\s*"title":\s*"([^"]+)"/)
  if (!titel) {
    throw new Error('Geen titel gevonden voor het overzicht van de uitlegvideo’s.')
  }
  return [{ pad: '/nl/uitleg-videos', bestand: 'index.html', titel: titel[1] }]
}

function inloggenPaginas() {
  const tekst = fs.readFileSync(MESSAGES_BESTAND, 'utf8')
  const titel = tekst.match(/"Login":\s*{\s*"title":\s*"([^"]+)"/)
  if (!titel) {
    throw new Error('Geen titel gevonden voor de inlogpagina.')
  }
  return [{ pad: '/nl/inloggen', bestand: 'index.html', titel: titel[1] }]
}

function registrerenPaginas() {
  const tekst = fs.readFileSync(MESSAGES_BESTAND, 'utf8')
  const titel = tekst.match(/"Register":\s*{\s*"title":\s*"([^"]+)"/)
  if (!titel) {
    throw new Error('Geen titel gevonden voor de registratiepagina.')
  }
  return [{ pad: '/nl/registreren', bestand: 'index.html', titel: titel[1] }]
}

function voorbeeldPaginas() {
  const tekst = fs.readFileSync(VOORBEELDEN_BESTAND, 'utf8')
  const paginas = []
  const regex = /slug:\s*"([a-z0-9-]+)"[\s\S]*?kop:\s*"([^"]+)"/g
  let gevonden
  while ((gevonden = regex.exec(tekst))) {
    paginas.push({
      pad: `/nl/voorbeeld/${gevonden[1]}`,
      bestand: `${gevonden[1]}.html`,
      titel: gevonden[2],
    })
  }
  if (paginas.length === 0) {
    throw new Error('Geen voorbeeldpagina’s gevonden.')
  }
  return paginas
}

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

function leegStroom(stroom) {
  // De buffer moet leeg, anders blijft de server hangen. De tekst zelf
  // schrijven we niet weg: daar kan bouw-uitvoer in staan die niet in een
  // logboek hoort.
  stroom?.on('data', () => {})
}

// Standaard-bevestiging dat een opgehaalde pagina echt de versie zonder
// sessie is: die linkt naar de inlogpagina. Voor de inlogpagina zelf klopt
// die aanname niet (zie inloggenPaginas hieronder), die heeft zijn eigen
// bevestiging.
function isVersieZonderSessie(html) {
  return html.includes('href="/nl/inloggen"')
}

/**
 * Haalt `paginas` op bij de draaiende `next start`-server en zet ze klaar
 * als los bestand: verborgen onder `cdn-cgi/<mapNaam>` voor de worker zelf,
 * en (als `openbaarZetten` aan staat) ook openbaar op hun eigen adres zodat
 * Cloudflare ze rechtstreeks als statisch bestand serveert, zonder de worker
 * aan te roepen.
 *
 * Staat het pad in `run_worker_first` (wrangler.jsonc), dan hoort
 * `openbaarZetten` uit: OpenNext's eigen asset-resolver serveert zo'n
 * openbaar bestand namelijk zelf óók terug zodra de worker draait, los van
 * elke zoekopdracht (zie node_modules/@opennextjs/cloudflare/dist/api/overrides/asset-resolver).
 * Dat ondermijnt precies de uitzondering die `run_worker_first` daar mogelijk
 * moest maken (AFG-637): `anoniemeInloggenPagina`/`anoniemeUitlegVideosPagina`
 * laten een verzoek met `?mail=`, `?error=`, `?naar=` of `?video=` terecht
 * naar de echte server gaan, maar die kreeg zo alsnog het kale bestand terug.
 */
async function schrijfStatischeMap(
  poort,
  mapNaam,
  paginas,
  {
    controleerAnoniem = isVersieZonderSessie,
    sessieHerkenningScript = sessieScript,
    openbaarZetten = true,
  } = {},
) {
  const map = path.join(bestanden, 'cdn-cgi', mapNaam)
  fs.mkdirSync(map, { recursive: true })
  for (const pagina of paginas) {
    const antwoord = await fetch(`http://127.0.0.1:${poort}${pagina.pad}`)
    if (!antwoord.ok) {
      throw new Error(`${pagina.pad} gaf status ${antwoord.status}.`)
    }
    const html = await antwoord.text()
    if (!html.startsWith('<!DOCTYPE')) {
      throw new Error(`${pagina.pad} heeft geen HTML.`)
    }
    if (!html.includes(pagina.titel)) {
      throw new Error(`${pagina.pad} mist de titel.`)
    }
    if (!controleerAnoniem(html)) {
      throw new Error(`${pagina.pad} is niet de versie zonder sessie.`)
    }
    const metScript = html.includes(sessieHerkenningScript)
      ? html
      : html.replace('<head>', `<head>${sessieHerkenningScript}`)
    fs.writeFileSync(path.join(map, pagina.bestand), metScript)
    if (!openbaarZetten) continue
    // Zonder dit bestand start de worker. Met het bestand geeft Cloudflare
    // de pagina zelf, net als de startpagina.
    const openbaar = path.join(bestanden, pagina.pad.replace(/^\//, ''), 'index.html')
    fs.mkdirSync(path.dirname(openbaar), { recursive: true })
    fs.writeFileSync(openbaar, metScript)
  }
}

async function schrijfStatischePaginas() {
  const poort = await vrijePoort()
  if (!poort || poort <= 3100) {
    throw new Error('Geen vrije poort voor de statische pagina’s.')
  }
  console.log(`Statische pagina's ophalen op poort ${poort}.`)

  const server = spawn(
    process.execPath,
    [
      path.join('node_modules/next/dist/bin/next'),
      'start',
      '--port',
      String(poort),
      '--hostname',
      '127.0.0.1',
    ],
    {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: process.env,
    },
  )
  leegStroom(server.stdout)
  leegStroom(server.stderr)

  const stop = () => {
    if (!server.pid) return
    try {
      process.kill(-server.pid, 'SIGTERM')
    } catch {
      try {
        process.kill(server.pid, 'SIGTERM')
      } catch {
        // De server is al gestopt.
      }
    }
  }

  try {
    const einde = Date.now() + 90_000
    let laatste = 'geen antwoord'
    let klaar = false
    while (Date.now() < einde) {
      if (server.exitCode != null) break
      try {
        const antwoord = await fetch(`http://127.0.0.1:${poort}/nl/theorie`, {
          signal: AbortSignal.timeout(5_000),
        })
        if (antwoord.ok) {
          klaar = true
          await antwoord.body?.cancel()
          break
        }
        laatste = `status ${antwoord.status}`
        await antwoord.body?.cancel()
      } catch (fout) {
        laatste = fout instanceof Error ? fout.message : String(fout)
      }
      await new Promise((r) => setTimeout(r, 400))
    }
    if (!klaar) {
      throw new Error(
        `De statische pagina's konden niet worden opgebouwd (${laatste}).`,
      )
    }

    await schrijfStatischeMap(poort, 'theorie', theoriePaginas())
    // /nl/uitleg-videos staat in run_worker_first (?video= moet naar de
    // server kunnen doorsturen), dus geen openbaar bestand op het echte pad:
    // zie de uitleg bij schrijfStatischeMap hierboven (AFG-637).
    await schrijfStatischeMap(poort, 'uitleg-videos', uitlegVideosPaginas(), {
      openbaarZetten: false,
    })
    await schrijfStatischeMap(poort, 'voorbeeld', voorbeeldPaginas())
    // De inlogpagina linkt niet naar zichzelf; de bevestiging dat dit de
    // versie zonder sessie is, is hier het inlogformulier zelf. Een
    // gevonden sessiekoekje stuurt hier naar het dashboard, niet naar een
    // "/persoonlijk"-adres dat voor deze pagina niet bestaat.
    // /nl/inloggen staat ook in run_worker_first (?mail=, ?error=, ?naar=),
    // dus ook hier geen openbaar bestand op het echte pad (AFG-637).
    await schrijfStatischeMap(poort, 'inloggen', inloggenPaginas(), {
      controleerAnoniem: (html) => html.includes('name="email"'),
      sessieHerkenningScript: naarDashboardScript,
      openbaarZetten: false,
    })
    // De registratiepagina linkt wel naar /nl/inloggen (de standaard-
    // bevestiging klopt dus), maar staat net als /nl/inloggen in
    // run_worker_first (`?van=`, `?naar=`), dus ook hier geen openbaar
    // bestand op het echte pad (AFG-686, zie AFG-637/AFG-632 hierboven).
    await schrijfStatischeMap(poort, 'registreren', registrerenPaginas(), {
      sessieHerkenningScript: naarDashboardScript,
      openbaarZetten: false,
    })
  } finally {
    stop()
  }
}

function bundelZwareWorker(bron) {
  const map = path.resolve(wortel, 'bundel-uit')
  const config = path.resolve(wortel, 'wrangler-bundel.json')
  fs.rmSync(map, { recursive: true, force: true })
  fs.writeFileSync(
    config,
    JSON.stringify({
      name: 'afgeleide-oefenen',
      // Absoluut pad: wrangler zoekt `main` vanaf de map van dit configbestand.
      main: path.resolve(bron),
      compatibility_date: '2026-09-25',
      compatibility_flags: ['nodejs_compat', 'global_fetch_strictly_public'],
      assets: { directory: path.resolve(bestanden), binding: 'ASSETS' },
    }),
  )

  const wrangler = path.join('node_modules/wrangler/bin/wrangler.js')
  const resultaat = spawnSync(
    process.execPath,
    [wrangler, 'deploy', '--dry-run', '--outdir', map, '--config', config],
    { stdio: 'inherit' },
  )
  if (resultaat.status !== 0) {
    throw new Error('De zware worker kon niet gebundeld worden.')
  }

  const uit = fs.readdirSync(map)
  const hoofd = uit.find((naam) => naam.endsWith('.js') && !naam.endsWith('.js.map'))
  if (!hoofd) throw new Error('De gebundelde worker is niet compleet.')
  const tekst = fs.readFileSync(path.join(map, hoofd), 'utf8')
  if (tekst.length < 100_000) {
    throw new Error('De gebundelde worker is niet compleet.')
  }
  fs.copyFileSync(path.join(map, hoofd), workerNext)
  for (const naam of uit) {
    if (naam === hoofd || naam === 'README.md' || naam.endsWith('.map')) continue
    fs.copyFileSync(path.join(map, naam), path.join(wortel, naam))
  }
  fs.rmSync(map, { recursive: true, force: true })
  fs.rmSync(config, { force: true })
}

function maakKleineIngang() {
  if (!fs.existsSync(worker)) return
  const tekst = fs.readFileSync(worker, 'utf8')
  if (tekst.includes(merkteken)) {
    if (tekst !== ingang) fs.writeFileSync(worker, ingang)
    return
  }

  const bron = path.join(wortel, 'worker-bron.js')
  fs.renameSync(worker, bron)
  try {
    bundelZwareWorker(bron)
  } catch (fout) {
    if (!fs.existsSync(worker)) fs.renameSync(bron, worker)
    throw fout
  }
  fs.rmSync(bron, { force: true })
  fs.writeFileSync(worker, ingang)
}

// AFG-373: Cloudflare Workers Builds zet de Supabase-bouwvariabelen niet op
// een pull-requesttak. Pagina's als /nl/inloggen maken dan geen Supabase-
// client aan en geven 500, waardoor schrijfStatischeMap hieronder de hele
// bouw liet falen. Op `main` staan de variabelen er wel (net als in de
// GitHub-controle "Bouw voor Workers", met nepwaarden) — daar blijft een
// echte 500 de bouw dus gewoon stoppen; dat vangnet raken we hier niet aan.
const ontbrekend = ontbrekendeSupabaseVariabelen(process.env)
if (ontbrekend.length > 0) {
  console.warn(
    `Geen ${ontbrekend.join(' en ')} in de omgeving: de statische cache en de kleine ingang worden overgeslagen. ` +
      'Dit hoort bij een voorbeeldbouw zonder bouwvariabelen (bijvoorbeeld Cloudflare Workers Builds op een pull-requesttak).',
  )
  process.exit(0)
}

if (!fs.existsSync(cache)) {
  console.error('Geen OpenNext-cache. Eerst de bouw voor Workers draaien.')
  process.exit(1)
}

fs.cpSync(cache, cacheBijBestanden, { recursive: true })
schrijfStartpagina()
await schrijfStatischePaginas()
maakKleineIngang()
console.log(
  'Startpagina, theoriepagina’s, uitlegvideo’s-overzicht en voorbeeldpagina’s staan klaar als los bestand.',
)
