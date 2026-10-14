import { ImageResponse } from 'next/og'

export const DEELPLAATJE = { width: 1200, height: 630 }

/** Kort genoeg voor het plaatje, zonder rare tekens uit het adres. */
export function veiligeDeeltitel(ruw: string | null): string {
  const tekst = (ruw ?? '').replace(/\s+/g, ' ').trim().slice(0, 80)
  return tekst || 'Afgeleide oefenen'
}

/** Het plaatje dat WhatsApp bij een gedeelde link toont: titel en het logo. */
export function maakDeelplaatje(titel: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#1b4332',
          color: '#f0ebe0',
          padding: '72px 80px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: '#2d6a4f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              fontFamily: 'Georgia, serif',
            }}
          >
            AO
          </div>
          <div style={{ fontSize: 32, letterSpacing: 1 }}>afgeleideoefenen.nl</div>
        </div>
        <div
          style={{
            fontSize: titel.length > 36 ? 64 : 80,
            lineHeight: 1.15,
            fontFamily: 'Georgia, serif',
            maxWidth: 1000,
          }}
        >
          {titel}
        </div>
        <div style={{ fontSize: 28, opacity: 0.85 }}>Wiskunde B · differentiëren oefenen</div>
      </div>
    ),
    { ...DEELPLAATJE },
  )
}
