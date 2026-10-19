import { Card } from '@/components/ui'
import { createServiceRoleClient } from '@/lib/supabase/server'

type Regel = {
  jaar: number
  tijdvak: number
  vraagnummer: string
  aantal: number
  laatste: string
}

function datum(waarde: string): string {
  return new Date(waarde).toLocaleDateString('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Welke examenvragen het vaakst om een uitlegvideo gevraagd worden.
 *
 * Alleen de aantallen: de toelichtingen en de e-mailadressen van leerlingen
 * blijven hier buiten. Die staan in de tabel `video_aanvragen` zelf, en het
 * seintje per mail komt al binnen zodra iemand iets aanvraagt.
 */
export default async function AdminVideoAanvragenPage() {
  const admin = createServiceRoleClient()

  const [perVraag, totaal, wachtendOpBericht] = await Promise.all([
    admin
      .from('video_aanvragen_per_vraag')
      .select('jaar, tijdvak, vraagnummer, aantal, laatste')
      .order('aantal', { ascending: false })
      .order('laatste', { ascending: false })
      .limit(200),
    admin.from('video_aanvragen').select('*', { count: 'exact', head: true }),
    admin
      .from('video_aanvragen')
      .select('*', { count: 'exact', head: true })
      .eq('mag_mailen', true)
      .eq('afgehandeld', false),
  ])

  if (perVraag.error) {
    console.error('Video-aanvragen per vraag ophalen mislukt', perVraag.error)
  }

  const regels = (perVraag.data ?? []) as Regel[]

  return (
    <div>
      <h2 className="mb-4 font-serif text-xl text-text">Video-aanvragen</h2>

      {perVraag.error && (
        <p className="mb-4 rounded-lg border border-amber-700/40 bg-amber-50 px-4 py-3 text-sm text-text">
          Het overzicht kon nu niet geladen worden. Ververs de pagina om het
          opnieuw te proberen.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <p className="text-xs uppercase tracking-wider text-text-muted">
            Aanvragen totaal
          </p>
          <p className="mt-1 font-serif text-3xl text-text">{totaal.count ?? '—'}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-text-muted">
            Verschillende vragen
          </p>
          <p className="mt-1 font-serif text-3xl text-text">{regels.length}</p>
        </Card>
        <Card>
          <p className="text-xs uppercase tracking-wider text-text-muted">
            Wacht nog op bericht
          </p>
          <p className="mt-1 font-serif text-3xl text-text">
            {wachtendOpBericht.count ?? '—'}
          </p>
        </Card>
      </div>

      {regels.length === 0 ? (
        <p className="mt-6 text-sm text-text-muted">
          Nog geen aanvragen. Het formulier staat op /nl/video-aanvragen.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border text-xs uppercase tracking-wider text-text-muted">
              <tr>
                <th className="px-4 py-3">Examenvraag</th>
                <th className="px-4 py-3">Aanvragen</th>
                <th className="px-4 py-3">Laatste</th>
              </tr>
            </thead>
            <tbody>
              {regels.map((r) => (
                <tr
                  key={`${r.jaar}-${r.tijdvak}-${r.vraagnummer}`}
                  className="border-b border-border last:border-0"
                >
                  <td className="px-4 py-3 text-text">
                    {r.jaar} · tijdvak {r.tijdvak} · vraag {r.vraagnummer}
                  </td>
                  <td className="px-4 py-3 font-serif text-lg text-text">{r.aantal}</td>
                  <td className="px-4 py-3 text-text-muted">{datum(r.laatste)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
