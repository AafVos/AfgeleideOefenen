import { createServiceRoleClient } from '@/lib/supabase/server'
import { Badge, Card } from '@/components/ui'

import { setUserRole } from './actions'
import { loadUserOverview, type UserOverview } from './statistieken'

export default async function UsersPage() {
  let users: UserOverview[] = []
  let loadFailed = false

  try {
    users = await loadUserOverview(createServiceRoleClient())
  } catch (error) {
    console.error('Gebruikers ophalen mislukt', error)
    loadFailed = true
  }

  if (loadFailed) {
    return (
      <div className="space-y-6">
        <h2 className="font-serif text-xl text-text">Gebruikers</h2>
        <Card>
          <p className="text-sm text-text">
            De gebruikers konden nu niet opgehaald worden. Ververs de pagina om
            het opnieuw te proberen.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Gebruikers</h2>
        <p className="text-sm text-text-muted">
          {users.length} {users.length === 1 ? 'account' : 'accounts'}. Klik op
          een rol om iemand admin te maken of terug te zetten naar student.
        </p>
      </div>

      <Card className="p-0 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2 text-left text-xs uppercase tracking-wider text-text-muted">
            <tr>
              <th className="px-4 py-2 font-medium">Gebruikersnaam</th>
              <th className="px-4 py-2 font-medium">E-mail</th>
              <th className="px-4 py-2 font-medium">Rol</th>
              <th className="px-4 py-2 font-medium">Gemasterde clusters</th>
              <th className="px-4 py-2 font-medium">Antwoorden</th>
              <th className="px-4 py-2 font-medium">% correct</th>
              <th className="px-4 py-2 font-medium">Laatste activiteit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((u) => {
              const setRole = setUserRole.bind(null, u.id)
              return (
                <tr key={u.id} className="align-top">
                  <td className="px-4 py-2">
                    {u.username ?? <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-2 text-text-muted">{u.email}</td>
                  <td className="px-4 py-2">
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
                  <td className="px-4 py-2">
                    {u.mastered > 0 ? (
                      <Badge tone="accent">{u.mastered}</Badge>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{u.total}</td>
                  <td className="px-4 py-2">
                    {u.percentCorrect === null ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      `${u.percentCorrect}%`
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">
                    {u.lastAnsweredAt
                      ? new Date(u.lastAnsweredAt).toLocaleString('nl-NL')
                      : '—'}
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-text-muted"
                >
                  Nog geen gebruikers.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
