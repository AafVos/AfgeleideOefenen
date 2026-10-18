import { createClient } from './server'

/**
 * Controleert dat de bezoeker beheerder is, en geeft anders een foutmelding.
 *
 * Server actions zijn met hun eigen adres aan te roepen, dus een poortje op
 * `/admin` beschermt ze niet. Elke actie die iets in het beheergedeelte
 * verandert, controleert het daarom zelf.
 */
export async function assertAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Niet ingelogd.')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  if (profile?.role !== 'admin') throw new Error('Geen toegang.')

  return { supabase, userId: user.id }
}

/**
 * Gooit een fout met de Supabase-foutmelding als die er is.
 *
 * Server actions in het beheergedeelte controleren na elke Supabase-aanroep
 * of er een fout is; deze helper voorkomt dat die controle overal apart
 * wordt uitgeschreven.
 */
export function gooiAlsFout(
  error: { message: string } | null,
): asserts error is null {
  if (error) throw new Error(error.message)
}
