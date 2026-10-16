import { cookies } from 'next/headers'
import { after } from 'next/server'

import { geldigeZending, isBot } from '@/lib/meten/gebeurtenis'
import { createServiceRoleClient } from '@/lib/supabase/server'
import { heeftSessiekoekje } from '@/lib/supabase/sessie-koekje'

/**
 * Waar de klikmeting binnenkomt. Het scriptje in de browser stuurt hier per
 * paar seconden een handvol gebeurtenissen heen met `navigator.sendBeacon`.
 *
 * Deze route schrijft niets rechtstreeks weg: `meet_opslaan` in de database
 * (migratie 0072) kijkt alles nog een keer na en bewaakt de grens van 300
 * gebeurtenissen per tabblad per uur.
 *
 * Of iemand is ingelogd bepalen we hier, aan de hand van het sessiekoekje.
 * De browser kan daar zelf niet bij, en wie het is slaan we niet op.
 */

/** Hoe groot een verzending hoogstens mag zijn. Ruim boven 40 gebeurtenissen. */
const MAX_BYTES = 16_000

/** Eén op de honderd verzendingen kijkt of het dagelijks onderhoud nog moet. */
const ONDERHOUD_KANS = 0.01

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

  const koekjes = await cookies()
  const ingelogd = heeftSessiekoekje(koekjes.getAll())

  const supabase = createServiceRoleClient()
  const { error } = await supabase.rpc('meet_opslaan', {
    gebeurtenissen: rijen.map((rij) => ({ ...rij, ingelogd })),
  })
  if (error) {
    // Een meting die niet aankomt mag nooit een leerling in de weg zitten.
    console.error('[meet]', error.message)
  }

  // Deze database heeft geen pg_cron, dus liften de dagtotalen en het
  // opruimen na 90 dagen mee op het verkeer. De functie zelf doet hoogstens
  // één keer per dag iets.
  if (Math.random() < ONDERHOUD_KANS) {
    after(async () => {
      const { error: onderhoudsfout } =
        await createServiceRoleClient().rpc('site_meting_onderhoud')
      if (onderhoudsfout) console.error('[meet onderhoud]', onderhoudsfout.message)
    })
  }

  return new Response(null, { status: 204 })
}
