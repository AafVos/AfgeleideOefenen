import { defineCloudflareConfig } from '@opennextjs/cloudflare'
import staticAssetsIncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache'

// De startpagina staat bij de bouw al klaar. De worker leest die versie uit
// de statische bestanden en start de zware server niet. Pagina's van een
// ingelogde leerling horen niet in een gedeelde cache; die blijven per
// bezoek opgebouwd. Deze cache is alleen-lezen en bewaart geen leerlinggegevens.
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
})
