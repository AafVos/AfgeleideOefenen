'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { applyPadSelections } from '@/lib/practice/bulk-progress'
import { createClient } from '@/lib/supabase/server'

export async function savePadSelectionsAction(
  topicIds: string[],
  payload: Array<{ topicId: string; kenIk: boolean; wilOefenen: boolean }>,
): Promise<{ error: string } | void> {
  if (!topicIds.length) return { error: 'Geen onderwerpen.' }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const map = new Map(
    payload.map((p) => [
      p.topicId,
      { kenIk: p.kenIk, wilOefenen: p.wilOefenen },
    ]),
  )

  try {
    await applyPadSelections(supabase, user.id, topicIds, map)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath('/leerpad')
  revalidatePath('/dashboard')
  revalidatePath('/oefenen')
  redirect('/leerpad')
}
