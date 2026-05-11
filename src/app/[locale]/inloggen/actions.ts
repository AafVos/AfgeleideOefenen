'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'

export type LoginState = { error: string | null; unconfirmedEmail?: string | null }

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
    const isUnconfirmed = /email not confirmed/i.test(error.message)
    return {
      error: translateAuthError(error.message),
      unconfirmedEmail: isUnconfirmed ? email : null,
    }
  }

  const locale = await getLocale()
  revalidatePath('/', 'layout')
  redirect(`/${locale}/dashboard`)
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

export async function resendConfirmationAction(
  email: string,
): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.resend({ type: 'signup', email })
  if (error) return { error: error.message }
  return { error: null }
}
