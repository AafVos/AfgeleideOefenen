import { getTranslations } from 'next-intl/server'
import { permanentRedirect } from 'next/navigation'

import { canoniek, deelkaart } from '@/lib/seo'
import { losVideoSlugOp, uitlegVideoPad } from '@/lib/videos'

import { UitlegVideosInhoud } from './inhoud'

type PageProps = {
  params: Promise<{ locale: string }>
  searchParams?: Promise<{ video?: string | string[] }>
}

/** `?video=a&video=b` komt als lijst binnen; de eerste waarde telt. */
function leesVideoParam(video: string | string[] | undefined): string | undefined {
  const ruw = Array.isArray(video) ? video[0] : video
  const slug = ruw?.trim()
  return slug || undefined
}

/**
 * Oude gedeelde links (`/uitleg-videos?video=quotientregel`) gaan naar het
 * eigen adres van die video. Een onbekende naam blijft op het overzicht.
 */
function stuurOudeVideolinkDoor(locale: string, video: string | string[] | undefined) {
  const slug = leesVideoParam(video)
  const huidig = slug ? losVideoSlugOp(slug) : null
  if (!huidig) return
  permanentRedirect(`/${locale}${uitlegVideoPad(huidig)}`)
}

export async function generateMetadata({ params, searchParams }: PageProps) {
  const { locale } = await params
  const search = (await searchParams) ?? {}
  stuurOudeVideolinkDoor(locale, search.video)

  const t = await getTranslations({ locale, namespace: 'UitlegVideos' })
  const title = t('title')
  const description = t('intro')
  return {
    title,
    description,
    alternates: canoniek(locale, '/uitleg-videos'),
    openGraph: deelkaart(locale, '/uitleg-videos', { title, description }),
  }
}

export default async function UitlegVideosPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const search = (await searchParams) ?? {}
  stuurOudeVideolinkDoor(locale, search.video)

  return <UitlegVideosInhoud locale={locale} slug={null} />
}
