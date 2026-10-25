// "Wachtwoord vergeten" en "Account aanmaken" verwijzen voorlopig door naar
// de site zelf (AFG-557) — die schermen bouwt de app nog niet.
export const SITE_URL = 'https://afgeleideoefenen.nl'

// De app heeft geen eigen backend: oefenen en nakijken lopen via
// `/api/app/*`-routes op dezelfde site (zie `src/app/api/app/` in de
// hoofdmap, AFG-558). Standaard de live site; lokaal ontwikkelen tegen een
// `next dev` op deze computer kan via `EXPO_PUBLIC_API_BASE_URL` in `.env`.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL?.trim() || SITE_URL
