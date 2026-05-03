'use server'

import { createClient } from '@/lib/supabase/server'

export type ForgotState = { sent: boolean; error: string | null }

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get('email') ?? '').toString().trim()
  if (!email) return { sent: false, error: 'Vul je e-mailadres in.' }

  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/wachtwoord-opnieuw`,
  })

  return { sent: true, error: null }
}
