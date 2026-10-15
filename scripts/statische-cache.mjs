// Na de OpenNext-bouw:
// 1. de cache bij de statische bestanden leggen (de live bouw doet dat niet
//    altijd zelf);
// 2. de startpagina als los HTML-bestand klaarzetten;
// 3. de worker klein houden voor een bezoeker zonder sessie. De zware
//    Next-bundel start pas als die echt nodig is.
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
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
// Bezoekers zonder sessie krijgen de startpagina uit een bestand. De zware
// Next-bundel (worker-next.js) wordt pas geladen als die echt nodig is.
import { anoniemeStartpagina } from "../src/lib/startpagina-snel.ts";

export { DOQueueHandler } from "./.build/durable-objects/queue.js";
export { DOShardedTagCache } from "./.build/durable-objects/sharded-tag-cache.js";
export { BucketCachePurge } from "./.build/durable-objects/bucket-cache-purge.js";

export default {
  async fetch(request, env, ctx) {
    if (anoniemeStartpagina(request) && env.ASSETS) {
      const bestand = await env.ASSETS.fetch(
        "http://assets.local/cdn-cgi/start.html",
      );
      if (bestand.ok) {
        const headers = new Headers();
        headers.set("content-type", "text/html; charset=utf-8");
        headers.set(
          "cache-control",
          "s-maxage=31536000, stale-while-revalidate=2592000",
        );
        headers.set("x-nextjs-prerender", "1");
        headers.set("x-startpagina", "bestand");
        return new Response(bestand.body, { status: 200, headers });
      }
      await bestand.body?.cancel();
    }

    const next = await import("./worker-next.js");
    return next.default.fetch(request, env, ctx);
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

  fs.mkdirSync(path.dirname(startHtml), { recursive: true })
  fs.writeFileSync(startHtml, html)
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
  if (tekst.includes(merkteken)) return

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
maakKleineIngang()
console.log('Startpagina staat klaar als los bestand.')
