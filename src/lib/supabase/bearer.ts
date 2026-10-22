import { createClient } from '@supabase/supabase-js'

import type { Database } from './types'

/**
 * Inloggen via een bearer-token in plaats van een cookiesessie.
 *
 * De site zelf gebruikt `src/lib/supabase/server.ts` (cookies via
 * `@supabase/ssr`): dat werkt alleen in een browser die cookies meestuurt.
 * De mobiele app (`mobiel/`) heeft geen cookiejar en stuurt in plaats
 * daarvan de Supabase-sessie van de leerling mee als
 * `Authorization: Bearer <access_token>`. Deze functie zoekt die header op,
 * vraagt Supabase welke gebruiker daarbij hoort, en geeft een client terug
 * die daarna net zo met Row Level Security rekening houdt als de ingelogde
 * leerling zelf — zonder de service role te gebruiken.
 */
export async function authenticateBearer(
  req: Request,
): Promise<{ supabase: ReturnType<typeof createClient<Database>>; userId: string } | null> {
  const header = req.headers.get('authorization') ?? ''
  const token = header.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!token) return null

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser(token)
  if (!user) return null

  return { supabase, userId: user.id }
}
