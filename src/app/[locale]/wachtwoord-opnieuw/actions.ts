'use server'

import { redirect } from 'next/navigation'
import { getLocale } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'

/** Sleutels uit de `NewPassword`-teksten; het formulier vertaalt ze. */
export type NewPasswordErrorKey = 'errorPasswordTooShort' | 'errorGeneric'

export type NewPasswordState = { errorKey: NewPasswordErrorKey | null }

export async function newPasswordAction(
  _prev: NewPasswordState,
  formData: FormData,
): Promise<NewPasswordState> {
  const password = (formData.get('password') ?? '').toString()
  if (!password || password.length < 8) {
    return { errorKey: 'errorPasswordTooShort' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    // De Engelse tekst van Supabase gaat naar de serverlog, niet naar het
    // scherm van de leerling.
    console.error('[wachtwoord-opnieuw] wachtwoord opslaan mislukt:', error.message)
    return { errorKey: 'errorGeneric' }
  }

  const locale = await getLocale()
  redirect(`/${locale}/dashboard`)
}
