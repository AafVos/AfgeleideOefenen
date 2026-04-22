'use server'

import { revalidatePath } from 'next/cache'

import { createServiceRoleClient } from '@/lib/supabase/server'

export async function setUserRole(userId: string, formData: FormData) {
  const role = (formData.get('role') ?? '').toString()
  if (role !== 'student' && role !== 'admin') {
    throw new Error('Ongeldige rol.')
  }

  const admin = createServiceRoleClient()
  const { error } = await admin
    .from('profiles')
    .update({ role })
    .eq('id', userId)
  if (error) throw new Error(error.message)

  revalidatePath('/admin/users')
}
