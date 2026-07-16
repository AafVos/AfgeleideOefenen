'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export type SettingsState = {
  error: string | null
  success: string | null
  /** De zojuist opgeslagen gebruikersnaam (alleen bij succes) */
  username?: string
}

export async function updateUsernameAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const username = (formData.get('username') ?? '').toString().trim()

  if (!username) {
    return { error: 'Vul een gebruikersnaam in.', success: null }
  }
  if (username.length > 40) {
    return { error: 'Gebruik maximaal 40 tekens.', success: null }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.', success: null }

  const { error } = await supabase
    .from('profiles')
    .update({ username })
    .eq('id', user.id)

  if (error) return { error: error.message, success: null }

  revalidatePath('/', 'layout')
  return { error: null, success: 'Gebruikersnaam opgeslagen.', username }
}

export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const password = (formData.get('password') ?? '').toString()
  const passwordConfirm = (formData.get('passwordConfirm') ?? '').toString()

  if (password.length < 8) {
    return {
      error: 'Je wachtwoord moet minstens 8 tekens lang zijn.',
      success: null,
    }
  }
  if (password !== passwordConfirm) {
    return { error: 'De wachtwoorden komen niet overeen.', success: null }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd.', success: null }

  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    if (/same password|different from the old/i.test(error.message)) {
      return {
        error: 'Het nieuwe wachtwoord moet anders zijn dan je huidige wachtwoord.',
        success: null,
      }
    }
    return { error: error.message, success: null }
  }

  return { error: null, success: 'Wachtwoord gewijzigd.' }
}
