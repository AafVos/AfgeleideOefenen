import type { User, SupabaseClient } from '@supabase/supabase-js'

import type { Database } from './types'

/**
 * Kopieert de gekozen gebruikersnaam uit `user_metadata` naar de
 * `profiles`-rij van deze gebruiker, maar alléén als daar nog géén
 * gebruikersnaam staat. Zo wordt een eerder gekozen naam nooit overschreven.
 *
 * Bij een fout wordt alleen een logregel geschreven — de leerling merkt er
 * niets van, en de inlog-actie of de auth-callback doet later een nieuwe
 * poging.
 */
export async function zetGekozenGebruikersnaam(
  supabase: SupabaseClient<Database>,
  user: User,
): Promise<void> {
  const gekozenNaam = user.user_metadata?.username
  if (typeof gekozenNaam !== 'string' || gekozenNaam.trim() === '') return

  const { error } = await supabase
    .from('profiles')
    .update({ username: gekozenNaam.trim() })
    .eq('id', user.id)
    .is('username', null)

  if (error) {
    console.error(
      '[gebruikersnaam] kon gekozen naam niet naar profiles schrijven:',
      error.message,
    )
  }
}