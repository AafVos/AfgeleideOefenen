// Welke bouwvariabelen scripts/statische-cache.mjs nodig heeft om pagina's
// als /nl/inloggen op te halen: die maken een Supabase-client aan, en zonder
// URL en sleutel gooit die meteen een fout (AFG-373). Op een pull-requesttak
// zet Cloudflare Workers Builds deze twee niet; op `main` staan ze er wel.
export const VERPLICHTE_SUPABASE_VARIABELEN = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
]

export function ontbrekendeSupabaseVariabelen(env) {
  return VERPLICHTE_SUPABASE_VARIABELEN.filter((naam) => !env[naam])
}
