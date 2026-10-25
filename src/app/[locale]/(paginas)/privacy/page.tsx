import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/navigation'

import { canoniek, deelkaart } from '@/lib/seo'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Privacy' })
  const title = t('title')
  const description = t('description')
  return {
    title,
    description,
    alternates: canoniek(locale, '/privacy'),
    openGraph: deelkaart(locale, '/privacy', { title, description }),
  }
}

export default async function PrivacyPage() {
  const t = await getTranslations('Privacy')

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl text-text">{t('h1')}</h1>
      <p className="mt-3 text-sm text-text-muted">{t('updated')}</p>
      <p className="mt-6 text-lg leading-relaxed text-text-muted">{t('intro')}</p>

      <Sectie titel={t('whoH2')}>
        <p>{t('whoBody')}</p>
      </Sectie>

      <Sectie titel={t('whatH2')}>
        <h3 className="font-serif text-xl text-text">{t('accountH3')}</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('accountEmail')}</li>
          <li>{t('accountPassword')}</li>
          <li>{t('accountUsername')}</li>
          <li>{t('accountConfirmed')}</li>
          <li>{t('accountLastLogin')}</li>
          <li>{t('accountTour')}</li>
          <li>{t('accountHerinnering')}</li>
        </ul>
        <p className="mt-3">{t('accountNot')}</p>

        <h3 className="mt-8 font-serif text-xl text-text">{t('practiceH3')}</h3>
        <p className="mt-3">{t('practiceLead')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('practiceAnswer')}</li>
          <li>{t('practiceCorrect')}</li>
          <li>{t('practiceTime')}</li>
          <li>{t('practiceWhen')}</li>
          <li>{t('practiceSkip')}</li>
          <li>{t('practiceName')}</li>
          <li>{t('practiceProgress')}</li>
        </ul>

        <h3 className="mt-8 font-serif text-xl text-text">{t('mailH3')}</h3>
        <p className="mt-3">{t('mailBody')}</p>
        <p className="mt-3">{t('mailPhoto')}</p>
        <p className="mt-3">{t('mailNewUser')}</p>
        <p className="mt-3">{t('mailHerinnering')}</p>

        <h3 className="mt-8 font-serif text-xl text-text">{t('videoH3')}</h3>
        <p className="mt-3">{t('videoBody')}</p>
        <p className="mt-3">{t('videoEmail')}</p>

        <h3 className="mt-8 font-serif text-xl text-text">{t('cacheH3')}</h3>
        <p className="mt-3">{t('cacheBody')}</p>

        <h3 className="mt-8 font-serif text-xl text-text">{t('flagH3')}</h3>
        <p className="mt-3">{t('flagBody')}</p>

        <h3 className="mt-8 font-serif text-xl text-text">{t('metenH3')}</h3>
        <p className="mt-3">{t('metenBody')}</p>
        <p className="mt-3">{t('metenSchuilnaam')}</p>
      </Sectie>

      <Sectie titel={t('whereH2')}>
        <ul className="list-disc space-y-3 pl-5">
          <li>{t('whereSupabase')}</li>
          <li>{t('whereResend')}</li>
          <li>{t('whereGemini')}</li>
          <li>{t('whereCloudflare')}</li>
        </ul>
        <p className="mt-4">{t('whereNot')}</p>
      </Sectie>

      <Sectie titel={t('howLongH2')}>
        <p>{t('howLongAccount')}</p>
        <p className="mt-3">{t('howLongCache')}</p>
        <p className="mt-3">{t('howLongVideo')}</p>
        <p className="mt-3">{t('howLongMail')}</p>
        <p className="mt-3">{t('howLongMeting')}</p>
      </Sectie>

      <Sectie titel={t('cookiesH2')}>
        <p>{t('cookiesLead')}</p>
        <ul className="mt-3 list-disc space-y-2 pl-5">
          <li>{t('cookiesLogin')}</li>
          <li>{t('cookiesVideo')}</li>
        </ul>
        <p className="mt-3">{t('cookiesNone')}</p>
      </Sectie>

      <Sectie titel={t('rightsH2')}>
        <p>{t('rightsChange')}</p>
        <p className="mt-3">{t('rightsDelete')}</p>
        <p className="mt-3">
          {t.rich('rightsFeedback', {
            link: (chunks) => (
              <Link href="/feedback" className="font-medium text-accent hover:underline">
                {chunks}
              </Link>
            ),
          })}
        </p>
        <p className="mt-3">{t('rightsParent')}</p>
        <p className="mt-3">
          {t.rich('rightsComplaint', {
            link: (chunks) => (
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                className="font-medium text-accent hover:underline"
                rel="noopener noreferrer"
              >
                {chunks}
              </a>
            ),
          })}
        </p>
      </Sectie>

      <Sectie titel={t('minorsH2')}>
        <p>{t('minorsBody')}</p>
      </Sectie>
    </div>
  )
}

function Sectie({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-text">{titel}</h2>
      <div className="mt-3 space-y-0 text-base leading-relaxed text-text-muted">{children}</div>
    </section>
  )
}
