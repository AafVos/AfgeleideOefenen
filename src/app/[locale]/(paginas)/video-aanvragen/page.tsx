import { Link } from '@/i18n/navigation'

import { canoniek, deelkaart } from '@/lib/seo'

import { VideoAanvraagFormulier } from './formulier'

const TITEL = 'Vraag een uitlegvideo aan'
const TEKST =
  'Zit je vast op een vraag uit een oud eindexamen vwo wiskunde B? Zeg welk jaar, welk tijdvak en welke vraag, dan komt de uitleg erbij. Een account heb je er niet voor nodig.'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  return {
    title: TITEL,
    description: TEKST,
    alternates: canoniek(locale, '/video-aanvragen'),
    openGraph: deelkaart(locale, '/video-aanvragen', {
      title: TITEL,
      description: TEKST,
    }),
  }
}

export default function VideoAanvragenPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:py-14">
      <h1 className="font-serif text-3xl text-text sm:text-4xl">{TITEL}</h1>
      <p className="mt-3 text-text-muted">{TEKST}</p>

      <div className="mt-8 rounded-2xl border border-border bg-surface p-5 sm:p-6">
        <VideoAanvraagFormulier />
      </div>

      <p className="mt-6 text-sm text-text-muted">
        Video’s die er al zijn, staan bij{' '}
        <Link
          href="/uitleg-videos"
          data-meet="video-aanvraag-naar-videos"
          className="text-accent underline-offset-2 hover:underline"
        >
          de uitlegvideo’s
        </Link>
        . Hoe we met je gegevens omgaan, staat op de{' '}
        <Link
          href="/privacy"
          data-meet="video-aanvraag-naar-privacy"
          className="text-accent underline-offset-2 hover:underline"
        >
          privacypagina
        </Link>
        .
      </p>
    </div>
  )
}
