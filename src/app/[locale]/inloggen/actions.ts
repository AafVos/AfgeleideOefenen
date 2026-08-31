'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { after } from 'next/server'
import { getLocale } from 'next-intl/server'

import { stuurWelkomstmail } from '@/lib/email/welkom'
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
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const isUnconfirmed = /email not confirmed/i.test(error.message)
    return {
      error: translateAuthError(error.message),
      unconfirmedEmail: isUnconfirmed ? email : null,
    }
  }

  // Vangnet naast de webhook op e-mailbevestiging: wie daar tussendoor valt,
  // krijgt de welkomstmail alsnog bij de eerste keer inloggen. De functie is
  // idempotent, dus dubbel aanroepen levert geen tweede mail op.
  //
  // Via `after` in plaats van een `await`: de mail kost een admin-call en een
  // Resend-call, en daar hoefde de leerling voorheen op te wachten voordat hij
  // doorgestuurd werd — ook als de mail allang verstuurd was. `after` draait
  // het werk ná de response, en blijft ook lopen als hieronder `redirect` wordt
  // aangeroepen.
  if (data.user) {
    const userId = data.user.id
    after(() => stuurWelkomstmail(userId))
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
