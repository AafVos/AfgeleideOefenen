import { getTranslations } from 'next-intl/server'

import { getCurrentUser } from '@/lib/supabase/request-cache'
import { createClient } from '@/lib/supabase/server'
import { getUitlegVideos, uitlegVideoPad } from '@/lib/videos'

import { UitlegVideosClient, type OefenVraag } from './uitleg-videos-client'

/** Kies max `count` vragen, verdeeld over de clusters, makkelijkste eerst. */
function pickQuestions(
  rows: Array<{ id: string; cluster_id: string; difficulty: number; latex_body: string | null }>,
  clusterIds: string[],
  count: number,
): OefenVraag[] {
  const byCluster = new Map<string, typeof rows>()
  for (const id of clusterIds) byCluster.set(id, [])
  for (const row of rows) byCluster.get(row.cluster_id)?.push(row)
  for (const list of byCluster.values()) {
    list.sort(() => Math.random() - 0.5)
  }

  const picked: typeof rows = []
  let added = true
  while (picked.length < count && added) {
    added = false
    for (const list of byCluster.values()) {
      const next = list.pop()
      if (next && picked.length < count) {
        picked.push(next)
        added = true
      }
    }
  }

  return picked
    .sort((a, b) => a.difficulty - b.difficulty)
    .map((q) => ({ id: q.id, latex_body: q.latex_body }))
}

/** De spelerspagina. Zonder slug speelt de eerste video, op het overzicht. */
export async function UitlegVideosInhoud({
  locale,
  slug,
}: {
  locale: string
  slug: string | null
}) {
  const t = await getTranslations('UitlegVideos')

  const videos = getUitlegVideos()
  const activeVideo = videos.find((v) => v.slug === slug) ?? videos[0] ?? null

  const user = await getCurrentUser()

  let vragen: OefenVraag[] = []
  if (user && activeVideo && activeVideo.clusterIds.length > 0) {
    const supabase = await createClient()
    const { data } = await supabase
      .from('questions_new')
      .select('id, cluster_id, difficulty, latex_body')
      .in('cluster_id', activeVideo.clusterIds)
    vragen = pickQuestions(data ?? [], activeVideo.clusterIds, 3)
  }

  return (
    <UitlegVideosClient
      videos={videos.map((v) => ({
        slug: v.slug,
        title: v.title,
        description: v.description,
        uitleg: v.uitleg,
        duration: v.duration,
        src: v.src,
        href: `/${locale}${uitlegVideoPad(v.slug)}`,
        soort: v.soort,
        chapter: v.chapter,
        hasPractice: v.clusterIds.length > 0,
        oefenen: v.oefenen,
        theorieHref: v.theoriePad ? `/${locale}${v.theoriePad}` : null,
      }))}
      activeSlug={activeVideo?.slug ?? null}
      vragen={vragen}
      isLoggedIn={!!user}
      loginHref={`/${locale}/inloggen`}
      registerHref={`/${locale}/registreren`}
      oefenHref={`/${locale}/oefenen`}
      videoAanvraagHref={`/${locale}/video-aanvragen`}
      videoAlsKop={slug !== null}
      labels={{
        h1: t('h1'),
        intro: t('intro'),
        playlistTitle: t('playlistTitle'),
        practiceTitle: t('practiceTitle'),
        questionTile: t.raw('questionTile') as string,
        preview: t('preview'),
        placeholder: t('placeholder'),
        check: t('check'),
        checking: t('checking'),
        correct: t('correct'),
        wrongTitle: t('wrongTitle'),
        yourAnswer: t('yourAnswer'),
        correctAnswer: t('correctAnswer'),
        stepsTitle: t('stepsTitle'),
        nextQuestion: t('nextQuestion'),
        previousQuestion: t('previousQuestion'),
        morePractice: t('morePractice'),
        askTitle: t('askTitle'),
        askIntro: t('askIntro'),
        askCta: t('askCta'),
        askPlaceholder: t('askPlaceholder'),
        askSend: t('askSend'),
        askThanks: t('askThanks'),
        askPhoto: t('askPhoto'),
        askPhotoHint: t('askPhotoHint'),
        askPhotoRemove: t('askPhotoRemove'),
        askPhotoAlt: t('askPhotoAlt'),
        askPhotoBusy: t('askPhotoBusy'),
        askPhotoTooBig: t('askPhotoTooBig'),
        groupGeneral: t('groupGeneral'),
        groupWalkthrough: t('groupWalkthrough'),
        chapterOther: t('chapterOther'),
        learnTitle: t('learnTitle'),
        ruleTitle: t('ruleTitle'),
        exampleTitle: t('exampleTitle'),
        writtenLink: t('writtenLink'),
        askNoAccount: t('askNoAccount'),
        askLogin: t('askLogin'),
        askRegister: t('askRegister'),
        videoAanvraagLink: t('videoAanvraagLink'),
      }}
    />
  )
}
