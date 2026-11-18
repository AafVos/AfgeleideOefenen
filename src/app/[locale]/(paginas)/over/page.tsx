import { getTranslations } from 'next-intl/server'

import { Link } from '@/i18n/navigation'

import { canoniek, deelkaart, paginaAdres, SITE_URL } from '@/lib/seo'

/** Zustersites: zelfde account, eigen onderwerp. Zie ook aafvos-org/wiskundemetaaf. */
const WISKUNDEMETAAF_URL = 'https://www.wiskundemetaaf.nl/?van=afgeleideoefenen'
const INTEGRAAL_URL = 'https://integraaloefenen.nl/?van=afgeleideoefenen'
const YOUTUBE_URL = 'https://www.youtube.com/@WiskundeMetAaf'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Over' })
  const title = t('title')
  const description = t('description')
  return {
    title,
    description,
    alternates: canoniek(locale, '/over'),
    openGraph: deelkaart(locale, '/over', { title, description }),
  }
}

export default async function OverPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations('Over')

  const orgId = `${SITE_URL}#organisatie`
  const aafId = `${SITE_URL}/${locale}/over#aaf`

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': orgId,
        name: 'Wiskunde met Aaf',
        url: SITE_URL,
        sameAs: [
          WISKUNDEMETAAF_URL.split('?')[0],
          INTEGRAAL_URL.split('?')[0],
          YOUTUBE_URL,
        ],
        founder: { '@id': aafId },
      },
      {
        '@type': 'Person',
        '@id': aafId,
        name: 'Aaf',
        jobTitle: 'Docent wiskunde',
        url: paginaAdres(locale, '/over'),
        worksFor: { '@id': orgId },
        sameAs: [YOUTUBE_URL],
      },
    ],
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg text-text-muted">{t('intro')}</p>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('whoH2')}</h2>
        <p className="mt-3 text-text-muted">{t('whoBody')}</p>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('sitesH2')}</h2>
        <p className="mt-3 text-text-muted">{t('sitesIntro')}</p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          <SiteKaart
            href="/"
            dataMeet="over-naar-afgeleide"
            titel={t('afgeleideTitel')}
            tekst={t('afgeleideTekst')}
          />
          <SiteKaart
            href={WISKUNDEMETAAF_URL}
            dataMeet="over-naar-examen"
            titel={t('examenTitel')}
            tekst={t('examenTekst')}
          />
          <SiteKaart
            href={INTEGRAAL_URL}
            dataMeet="over-naar-integraal"
            titel={t('integraalTitel')}
            tekst={t('integraalTekst')}
          />
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-2xl text-text">{t('youtubeH2')}</h2>
        <p className="mt-3 text-text-muted">{t('youtubeBody')}</p>
        <a
          href={YOUTUBE_URL}
          rel="noopener noreferrer"
          data-meet="over-youtube"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-border bg-surface px-5 py-3 text-text hover:bg-surface-2"
        >
          {t('youtubeLink')}
        </a>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/registreren"
          data-meet="over-registreren"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('ctaRegister')}
        </Link>
        <Link
          href="/"
          data-meet="over-terug"
          className="rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          {t('ctaBack')}
        </Link>
      </div>
    </div>
  )
}

function SiteKaart({
  href,
  titel,
  tekst,
  dataMeet,
}: {
  href: string
  titel: string
  tekst: string
  dataMeet: string
}) {
  const extern = href.startsWith('http')
  return (
    <li className="flex">
      {extern ? (
        <a
          href={href}
          rel="noopener noreferrer"
          data-meet={dataMeet}
          className="block w-full rounded-xl border border-border bg-surface p-4 hover:bg-surface-2"
        >
          <p className="font-medium text-text underline decoration-border underline-offset-4">
            {titel}
          </p>
          <p className="mt-1 text-sm text-text-muted">{tekst}</p>
        </a>
      ) : (
        <Link
          href={href}
          data-meet={dataMeet}
          className="block w-full rounded-xl border border-border bg-surface p-4 hover:bg-surface-2"
        >
          <p className="font-medium text-text underline decoration-border underline-offset-4">
            {titel}
          </p>
          <p className="mt-1 text-sm text-text-muted">{tekst}</p>
        </Link>
      )}
    </li>
  )
}
