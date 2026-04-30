'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export type LoginState = { error: string | null }

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()

  if (!email || !password) {
    return { error: 'Vul je e-mailadres en wachtwoord in.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

function translateAuthError(msg: string): string {
  if (/invalid login credentials/i.test(msg)) {
    return 'Onjuiste combinatie van e-mail en wachtwoord.'
  }
  if (/email not confirmed/i.test(msg)) {
    return 'Je hebt je e-mailadres nog niet bevestigd. Check je inbox.'
  }
  return msg
}
