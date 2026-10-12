import { defineCloudflareConfig } from '@opennextjs/cloudflare'

// Geen incremental cache (R2): de pagina's hangen aan de ingelogde leerling.
export default defineCloudflareConfig({})
