'use server'

import { revalidatePath } from 'next/cache'

import { assertAdmin } from '@/lib/supabase/admin'

export async function resolveFlagAction(
  flagId: string,
  newStatus: 'resolved' | 'dismissed',
) {
  const { supabase, userId } = await assertAdmin()
  const { error } = await supabase
    .from('question_flags_new')
    .update({
      status: newStatus,
      resolved_at: new Date().toISOString(),
      resolved_by: userId,
    })
    .eq('id', flagId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/flags')
}
