'use server'

import { createClient } from '@/lib/supabase/server'

/** Markeer de welkomstrondleiding als gezien voor de ingelogde gebruiker. */
export async function markTourSeenAction(): Promise<void> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ tour_seen_at: new Date().toISOString() })
    .eq('id', user.id)
}
