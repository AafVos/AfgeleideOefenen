'use server'

import { headers } from 'next/headers'

import { createClient } from '@/lib/supabase/server'

export type ForgotState = { sent: boolean; error: string | null }

export async function forgotPasswordAction(
  _prev: ForgotState,
  formData: FormData,
): Promise<ForgotState> {
  const email = (formData.get('email') ?? '').toString().trim()
  if (!email) return { sent: false, error: 'Vul je e-mailadres in.' }

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

  // Surface configuration errors (e.g. "Redirect URL not allowed") so they
  // are visible in the UI. We deliberately hide "user not found" style errors
  // to prevent email enumeration.
  if (error && !/user/i.test(error.message)) {
    return { sent: false, error: error.message }
  }

  return { sent: true, error: null }
}
