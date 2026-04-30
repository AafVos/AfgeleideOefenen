import Link from 'next/link'
import { redirect } from 'next/navigation'

import { loadDiagnosticQuestions } from '@/lib/practice/diagnostic'
import { createClient } from '@/lib/supabase/server'

import { DiagnosticRunner } from './diagnostic-runner'

export const metadata = {
  title: 'Korte toets · afgeleideoefenen.nl',
  robots: { index: false, follow: false },
}

export default async function ToetsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/inloggen')

  const { data: profile } = await supabase
    .from('profiles')
    .select('onboarded_at, learning_mode')
    .eq('id', user.id)
    .maybeSingle()

  if (!profile?.onboarded_at) redirect('/onboarding')
  if (profile.learning_mode !== 'diagnostic') redirect('/leerpad')

  const questions = await loadDiagnosticQuestions(supabase)

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        Korte toets
      </p>
      <h1 className="mt-2 font-serif text-3xl text-text">
        Zo schatten we je startpunt in
      </h1>
      <p className="mt-3 text-text-muted">
        Voor elk hoofdonderwerp één opgave. Geen tijdsdruk — reken zoals bij
        huiswerk. Daarna kun je naar het leerpad.
      </p>

      {questions.length === 0 ? (
        <p className="mt-8 text-text-muted">
          Er zijn nog geen geschikte vragen in de database. Ga door naar het
          leerpad om te beginnen.
        </p>
      ) : (
        <div className="mt-10">
          <DiagnosticRunner questions={questions} />
        </div>
      )}

      <p className="mt-10 text-sm text-text-muted">
        <Link href="/leerpad" className="text-accent hover:underline">
          Sla de toets over →
        </Link>
      </p>
    </div>
  )
}
