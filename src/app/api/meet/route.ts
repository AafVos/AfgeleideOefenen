import { cookies } from 'next/headers'

import { SITE_CONFIG } from '@/config/site'
import { geldigeZending, isBot } from '@/lib/meten/gebeurtenis'
import { schuilnaam } from '@/lib/meten/schuilnaam'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { heeftSessiekoekje } from '@/lib/supabase/sessie-koekje'

/**
 * Waar de klikmeting binnenkomt. Het scriptje in de browser stuurt hier per
 * paar seconden een handvol gebeurtenissen heen met `navigator.sendBeacon`.
 *
 * Deze route schrijft niets rechtstreeks weg: `meet_opslaan` in de database
 * (migraties 0072 en 0073) kijkt alles nog een keer na, deelt het volgnummer
 * binnen het tabblad uit en bewaakt de grens van 300 gebeurtenissen per
 * tabblad per uur.
 *
 * Of iemand is ingelogd bepalen we hier, aan de hand van het sessiekoekje.
 * Is dat zo, dan rekenen we ook de schuilnaam uit: HMAC van het gebruikers-id
 * met `MEET_SCHUILNAAM_GEHEIM`. Het gebruikers-id zelf gaat niet mee naar de
 * database en komt nergens in een logregel.
 */

/** Hoe groot een verzending hoogstens mag zijn. Ruim boven 40 gebeurtenissen. */
const MAX_BYTES = 16_000

/**
 * Wie er klikt, als schuilnaam. Zonder sessiekoekje kijken we Supabase niet
 * eens lastig. Lukt het uitlezen niet, dan telt de klik gewoon mee als
 * ingelogd, maar zonder schuilnaam.
 */
async function wieKlikt(): Promise<{ ingelogd: boolean; naam: string | null }> {
  const koekjes = await cookies()
  if (!heeftSessiekoekje(koekjes.getAll())) return { ingelogd: false, naam: null }

  try {
    const supabase = await createClient()
    // getClaims controleert het token, meestal zonder netwerkverkeer.
    const { data } = await supabase.auth.getClaims()
    const gebruikerId = data?.claims?.sub ?? null
    return {
      ingelogd: true,
      naam: await schuilnaam(gebruikerId, process.env.MEET_SCHUILNAAM_GEHEIM),
    }
  } catch {
    return { ingelogd: true, naam: null }
  }
}

export async function POST(req: Request) {
  if (isBot(req.headers.get('user-agent'))) {
    return new Response(null, { status: 204 })
  }

  const tekst = await req.text()
  if (!tekst || tekst.length > MAX_BYTES) {
    return new Response(null, { status: 204 })
  }

  let ruw: unknown
  try {
    ruw = JSON.parse(tekst)
  } catch {
    return new Response(null, { status: 204 })
  }

  const rijen = geldigeZending(ruw)
  if (!rijen.length) return new Response(null, { status: 204 })

  const { ingelogd, naam } = await wieKlikt()

  const supabase = createServiceRoleClient()
  const { error } = await supabase.rpc('meet_opslaan', {
    gebeurtenissen: rijen.map((rij) => ({ ...rij, ingelogd })),
    schuilnaam: naam,
    // Welke van de twee sites dit is, weet de server zelf. De browser mag
    // dat niet zeggen: dan kon iedereen de tellingen door elkaar gooien.
    site: SITE_CONFIG.variant,
  })
  if (error) {
    // Een meting die niet aankomt mag nooit een leerling in de weg zitten.
    console.error('[meet]', error.message)
  }

  return new Response(null, { status: 204 })
}
