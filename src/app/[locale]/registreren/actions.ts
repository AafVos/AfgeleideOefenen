'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'

/** Sleutels uit de `Register`-teksten; het formulier vertaalt ze. */
export type SignupErrorKey =
  | 'errorMissingFields'
  | 'errorPasswordTooShort'
  | 'errorPasswordMismatch'
  | 'errorEmailInUse'
  | 'errorWeakPassword'
  | 'errorGeneric'

export type SignupState = {
  errorKey: SignupErrorKey | null
  noticeKey: 'noticeConfirmEmail' | null
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
    return { errorKey: 'errorMissingFields', noticeKey: null, values }
  }

  if (password.length < 8) {
    return { errorKey: 'errorPasswordTooShort', noticeKey: null, values }
  }

  const passwordConfirm = (formData.get('passwordConfirm') ?? '').toString()
  if (password !== passwordConfirm) {
    return { errorKey: 'errorPasswordMismatch', noticeKey: null, values }
  }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? ''
  const locale = await getLocale()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Na het bevestigen van de e-mail direct naar de inlogpagina
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(`/${locale}/inloggen`)}`,
      data: username ? { username } : undefined,
    },
  })

  if (error) {
    return { errorKey: authErrorKey(error.message), noticeKey: null, values }
  }

  // If email confirmation is enabled, the user isn't logged in yet.
  if (!data.session) {
    return { errorKey: null, noticeKey: 'noticeConfirmEmail' }
  }

  // Persist username on the auto-created profile row.
  if (username && data.user) {
    await supabase.from('profiles').update({ username }).eq('id', data.user.id)
  }

  revalidatePath('/', 'layout')
  redirect(`/${locale}/onboarding`)
}

function authErrorKey(msg: string): SignupErrorKey {
  if (/already registered|already exists|already in use/i.test(msg)) {
    return 'errorEmailInUse'
  }
  if (/password should be|weak password/i.test(msg)) {
    return 'errorWeakPassword'
  }
  // Alles wat we niet kennen is Engelse systeemtaal van Supabase. Die hoort
  // niet op het scherm van een leerling; wel in de serverlog.
  console.error('[registreren] onbekende foutmelding van Supabase:', msg)
  return 'errorGeneric'
}
