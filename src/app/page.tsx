import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afgeleideoefenen.nl'

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'Is afgeleideoefenen.nl gratis?',
    answer:
      'Ja, volledig gratis. Je maakt een account en begint meteen met oefenen. Geen reclame, geen proefabonnement.',
  },
  {
    question: 'Voor wie is deze site bedoeld?',
    answer:
      'Voor leerlingen in VWO 4, 5 en 6 die wiskunde B (of wiskunde A op niveau) volgen en willen oefenen met differentiëren. De site is ook bruikbaar voor VWO wiskunde D en voor studenten die hun afgeleiden willen ophalen.',
  },
  {
    question: 'Welke onderwerpen kan ik oefenen?',
    answer:
      'Alle differentieerregels uit de VWO-bovenbouw: machtsregel, somregel, verschilregel, constante-factor-regel, productregel, quotiëntregel en kettingregel. Plus standaardafgeleiden van sinus, cosinus, exponentiële en logaritmische functies.',
  },
  {
    question: 'Hoe werkt de adaptieve aanpak?',
    answer:
      'De site volgt per onderwerp hoe goed je het beheerst. Opgaven die je moeilijk vindt krijg je vaker; onderwerpen die je al kunt krijg je minder vaak. Bij elke fout legt de site precies uit waar het misging en geeft je direct een passende vervolgvraag om het te herstellen.',
  },
  {
    question: 'Volgt de site Getal & Ruimte?',
    answer:
      'Ja. Notatie, volgorde van onderwerpen en moeilijkheidsopbouw volgen Getal & Ruimte. Gebruik je een andere methode (bijvoorbeeld Moderne Wiskunde of Wageningse Methode)? Ook dan werkt de site prima — differentiëren is differentiëren.',
  },
  {
    question: 'Helpt dit voor het eindexamen?',
    answer:
      'Zeker. Afgeleiden zijn de basis voor grote onderdelen van het VWO wiskunde B examen (extremen, raaklijnen, dynamische modellen). Door hier vlot in te worden maak je op het examen sneller en met minder fouten de andere onderdelen.',
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: 'afgeleideoefenen.nl',
        description:
          'Afgeleide oefenen voor wiskunde B op het VWO met adaptieve oefeningen en directe uitleg bij fouten.',
        inLanguage: 'nl-NL',
      },
      {
        '@type': 'EducationalOrganization',
        '@id': `${SITE_URL}#org`,
        name: 'afgeleideoefenen.nl',
        url: SITE_URL,
        description:
          'Gratis oefenplatform voor differentiëren en afgeleiden voor Nederlandse VWO-leerlingen.',
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}#faq`,
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="mx-auto max-w-3xl px-4 py-16">
        <section className="text-center">
          <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent">
            Wiskunde B · VWO 4 / 5 / 6
          </p>
          <h1 className="font-serif text-4xl leading-tight text-text sm:text-5xl">
            Afgeleide oefenen voor{' '}
            <span className="text-accent">wiskunde B</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-text-muted">
            Adaptieve oefeningen voor differentiëren op het VWO. Je begint
            meteen, krijgt directe feedback en bij elke fout legt de site
            precies uit waar het misging — met een passende volgvraag.
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
                  Gratis account aanmaken
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
          <p className="mt-3 text-sm text-text-muted">
            Volledig gratis · Geen reclame · Volgt Getal &amp; Ruimte
          </p>
        </section>

        <section className="mt-20 grid gap-6 sm:grid-cols-3">
          <Feature
            title="Practice-first"
            body="Geen lange uitlegvideo's. Je leert afgeleiden door ze gewoon te maken en uitleg te krijgen bij elke fout."
          />
          <Feature
            title="Adaptief"
            body="De site volgt jouw tempo. Je krijgt meer van wat je moeilijk vindt, minder van wat je al kent."
          />
          <Feature
            title="Getal &amp; Ruimte"
            body="Notatie en leerlijn volgen je methode op school. Van machtsregel tot kettingregel."
          />
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">
            Wat kun je hier oefenen?
          </h2>
          <p className="mt-3 text-text-muted">
            Alle differentieerregels die je op het VWO bij wiskunde B
            tegenkomt, in oplopende moeilijkheid:
          </p>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              [
                'Machtsregel',
                'De basis. Van xⁿ naar n·xⁿ⁻¹, inclusief negatieve en gebroken exponenten.',
              ],
              [
                'Som- en verschilregel',
                'Differentiëren van polynomen. Elke term apart.',
              ],
              [
                'Productregel',
                'Voor functies als (x² + 1)·sin(x). Twee stukken elk apart, dan combineren.',
              ],
              [
                'Quotiëntregel',
                'Voor breuken zoals (x² + 1) / (x − 3). Alleen als productregel niet makkelijker is.',
              ],
              [
                'Kettingregel',
                'Voor samengestelde functies als sin(3x²). De binnenste functie meenemen.',
              ],
              [
                'Standaardafgeleiden',
                'sin, cos, ln, e, en gebroken functies — paraat hebben is het halve werk.',
              ],
            ].map(([title, body]) => (
              <li
                key={title}
                className="rounded-xl border border-border bg-surface p-4"
              >
                <p className="font-medium text-text">{title}</p>
                <p className="mt-1 text-sm text-text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">
            Hoe werkt het oefenen?
          </h2>
          <ol className="mt-6 space-y-4 text-text-muted">
            <li>
              <span className="font-medium text-text">1. Je krijgt een opgave.</span>{' '}
              Bijvoorbeeld: bepaal de afgeleide van f(x) = 3x² + 2x − 5. Je
              typt je antwoord in met een wiskunde-toetsenbord.
            </li>
            <li>
              <span className="font-medium text-text">2. Directe feedback.</span>{' '}
              Goed? Door naar de volgende. Fout? De site legt uit welke regel
              je had moeten gebruiken, rekent de stappen voor, en laat zien waar
              jouw antwoord precies mis ging.
            </li>
            <li>
              <span className="font-medium text-text">3. Een passende volgvraag.</span>{' '}
              Op basis van je fout krijg je een opgave die precies datzelfde
              type probleem aanpakt. Zo herstel je het lek in plaats van het
              te negeren.
            </li>
            <li>
              <span className="font-medium text-text">4. Onderwerp onder de knie.</span>{' '}
              Wanneer je een onderwerp meerdere keren op rij goed doet, markeert
              de site het als beheerst. Daarna zie je het minder vaak.
            </li>
          </ol>
        </section>

        <section className="mt-20">
          <h2 className="font-serif text-3xl text-text">Veelgestelde vragen</h2>
          <div className="mt-6 space-y-3">
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.question}
                className="group rounded-xl border border-border bg-surface p-4 open:bg-surface-2"
              >
                <summary className="cursor-pointer font-medium text-text">
                  {item.question}
                </summary>
                <p className="mt-2 text-sm text-text-muted">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-20 rounded-2xl border border-border bg-surface px-6 py-10 text-center">
          <h2 className="font-serif text-3xl text-text">
            Klaar om te beginnen?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-text-muted">
            Maak een gratis account en oefen vandaag nog je eerste vijftig
            afgeleiden. Geen creditcard. Geen limiet.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                href="/oefenen"
                className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
              >
                Ga verder oefenen
              </Link>
            ) : (
              <Link
                href="/registreren"
                className="rounded-lg bg-accent px-5 py-3 text-white shadow-sm hover:bg-accent/90"
              >
                Gratis account aanmaken
              </Link>
            )}
          </div>
        </section>
      </div>
    </>
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
