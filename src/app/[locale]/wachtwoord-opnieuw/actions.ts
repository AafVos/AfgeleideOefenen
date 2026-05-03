'use server'

import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type NewPasswordState = { error: string | null }

export async function newPasswordAction(
  _prev: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const password = (formData.get('password') ?? '').toString()
  if (!password || password.length < 8) {
    return { error: 'Kies een wachtwoord van minstens 8 tekens.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }

  redirect('/dashboard')
}
