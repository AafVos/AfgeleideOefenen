import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { Card } from '@/components/ui'
import { canoniek } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HoeHetWerkt' })
  return {
    title: t('title'),
    description: t('description'),
    alternates: canoniek(locale, '/hoe-het-werkt'),
  }
}

export default async function HoeHetWerktPage() {
  const t = await getTranslations('HoeHetWerkt')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <p className="text-sm font-medium uppercase tracking-wider text-accent">
        {t('eyebrow')}
      </p>
      <h1 className="mt-2 font-serif text-4xl text-text sm:text-[2.75rem]">
        {t('h1')}
      </h1>
      <p className="mt-6 text-lg text-text-muted">{t('intro')}</p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        <Card className="!p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {t('card1Eyebrow')}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-text">{t('card1Title')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {t('card1Body1')}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            <strong className="font-medium text-text">{t('card1Body2Strong')}</strong>{' '}
            {t('card1Body2')}
          </p>
        </Card>

        <Card className="!p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            {t('card2Eyebrow')}
          </p>
          <h2 className="mt-2 font-serif text-2xl text-text">{t('card2Title')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-text-muted">
            {t.rich('card2Body', {
              strong: (chunks) => (
                <strong className="font-medium text-text">{chunks}</strong>
              ),
            })}
          </p>
        </Card>
      </div>

      <section className="mt-14">
        <h2 className="font-serif text-2xl text-text">{t('firstTimeH2')}</h2>
        <p className="mt-3 text-text-muted">
          {t.rich('firstTimeBody', {
            oefenen: (chunks) => (
              <strong className="font-medium text-text">{chunks}</strong>
            ),
            zelfToets: (chunks) => (
              <strong className="font-medium text-text">{chunks}</strong>
            ),
          })}
        </p>
        <ol className="mt-6 list-decimal space-y-4 border-l-2 border-border pl-9 text-sm text-text-muted marker:font-medium marker:text-text">
          {(['1', '2', '3', '4'] as const).map((n) => (
            <li key={n}>
              <strong className="text-text">
                {t(`option${n}Title` as 'option1Title')}
              </strong>{' '}
              {t(`option${n}Body` as 'option1Body')}
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 rounded-2xl border border-border bg-surface p-6 sm:p-8">
        <h2 className="font-serif text-xl text-text">{t('summaryH2')}</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-text-muted">
          <li>
            {t.rich('summary1', {
              oefenen: (chunks) => (
                <strong className="text-text">{chunks}</strong>
              ),
              streak: (chunks) => (
                <strong className="text-text">{chunks}</strong>
              ),
            })}
          </li>
          <li>
            {t.rich('summary2', {
              zelfToets: (chunks) => (
                <strong className="text-text">{chunks}</strong>
              ),
            })}
          </li>
          <li>
            {t.rich('summary3', {
              same: (chunks) => (
                <strong className="text-text">{chunks}</strong>
              ),
            })}
          </li>
        </ul>
      </section>

      <div className="mt-12 flex flex-wrap gap-4">
        <Link
          href="/registreren"
          className="rounded-lg bg-accent px-5 py-3 text-sm font-medium text-white shadow-sm hover:bg-accent/90"
        >
          {t('ctaRegister')}
        </Link>
        <Link
          href="/"
          className="rounded-lg border border-border px-5 py-3 text-sm text-text hover:bg-surface-2"
        >
          {t('ctaBack')}
        </Link>
      </div>
    </div>
  )
}
