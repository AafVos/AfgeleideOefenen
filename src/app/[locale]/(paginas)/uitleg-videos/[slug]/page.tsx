import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { canoniek, deelkaart, paginaAdres } from '@/lib/seo'
import { duurAlsKaartje, getUitlegVideo, getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

import { UitlegVideosInhoud } from '../inhoud'

type PageProps = {
  params: Promise<{ locale: string; slug: string }>
}

export const dynamicParams = false

export function generateStaticParams() {
  return getUitlegVideos().map((video) => ({ slug: video.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, slug } = await params
  const video = getUitlegVideo(slug)
  if (!video) notFound()

  const pad = uitlegVideoPad(video.slug)
  return {
    title: video.title,
    description: video.uitleg.leer,
    alternates: canoniek(locale, pad),
    openGraph: deelkaart(locale, pad, {
      title: video.title,
      description: video.uitleg.leer,
    }),
  }
}

export default async function UitlegVideoPage({ params }: PageProps) {
  const { locale, slug } = await params
  const video = getUitlegVideo(slug)
  if (!video) notFound()

  const pad = uitlegVideoPad(video.slug)
  const kaartje = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${paginaAdres(locale, pad)}#video`,
    name: video.title,
    description: video.uitleg.leer,
    contentUrl: video.src,
    duration: duurAlsKaartje(video.duration),
    inLanguage: 'nl',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(kaartje) }}
      />
      <UitlegVideosInhoud locale={locale} slug={video.slug} />
    </>
  )
}
