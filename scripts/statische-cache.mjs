// De klaargezette pagina's horen bij de statische bestanden van de worker.
// `opennextjs-cloudflare deploy` kopieert ze ook, maar de bouw van Cloudflare
// doet dat niet altijd. Zonder deze kopie start de worker voor de startpagina
// alsnog de zware server.
import fs from 'node:fs'

const van = '.open-next/cache'
const naar = '.open-next/assets/cdn-cgi/_next_cache'

if (!fs.existsSync(van)) {
  console.error('Geen OpenNext-cache. Eerst de bouw voor Workers draaien.')
  process.exit(1)
}

fs.cpSync(van, naar, { recursive: true })
