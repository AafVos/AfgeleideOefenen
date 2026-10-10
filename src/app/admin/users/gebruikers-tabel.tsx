import { Badge, Card } from '@/components/ui'

import { setUserRole } from './actions'
import type { UserOverview } from './statistieken'

/**
 * Datum met het tijdstip eronder. Op één regel wordt de kolom zo breed dat
 * de laatste kolommen van de tabel van het scherm af vallen.
 */
function Tijdstip({ waarde }: { waarde: string | null }) {
  if (!waarde) return <span className="text-text-muted">—</span>
  const moment = new Date(waarde)
  return (
    <div className="whitespace-nowrap">
      <div>{moment.toLocaleDateString('nl-NL')}</div>
      <div>
        {moment.toLocaleTimeString('nl-NL', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </div>
    </div>
  )
}

/**
 * De tabel op /admin/users. Tien kolommen passen niet op een smal scherm,
 * dus de kaart schuift horizontaal mee in plaats van de tekst te persen.
 */
export function GebruikersTabel({ users }: { users: UserOverview[] }) {
  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[64rem] text-sm">
        <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
          <tr>
            <th className="px-3 py-2 font-medium">Gebruikersnaam</th>
            <th className="px-3 py-2 font-medium">E-mail</th>
            <th className="px-3 py-2 font-medium">Rol</th>
            <th className="px-3 py-2 font-medium">Aangemeld</th>
            <th className="px-3 py-2 font-medium">Bevestigd</th>
            <th className="px-3 py-2 font-medium">Laatst ingelogd</th>
            <th className="px-3 py-2 font-medium">Laatste antwoord</th>
            <th className="px-3 py-2 font-medium">Gemasterde clusters</th>
            <th className="px-3 py-2 font-medium">Antwoorden</th>
            <th className="px-3 py-2 font-medium">% correct</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((u) => {
            const setRole = setUserRole.bind(null, u.id)
            return (
              <tr key={u.id} className="align-top">
                <td className="px-3 py-2">
                  {u.username ?? <span className="text-text-muted">—</span>}
                </td>
                <td className="px-3 py-2 text-text-muted">{u.email}</td>
                <td className="px-3 py-2">
                  <form action={setRole} className="flex items-center gap-2">
                    <select
                      name="role"
                      defaultValue={u.role}
                      className="rounded-md border border-border bg-surface px-2 py-1 text-sm"
                    >
                      <option value="student">student</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      type="submit"
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      zet
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  <Tijdstip waarde={u.createdAt} />
                </td>
                <td className="px-3 py-2 text-xs">
                  {u.emailConfirmed ? (
                    <Badge tone="accent">ja</Badge>
                  ) : (
                    <Badge tone="warn">nee</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  <Tijdstip waarde={u.lastSignInAt} />
                </td>
                <td className="px-3 py-2 text-xs text-text-muted">
                  <Tijdstip waarde={u.lastAnsweredAt} />
                </td>
                <td className="px-3 py-2">
                  {u.mastered > 0 ? (
                    <Badge tone="accent">{u.mastered}</Badge>
                  ) : (
                    <span className="text-text-muted">0</span>
                  )}
                </td>
                <td className="px-3 py-2">{u.total}</td>
                <td className="px-3 py-2">
                  {u.percentCorrect === null ? (
                    <span className="text-text-muted">—</span>
                  ) : (
                    `${u.percentCorrect}%`
                  )}
                </td>
              </tr>
            )
          })}
          {users.length === 0 && (
            <tr>
              <td colSpan={10} className="px-3 py-10 text-center text-text-muted">
                Nog geen gebruikers.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  )
}
