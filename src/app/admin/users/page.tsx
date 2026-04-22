import { createServiceRoleClient } from '@/lib/supabase/server'
import { Badge, Card } from '@/components/ui'

import { setUserRole } from './actions'

export default async function UsersPage() {
  const admin = createServiceRoleClient()

  const [
    authUsersRes,
    { data: profiles },
    { data: progressRows },
    { data: answerRows },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
    admin
      .from('profiles')
      .select('id, username, role, created_at')
      .order('created_at', { ascending: false }),
    admin
      .from('user_progress')
      .select('user_id, status'),
    admin
      .from('session_answers')
      .select(
        'is_correct, answered_at, session_id, user_sessions!inner(user_id)',
      )
      .returns<
        Array<{
          is_correct: boolean | null
          answered_at: string
          session_id: string
          user_sessions: { user_id: string } | { user_id: string }[]
        }>
      >(),
  ])

  const emailById = new Map(
    authUsersRes.data.users.map((u) => [u.id, u.email ?? '—']),
  )

  // Aggregate stats per user.
  const masteredByUser = new Map<string, number>()
  for (const row of progressRows ?? []) {
    if (row.status === 'mastered') {
      masteredByUser.set(row.user_id, (masteredByUser.get(row.user_id) ?? 0) + 1)
    }
  }

  const answersByUser = new Map<
    string,
    { total: number; correct: number; lastAnsweredAt: string | null }
  >()
  for (const row of answerRows ?? []) {
    // Supabase typings see this as an array when using the !inner hint.
    const userId = (
      Array.isArray(row.user_sessions)
        ? row.user_sessions[0]
        : (row.user_sessions as unknown as { user_id: string })
    )?.user_id
    if (!userId) continue
    const agg = answersByUser.get(userId) ?? {
      total: 0,
      correct: 0,
      lastAnsweredAt: null,
    }
    agg.total += 1
    if (row.is_correct) agg.correct += 1
    if (
      !agg.lastAnsweredAt ||
      (row.answered_at && row.answered_at > agg.lastAnsweredAt)
    ) {
      agg.lastAnsweredAt = row.answered_at
    }
    answersByUser.set(userId, agg)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Gebruikers</h2>
        <p className="text-sm text-text-muted">
          {profiles?.length ?? 0} accounts. Klik op een rol om iemand admin te
          maken of terug te zetten naar student.
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
            {profiles?.map((p) => {
              const stats = answersByUser.get(p.id)
              const mastered = masteredByUser.get(p.id) ?? 0
              const pct =
                stats && stats.total > 0
                  ? Math.round((stats.correct / stats.total) * 100)
                  : null
              const setRole = setUserRole.bind(null, p.id)
              return (
                <tr key={p.id} className="align-top">
                  <td className="px-4 py-2">
                    {p.username ?? <span className="text-text-muted">—</span>}
                  </td>
                  <td className="px-4 py-2 text-text-muted">
                    {emailById.get(p.id) ?? '—'}
                  </td>
                  <td className="px-4 py-2">
                    <form action={setRole} className="flex items-center gap-2">
                      <select
                        name="role"
                        defaultValue={p.role}
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
                    {mastered > 0 ? (
                      <Badge tone="accent">{mastered}</Badge>
                    ) : (
                      <span className="text-text-muted">0</span>
                    )}
                  </td>
                  <td className="px-4 py-2">{stats?.total ?? 0}</td>
                  <td className="px-4 py-2">
                    {pct === null ? (
                      <span className="text-text-muted">—</span>
                    ) : (
                      `${pct}%`
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-text-muted">
                    {stats?.lastAnsweredAt
                      ? new Date(stats.lastAnsweredAt).toLocaleString('nl-NL')
                      : '—'}
                  </td>
                </tr>
              )
            })}
            {!profiles?.length && (
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
