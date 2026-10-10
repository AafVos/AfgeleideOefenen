import type { ProfileRole } from '@/lib/supabase/types'
import type { createServiceRoleClient } from '@/lib/supabase/server'

// =====================================================================
// Gegevens voor de beheerpagina Gebruikers.
//
// Supabase geeft per query hoogstens 1000 rijen terug. Eén `select()`
// zonder meer haalt dus maar een deel van de antwoorden op, en juist de
// recentste vallen dan weg. Daarom halen we elke lijst per pagina op tot
// alles binnen is, en tellen we daarna zelf per gebruiker.
// =====================================================================

export type AdminClient = ReturnType<typeof createServiceRoleClient>

/** Hoogste aantal rijen dat Supabase in één keer teruggeeft. */
export const PAGE_SIZE = 1000

/** Accounts per pagina bij het ophalen van de inloggegevens. */
export const AUTH_PAGE_SIZE = 200

/** Noodrem: zoveel pagina's zijn genoeg, ook als er iets misgaat. */
const MAX_PAGES = 500

type PageResult<T> = { data: T[] | null; error: { message: string } | null }

/**
 * Haalt een lijst per pagina op tot hij compleet is. `fetchPage` krijgt
 * de grenzen van één pagina en geeft de rijen daarvan terug.
 */
export async function fetchAllRows<T>(
  fetchPage: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize: number = PAGE_SIZE,
): Promise<T[]> {
  const rows: T[] = []
  for (let page = 0; page < MAX_PAGES; page++) {
    const from = page * pageSize
    const { data, error } = await fetchPage(from, from + pageSize - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    for (const row of data) rows.push(row)
    // Een niet-volle pagina betekent: dit was de laatste.
    if (data.length < pageSize) break
  }
  return rows
}

type AuthUser = { id: string; email?: string | null }
type AuthPage = {
  data: { users: AuthUser[] } | null
  error: { message: string } | null
}

/** Hetzelfde, maar voor `auth.admin.listUsers`: die telt pagina's vanaf 1. */
export async function fetchAllAuthUsers(
  listUsers: (opts: { page: number; perPage: number }) => PromiseLike<AuthPage>,
  perPage: number = AUTH_PAGE_SIZE,
): Promise<AuthUser[]> {
  const users: AuthUser[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const { data, error } = await listUsers({ page, perPage })
    if (error) throw new Error(error.message)
    const batch = data?.users ?? []
    if (batch.length === 0) break
    for (const user of batch) users.push(user)
    if (batch.length < perPage) break
  }
  return users
}

export type AnswerRow = {
  is_correct: boolean | null
  answered_at: string
  user_sessions_new: { user_id: string } | { user_id: string }[] | null
}

export type AnswerStats = {
  total: number
  correct: number
  lastAnsweredAt: string | null
}

/** De sessie komt als object of als lijst van één terug, afhankelijk van de query. */
function userIdOf(row: AnswerRow): string | null {
  const session = Array.isArray(row.user_sessions_new)
    ? row.user_sessions_new[0]
    : row.user_sessions_new
  return session?.user_id ?? null
}

export function countAnswersPerUser(
  rows: AnswerRow[],
): Map<string, AnswerStats> {
  const perUser = new Map<string, AnswerStats>()
  for (const row of rows) {
    const userId = userIdOf(row)
    if (!userId) continue
    const stats = perUser.get(userId) ?? {
      total: 0,
      correct: 0,
      lastAnsweredAt: null,
    }
    stats.total += 1
    if (row.is_correct) stats.correct += 1
    if (
      row.answered_at &&
      (!stats.lastAnsweredAt || row.answered_at > stats.lastAnsweredAt)
    ) {
      stats.lastAnsweredAt = row.answered_at
    }
    perUser.set(userId, stats)
  }
  return perUser
}

export function countMasteredPerUser(
  rows: Array<{ user_id: string; status: string }>,
): Map<string, number> {
  const perUser = new Map<string, number>()
  for (const row of rows) {
    if (row.status !== 'mastered') continue
    perUser.set(row.user_id, (perUser.get(row.user_id) ?? 0) + 1)
  }
  return perUser
}

export type UserOverview = {
  id: string
  username: string | null
  role: ProfileRole
  email: string
  mastered: number
  total: number
  correct: number
  percentCorrect: number | null
  lastAnsweredAt: string | null
}

/**
 * Alle gegevens voor de tabel op /admin/users: één regel per account, met
 * het aantal antwoorden, het percentage goed en de laatste activiteit.
 */
export async function loadUserOverview(
  admin: AdminClient,
): Promise<UserOverview[]> {
  const [authUsers, profiles, progressRows, answerRows] = await Promise.all([
    fetchAllAuthUsers((opts) => admin.auth.admin.listUsers(opts)),
    fetchAllRows((from, to) =>
      admin
        .from('profiles')
        .select('id, username, role, created_at')
        // Vaste volgorde, anders schuiven rijen tussen de pagina's door.
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to),
    ),
    fetchAllRows((from, to) =>
      admin
        .from('user_progress_new')
        .select('user_id, status')
        .order('id', { ascending: true })
        .range(from, to),
    ),
    fetchAllRows<AnswerRow>((from, to) =>
      admin
        .from('session_answers_new')
        .select('is_correct, answered_at, user_sessions_new!inner(user_id)')
        // Oplopend op tijd: nieuwe antwoorden komen achteraan, dus de
        // pagina's die we al gehad hebben verschuiven niet.
        .order('answered_at', { ascending: true })
        .order('id', { ascending: true })
        .returns<AnswerRow[]>()
        .range(from, to),
    ),
  ])

  const emailById = new Map(authUsers.map((u) => [u.id, u.email ?? '—']))
  const masteredByUser = countMasteredPerUser(progressRows)
  const answersByUser = countAnswersPerUser(answerRows)

  return profiles.map((profile) => {
    const stats = answersByUser.get(profile.id)
    return {
      id: profile.id,
      username: profile.username,
      role: profile.role,
      email: emailById.get(profile.id) ?? '—',
      mastered: masteredByUser.get(profile.id) ?? 0,
      total: stats?.total ?? 0,
      correct: stats?.correct ?? 0,
      percentCorrect:
        stats && stats.total > 0
          ? Math.round((stats.correct / stats.total) * 100)
          : null,
      lastAnsweredAt: stats?.lastAnsweredAt ?? null,
    }
  })
}
