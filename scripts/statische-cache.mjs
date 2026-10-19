// Na de OpenNext-bouw:
// 1. de cache bij de statische bestanden leggen (de live bouw doet dat niet
//    altijd zelf);
// 2. de startpagina en de theoriepagina's als los HTML-bestand klaarzetten;
// 3. de worker klein houden voor een bezoeker zonder sessie. De zware
//    Next-bundel start pas als die echt nodig is.
import { spawn, spawnSync } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'

const wortel = '.open-next'
const cache = path.join(wortel, 'cache')
const bestanden = path.join(wortel, 'assets')
const cacheBijBestanden = path.join(bestanden, 'cdn-cgi/_next_cache')
const startHtml = path.join(bestanden, 'cdn-cgi/start.html')
const worker = path.join(wortel, 'worker.js')
const workerNext = path.join(wortel, 'worker-next.js')
const merkteken = 'STARTPAGINA_SNEL'

const ingang = `// ${merkteken}
// Bezoekers zonder sessie krijgen de startpagina en de theoriepagina's uit
// een bestand. De zware Next-bundel (worker-next.js) wordt pas geladen als
// die echt nodig is. Iemand die is ingelogd gaat wel door die bundel, zodat
// de kop klopt.
import { anoniemeStartpagina, anoniemeTheorieBestand, theorieZonderPersoonlijk } from "../src/lib/startpagina-snel.ts";

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

    const url = new URL(request.url);
    const zonder = theorieZonderPersoonlijk(url.pathname);
    if (zonder) {
      url.pathname = zonder;
      request = new Request(url, request);
    }

    const next = await import("./worker-next.js");
    return next.default.fetch(request, env, ctx);
  },

  // De nachtelijke taken. Cloudflare roept dit aan volgens triggers.crons in
  // wrangler.jsonc. Het echte werk staat in een gewone route van de site, dus
  // hier zetten we alleen een verzoek in elkaar en geven dat aan de Next-bundel
  // — zonder het netwerk op te gaan.
  async scheduled(event, env, ctx) {
    const basis = env.NEXT_PUBLIC_SITE_URL || "https://www.afgeleideoefenen.nl";
    const verzoek = new Request(basis + "/api/cron/herinneringen", {
      method: "POST",
      headers: { "x-webhook-secret": env.WEBHOOK_SECRET || "" },
    });

    const next = await import("./worker-next.js");
    const antwoord = await next.default.fetch(verzoek, env, ctx);
    // Alleen de status in de log: wie er mail kreeg hoort daar niet in.
    console.log("[herinneringen] status " + antwoord.status);
    await antwoord.body?.cancel();
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

  const script = `<script>(function(){var delen=document.cookie.split(";");for(var i=0;i<delen.length;i++){var naam=delen[i].split("=")[0].trim();if(/^sb-.+-auth-token(?:\\.\\d+)?$/.test(naam)){location.replace("/nl/dashboard");return}}})()</script>`
  const metScript = html.includes(script)
    ? html
    : html.replace('<head>', `<head>${script}`)

  fs.mkdirSync(path.dirname(startHtml), { recursive: true })
  fs.writeFileSync(startHtml, metScript)
  // Zonder dit bestand start de worker voor /nl. Met het bestand geeft
  // Cloudflare de pagina zelf, zonder de worker af te wachten.
  const alsBestand = path.join(bestanden, 'nl/index.html')
  fs.mkdirSync(path.dirname(alsBestand), { recursive: true })
  fs.writeFileSync(alsBestand, metScript)
}

const THEORIE_WORTEL = 'src/app/[locale]/(paginas)/theorie'
// Een ingelogde leerling mag het losse bestand niet houden: dat heeft de
// kop van een bezoeker. Het script stuurt hem naar het adres waarop de
// gewone server de pagina opbouwt.
const sessieScript = `<script>/*theorie-sessie*/(function(){var delen=document.cookie.split(";");for(var i=0;i<delen.length;i++){var naam=delen[i].split("=")[0].trim();if(/^sb-.+-auth-token(?:\\.\\d+)?$/.test(naam)){var pad=location.pathname;if(pad.length>1&&pad.slice(-1)==="/")pad=pad.slice(0,-1);location.replace(pad+"/persoonlijk"+location.search+location.hash);return}}})()</script>`
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

async function schrijfTheoriepaginas() {
  const paginas = theoriePaginas()
  const poort = await vrijePoort()
  if (!poort || poort <= 3100) {
    throw new Error('Geen vrije poort voor de theoriepagina’s.')
  }
  console.log(`Theoriepagina's ophalen op poort ${poort}.`)

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
        `De theoriepagina's konden niet worden opgebouwd (${laatste}).`,
      )
    }

    const map = path.join(bestanden, 'cdn-cgi/theorie')
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
      if (!html.includes('href="/nl/inloggen"')) {
        throw new Error(`${pagina.pad} is niet de versie zonder sessie.`)
      }
      const metScript = html.includes('theorie-sessie')
        ? html
        : html.replace('<head>', `<head>${sessieScript}`)
      fs.writeFileSync(path.join(map, pagina.bestand), metScript)
      // Zonder dit bestand start de worker. Met het bestand geeft Cloudflare
      // de pagina zelf, net als de startpagina.
      const openbaar =
        pagina.bestand === 'index.html'
          ? path.join(bestanden, 'nl/theorie/index.html')
          : path.join(
              bestanden,
              'nl/theorie',
              pagina.bestand.replace(/\.html$/, ''),
              'index.html',
            )
      fs.mkdirSync(path.dirname(openbaar), { recursive: true })
      fs.writeFileSync(openbaar, metScript)
    }
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

if (!fs.existsSync(cache)) {
  console.error('Geen OpenNext-cache. Eerst de bouw voor Workers draaien.')
  process.exit(1)
}

fs.cpSync(cache, cacheBijBestanden, { recursive: true })
schrijfStartpagina()
await schrijfTheoriepaginas()
maakKleineIngang()
console.log('Startpagina en theoriepagina’s staan klaar als los bestand.')
