import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { LoginForm } from './login-form'

export const metadata = {
  title: 'Inloggen · lerendifferentiëren.nl',
}

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/oefenen')
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-serif text-3xl text-text">Inloggen</h1>
      <p className="mt-2 text-sm text-text-muted">
        Welkom terug. Log in om verder te oefenen.
      </p>

      <div className="mt-8 rounded-xl border border-border bg-surface p-6">
        <LoginForm />
      </div>

      <p className="mt-6 text-center text-sm text-text-muted">
        Nog geen account?{' '}
        <Link
          href="/registreren"
          className="font-medium text-accent hover:underline"
        >
          Registreer
        </Link>
      </p>
    </div>
  )
}
