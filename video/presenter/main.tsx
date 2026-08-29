import { Player, type PlayerRef } from '@remotion/player'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'

import { SOM29_CUES, type Cue } from '../src/cues'
import { SOM29_DUUR, Som29Video } from '../src/Som29Video'

const CUES: Cue[] = SOM29_CUES
const DUUR = SOM29_DUUR
const FPS = 30

function Presenter() {
  const spelerRef = useRef<PlayerRef>(null)
  const doelRef = useRef<number | null>(null)
  const [stap, setStap] = useState(0)

  // Pauzeer zodra het doel-frame is bereikt.
  useEffect(() => {
    const speler = spelerRef.current
    if (!speler) return
    const opFrame = (e: { detail: { frame: number } }) => {
      const doel = doelRef.current
      if (doel !== null && e.detail.frame >= doel) {
        speler.pause()
        speler.seekTo(doel)
        doelRef.current = null
      }
    }
    speler.addEventListener('frameupdate', opFrame)
    return () => speler.removeEventListener('frameupdate', opFrame)
  }, [])

  const volgende = useCallback(() => {
    setStap((huidig) => {
      if (huidig >= CUES.length - 1) return huidig
      const doel = CUES[huidig + 1].frame
      doelRef.current = doel
      spelerRef.current?.play()
      return huidig + 1
    })
  }, [])

  const vorige = useCallback(() => {
    setStap((huidig) => {
      const nieuw = Math.max(0, huidig - 1)
      doelRef.current = null
      spelerRef.current?.pause()
      spelerRef.current?.seekTo(CUES[nieuw].frame)
      return nieuw
    })
  }, [])

  useEffect(() => {
    const opToets = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowRight') {
        e.preventDefault()
        volgende()
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault()
        vorige()
      }
    }
    window.addEventListener('keydown', opToets)
    return () => window.removeEventListener('keydown', opToets)
  }, [volgende, vorige])

  const knopStijl: React.CSSProperties = {
    fontSize: 16,
    fontWeight: 600,
    padding: '10px 22px',
    borderRadius: 10,
    border: 'none',
    cursor: 'pointer',
    background: '#2d6a4f',
    color: '#fff',
  }

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: 16 }}>
      <Player
        ref={spelerRef}
        component={Som29Video}
        durationInFrames={DUUR}
        compositionWidth={1920}
        compositionHeight={1080}
        fps={FPS}
        style={{ width: '100%', borderRadius: 12 }}
        controls={false}
        clickToPlay={false}
        initiallyMuted
      />
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '14px 4px',
          color: '#f0efe9',
        }}
      >
        <button type="button" style={{ ...knopStijl, background: '#7a7870' }} onClick={vorige}>
          ← Vorige
        </button>
        <button type="button" style={knopStijl} onClick={volgende}>
          Volgende (spatie)
        </button>
        <div style={{ fontSize: 15 }}>
          <strong>
            {stap + 1}/{CUES.length}
          </strong>{' '}
          · {CUES[stap].label}
          {stap < CUES.length - 1 ? (
            <span style={{ opacity: 0.6 }}> — hierna: {CUES[stap + 1].label}</span>
          ) : null}
        </div>
      </div>
      <p style={{ color: '#7a7870', fontSize: 13, margin: '0 4px' }}>
        Geluid staat uit — jij praat. Neem per scène audio op (bijv. Spraakmemo's) terwijl je
        doorklikt; ←/→ werken ook.
      </p>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(<Presenter />)
