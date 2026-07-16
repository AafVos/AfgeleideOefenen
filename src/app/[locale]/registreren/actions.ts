'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'

export type SignupState = {
  error: string | null
  notice: string | null
  /** Ingevulde velden terugzetten na een foutmelding */
  values?: { username: string; email: string }
}

export async function signupAction(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const email = (formData.get('email') ?? '').toString().trim()
  const password = (formData.get('password') ?? '').toString()
  const username = (formData.get('username') ?? '').toString().trim() || null

  const values = { username: username ?? '', email }

  if (!email || !password) {
    return {
      error: 'Vul een e-mailadres en wachtwoord in.',
      notice: null,
      values,
    }
  }

  if (password.length < 8) {
    return {
      error: 'Je wachtwoord moet minstens 8 tekens lang zijn.',
      notice: null,
      values,
    }
  }

  const passwordConfirm = (formData.get('passwordConfirm') ?? '').toString()
  if (password !== passwordConfirm) {
    return {
      error: 'De wachtwoorden komen niet overeen.',
      notice: null,
      values,
    }
  }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: username ? { username } : undefined,
    },
  })

  if (error) {
    return { error: translateAuthError(error.message), notice: null, values }
  }

  // If email confirmation is enabled, the user isn't logged in yet.
  if (!data.session) {
    return {
      error: null,
      notice:
        'Account aangemaakt. Klik op de link in de bevestigingsmail om in te loggen.',
    }
  }

  // Persist username on the auto-created profile row.
  if (username && data.user) {
    await supabase.from('profiles').update({ username }).eq('id', data.user.id)
  }

  const locale = await getLocale()
  revalidatePath('/', 'layout')
  redirect(`/${locale}/onboarding`)
}

function translateAuthError(msg: string): string {
  if (/already registered|already exists|already in use/i.test(msg)) {
    return 'Er bestaat al een account met dit e-mailadres.'
  }
  if (/password should be|weak password/i.test(msg)) {
    return 'Kies een sterker wachtwoord (minstens 8 tekens).'
  }
  return msg
}
