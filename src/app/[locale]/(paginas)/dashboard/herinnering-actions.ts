'use server'

import { createClient, createServiceRoleClient } from '@/lib/supabase/server'

/**
 * De schakelaar voor de herinneringsmail (zie AFG-487).
 *
 * Opt-in: hij staat standaard uit en alleen de leerling zelf zet hem aan.
 * De tellers (`herinnering_aantal`, `herinnering_laatst_op`) zijn van de
 * server — een trigger in migratie 0082 houdt de leerling daarvan af, anders
 * kon hij zichzelf eindeloos mail laten sturen. Daarom zetten we ze hier met
 * de service-rol, en alleen nadat vaststaat wie er is ingelogd.
 */

export type HerinneringUitkomst = { gelukt: boolean }

export async function zetHerinneringAan(): Promise<HerinneringUitkomst> {
  const userId = await ingelogdeLeerling()
  if (!userId) return { gelukt: false }

  // De teller terug naar nul: wie hem opnieuw aanzet, begint opnieuw. Anders
  // zou iemand die er ooit drie kreeg er nooit meer een krijgen.
  const { error } = await createServiceRoleClient()
    .from('profiles')
    .update({
      herinnering_mail: true,
      herinnering_aan_sinds: new Date().toISOString(),
      herinnering_laatst_op: null,
      herinnering_aantal: 0,
    })
    .eq('id', userId)

  if (error) {
    console.error('[herinnering] aanzetten mislukt', error.code)
    return { gelukt: false }
  }
  return { gelukt: true }
}

export async function zetHerinneringUit(): Promise<HerinneringUitkomst> {
  const userId = await ingelogdeLeerling()
  if (!userId) return { gelukt: false }

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({ herinnering_mail: false })
    .eq('id', userId)

  if (error) {
    console.error('[herinnering] uitzetten mislukt', error.code)
    return { gelukt: false }
  }
  return { gelukt: true }
}

async function ingelogdeLeerling(): Promise<string | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user?.id ?? null
}
