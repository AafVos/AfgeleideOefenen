import type { Metadata } from 'next'

import { Link } from '@/i18n/navigation'
import { googleLoginAan } from '@/lib/auth/google'
import { leesProefSelectie } from '@/lib/practice/proberen'
import { laadProef } from '@/lib/practice/proberen-laden'
import { canoniek, deelkaart, nietIndexeren } from '@/lib/seo'

import { ProberenClient } from './proberen-client'

const TITEL = 'Probeer 3 sommen'
const OMSCHRIJVING =
  'Maak drie sommen zonder account. Je antwoord wordt nagekeken en je ziet het stappenplan. Er wordt niets opgeslagen.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  return {
    title: TITEL,
    description: OMSCHRIJVING,
    alternates: canoniek(locale, '/proberen'),
    openGraph: deelkaart(locale, '/proberen', {
      title: TITEL,
      description: OMSCHRIJVING,
    }),
    robots: nietIndexeren(),
  }
}

export default async function ProberenPage({
  searchParams,
}: {
  searchParams?: Promise<{
    chapter?: string
    topic?: string
    cluster?: string
  }>
}) {
  const params = (await searchParams) ?? {}
  const selectie = leesProefSelectie(params)
  if (!selectie) return <Leeg />

  let pakket: Awaited<ReturnType<typeof laadProef>> = null
  let mislukt = false
  try {
    pakket = await laadProef(selectie)
  } catch (e) {
    console.error('[proberen] laden mislukt', e)
    mislukt = true
  }
  if (mislukt) return <Mislukt />
  if (!pakket) return <Leeg />

  return (
    <ProberenClient
      titel={pakket.titel}
      opgaven={pakket.opgaven}
      selectie={selectie}
      googleAan={googleLoginAan()}
    />
  )
}

function Leeg() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-text">{TITEL}</h1>
      <p className="mt-6 text-text-muted">
        Kies een soort som via de uitleg. Dan krijg je er drie om te proberen, zonder
        account.
      </p>
      <Link
        href="/theorie"
        className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white"
      >
        Naar de uitleg
      </Link>
    </div>
  )
}

function Mislukt() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-text">{TITEL}</h1>
      <p className="mt-6 text-text-muted">
        De sommen laden nu niet. Probeer het zo nog eens.
      </p>
      <Link
        href="/theorie"
        className="mt-8 inline-flex min-h-11 items-center rounded-lg border border-border px-5 py-3 text-sm text-text"
      >
        Naar de uitleg
      </Link>
    </div>
  )
}
