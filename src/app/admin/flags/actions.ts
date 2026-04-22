'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
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

export async function resolveFlagAction(
  flagId: string,
  newStatus: 'resolved' | 'dismissed',
) {
  const { supabase, userId } = await assertAdmin()
  const { error } = await supabase
    .from('question_flags')
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', flagId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/flags')
}
