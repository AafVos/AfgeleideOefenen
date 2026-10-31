import { ProbeerKnop } from '@/components/probeer-knop'
import { YoutubeInsluiting } from '@/components/youtube-insluiting'
import { getWiskundeMetAafVideos, type VideoPagina } from '@/lib/wiskunde-met-aaf-videos'

/**
 * Video('s) van het YouTube-kanaal "Wiskunde met Aaf" die bij deze pagina
 * horen: titel, één zin uitleg, duur, eventuele examenbron en een knop naar
 * de bijbehorende oefenstof. Leeg (geen DOM) zolang er voor deze pagina nog
 * geen video klaarstaat.
 */
export function WiskundeMetAafVideos({
  pagina,
  className = 'mt-12',
}: {
  pagina: VideoPagina
  className?: string
}) {
  const videos = getWiskundeMetAafVideos(pagina)
  if (videos.length === 0) return null

  return (
    <section className={className}>
      <div className="space-y-10">
        {videos.map((video) => (
          <div key={video.id}>
            <YoutubeInsluiting videoId={video.youtubeId} titel={video.title} />
            <h2 className="mt-3 font-serif text-xl text-text">{video.title}</h2>
            <p className="mt-1 text-text-muted">{video.description}</p>
            <p className="mt-1 text-sm text-text-muted">
              {video.duration}
              {video.bron ? ` · ${video.bron}` : ''}
            </p>
            <div className="mt-4">
              <ProbeerKnop
                oefenen={`${video.oefenen}&van=youtube-video`}
                dataMeet="video-wiskunde-met-aaf-oefenen"
                label="Oefen dit zelf"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
