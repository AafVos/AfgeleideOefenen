'use server'

import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

/** Sleutels uit de `ForgotPassword`-teksten; het formulier vertaalt ze. */
export type ForgotErrorKey = 'errorMissingEmail' | 'errorGeneric'

export type ForgotState = { sent: boolean; errorKey: ForgotErrorKey | null }

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get('email') ?? '').toString().trim()
  if (!email) return { sent: false, errorKey: 'errorMissingEmail' }

  // Use the actual request origin so we don't depend on NEXT_PUBLIC_SITE_URL.
  const headersList = await headers()
  const origin =
    headersList.get('origin') ??
    headersList.get('x-forwarded-host') ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'http://localhost:3000'

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=/wachtwoord-opnieuw`,
  })

  // Configuratiefouten ("Redirect URL not allowed") en rate limits moeten wél
  // zichtbaar zijn, maar de Engelse tekst van Supabase hoort niet op het
  // scherm: die gaat naar de serverlog, de leerling krijgt één nette zin.
  // "User not found"-achtige fouten verbergen we bewust, zodat je niet kunt
  // uitvissen welke e-mailadressen een account hebben.
  if (error && !/user/i.test(error.message)) {
    console.error('[wachtwoord-vergeten] resetmail mislukt:', error.message)
    return { sent: false, errorKey: 'errorGeneric' }
  }

  return { sent: true, errorKey: null }
}
