'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { applyPadSelectionsNew } from '@/lib/practice/bulk-progress-new'
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
  const locale = await getLocale()
  if (!user) redirect(`/${locale}/inloggen`)

  const map = new Map(
    payload.map((p) => [
      p.topicId,
      { kenIk: p.kenIk, wilOefenen: p.wilOefenen },
    ]),
  )

  try {
    await applyPadSelectionsNew(supabase, user.id, topicIds, map)
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Opslaan mislukt.' }
  }

  revalidatePath(`/nl/dashboard`)
  revalidatePath(`/en/dashboard`)
  redirect(`/${locale}/oefenen`)
}
