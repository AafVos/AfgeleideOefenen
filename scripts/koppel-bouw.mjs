// Workers Builds draait `opennextjs-cloudflare build`, niet `npm run cf:build`.
// Daarom vragen we die bouw zelf om daarna de startpagina klaar te zetten.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const hier = path.dirname(fileURLToPath(import.meta.url))
const bestand = path.join(
  hier,
  '../node_modules/@opennextjs/cloudflare/dist/cli/commands/build.js',
)
const merkteken = 'afgeleide: startpagina'
const anker =
  'await buildImpl(options, config, projectOpts, wranglerConfig, args.dangerouslyUseUnsupportedNextVersion);'

const extra = `${anker}
    // ${merkteken} — daarna het HTML-bestand en de kleine worker-ingang.
    {
        const { pathToFileURL } = await import("node:url");
        const pad = await import("node:path");
        await import(pathToFileURL(pad.resolve(process.cwd(), "scripts/statische-cache.mjs")).href);
    }`

const tekst = fs.readFileSync(bestand, 'utf8')
if (tekst.includes(merkteken)) process.exit(0)
if (!tekst.includes(anker)) {
  console.error(
    'De OpenNext-bouw is anders dan verwacht. De startpagina kan niet automatisch klaargezet worden.',
  )
  process.exit(1)
}

fs.writeFileSync(bestand, tekst.replace(anker, extra))
