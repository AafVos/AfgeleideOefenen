'use server'

import { bepaalAanvraagAdres } from '@/lib/aanvraag-adres'
import { resetVolgende } from '@/lib/auth/oefenpad'
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

  const supabase = await createClient()
  const adres = await bepaalAanvraagAdres()
  const volgende = encodeURIComponent(resetVolgende(formData.get('naar')))
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    // Eén hulpfunctie bouwt het volledige adres: de origin van de aanvraag,
    // anders de host met https:// ervoor, anders het adres uit de config.
    // Zonder volledig adres weigert Supabase de resetlink.
    // Het oefenpad zit in `next`, opnieuw gecontroleerd.
    redirectTo: `${adres}/auth/callback?next=${volgende}`,
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
