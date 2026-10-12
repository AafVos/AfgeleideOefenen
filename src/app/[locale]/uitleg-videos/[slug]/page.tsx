import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { SITE_CONFIG } from '@/config/site'
import { canoniek } from '@/lib/seo'
import { getUitlegVideo, getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

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
    description: video.description,
    alternates: canoniek(locale, pad),
    openGraph: {
      type: 'website',
      locale: 'nl_NL',
      siteName: SITE_CONFIG.domain,
      title: video.title,
      description: video.description,
    },
  }
}

export default async function UitlegVideoPage({ params }: PageProps) {
  const { locale, slug } = await params
  const video = getUitlegVideo(slug)
  if (!video) notFound()

  return <UitlegVideosInhoud locale={locale} slug={video.slug} />
}
