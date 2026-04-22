import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { SignupForm } from './signup-form'

export const metadata = {
  title: 'Registreren · afgeleidenoefenen.nl',
}

export default async function SignupPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/oefenen')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">Account aanmaken</h1>
      <p className="mt-2 text-sm text-text-muted">
        Gratis, in het Nederlands, en je kunt gelijk oefenen.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <SignupForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Heb je al een account?{' '}
        <Link
          href="/inloggen"
          className="font-medium text-accent hover:underline"
        >
          Log in
        </Link>
      </p>
    </div>
  )
}
