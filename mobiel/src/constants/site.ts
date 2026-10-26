// "Wachtwoord vergeten" en "Account aanmaken" verwijzen voorlopig door naar
// de site zelf (AFG-557) — die schermen bouwt de app nog niet.
//
// Met www, niet zonder: het adres zonder www geeft bij Cloudflare een 301
// naar www. Een GET volgt die vanzelf, maar `fetch` maakt van een POST na
// een 301 een GET (AFG-648) — daarmee ging `/api/app/nakijken` mis.
export const SITE_URL = 'https://www.afgeleideoefenen.nl'

// De app heeft geen eigen backend: oefenen en nakijken lopen via
// `/api/app/*`-routes op dezelfde site (zie `src/app/api/app/` in de
// hoofdmap, AFG-558). Standaard de live site; lokaal ontwikkelen tegen een
// `next dev` op deze computer kan via `EXPO_PUBLIC_API_BASE_URL` in `.env`.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || SITE_URL
