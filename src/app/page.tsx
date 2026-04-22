import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <section className="text-center">
        <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
          VWO wiskunde · Differentiëren
        </p>
        <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
          Leer differentiëren door het gewoon te{' '}
          <span className="text-accent">doen</span>.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
          Geen lange uitleg vooraf. Je begint meteen met oefenen, krijgt direct
          feedback en als je iets fout doet legt de site precies uit waar het
          misging — en geeft je een passende volgvraag.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {user ? (
            <Link
              href="/oefenen"
              className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
            >
              Ga verder oefenen
            </Link>
          ) : (
            <>
              <Link
                href="/registreren"
                className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
              >
                Maak een account
              </Link>
              <Link
                href="/inloggen"
                className="rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
              >
                Inloggen
              </Link>
            </>
          )}
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        <Feature
          title="Practice-first"
          body="Je bent geen student die een boek leest. Je bent iemand die oefent en leert van de uitleg bij elke fout."
        />
        <Feature
          title="Adaptief"
          body="De site volgt jouw tempo en je fouten. Je krijgt meer van wat je moeilijk vindt, minder van wat je al kent."
        />
        <Feature
          title="Getal & Ruimte"
          body="Notatie en leerlijn volgen je methode op school. Van machtsregel tot kettingregel."
        />
      </section>
    </div>
  )
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h3 className="font-serif text-xl text-text">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-muted">{body}</p>
    </div>
  )
}
