'use client'

import { useState } from 'react'

function IconPlayGroot() {
  return (
    <svg className="size-16 text-white drop-shadow" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8 5.14v13.72c0 .8.87 1.3 1.56.88l10.54-6.86a1.05 1.05 0 0 0 0-1.76L9.56 4.26A1.04 1.04 0 0 0 8 5.14Z" />
    </svg>
  )
}

/**
 * Privacyvriendelijke YouTube-insluiting: vóór een klik laadt er alleen een
 * miniatuur, geen iframe, dus geen cookies of scripts van YouTube. Pas na de
 * klik verschijnt het echte, geëmbedde filmpje, via youtube-nocookie.com.
 */
export function YoutubeInsluiting({ videoId, titel }: { videoId: string; titel: string }) {
  const [geladen, setGeladen] = useState(false)

  if (geladen) {
    return (
      <iframe
        key={videoId}
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
        title={titel}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="aspect-video w-full rounded-2xl border border-border bg-black"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setGeladen(true)}
      aria-label={titel}
      className="group relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-sm"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        loading="lazy"
        className="absolute inset-0 size-full object-cover"
      />
      <span className="absolute inset-0 bg-black/20 transition group-hover:bg-black/30" />
      <IconPlayGroot />
    </button>
  )
}
