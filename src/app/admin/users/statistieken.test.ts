import { describe, expect, it } from 'vitest'

import {
  countAnswersPerUser,
  fetchAllAuthUsers,
  fetchAllRows,
  loadUserOverview,
  type AdminClient,
  type AnswerRow,
} from './statistieken'

// =====================================================================
// De beheerpagina Gebruikers telt zelf de antwoorden per gebruiker.
// Supabase geeft hoogstens 1000 rijen per query terug, dus het gaat er
// hier vooral om dat alles binnenkomt: ook antwoord 1001 en verder.
//
// Een nepdatabase in het geheugen bootst na wat Supabase doet: `range()`
// snijdt een stuk uit de lijst en nooit meer dan 1000 rijen.
// =====================================================================

const SUPABASE_MAX_ROWS = 1000

/** Snijdt een pagina uit een lijst, net zoals Supabase dat doet. */
function page<T>(rows: T[], from: number, to: number) {
  const end = Math.min(to + 1, from + SUPABASE_MAX_ROWS)
  return { data: rows.slice(from, end), error: null }
}

describe('fetchAllRows', () => {
  it('haalt meer dan 1000 rijen op in meerdere pagina’s', async () => {
    const rows = Array.from({ length: 1480 }, (_, i) => ({ n: i }))
    const ranges: Array<[number, number]> = []

    const opgehaald = await fetchAllRows<{ n: number }>((from, to) => {
      ranges.push([from, to])
      return Promise.resolve(page(rows, from, to))
    })

    expect(opgehaald).toHaveLength(1480)
    expect(opgehaald[0]).toEqual({ n: 0 })
    expect(opgehaald[1479]).toEqual({ n: 1479 })
    expect(ranges).toEqual([
      [0, 999],
      [1000, 1999],
    ])
  })

  it('stopt na één pagina als de lijst korter is dan een pagina', async () => {
    let aanroepen = 0
    const rijen = await fetchAllRows<{ n: number }>((from, to) => {
      aanroepen++
      return Promise.resolve(page([{ n: 1 }, { n: 2 }], from, to))
    })

    expect(rijen).toHaveLength(2)
    expect(aanroepen).toBe(1)
  })

  it('stopt ook als het laatste antwoord precies een volle pagina is', async () => {
    const rows = Array.from({ length: 2000 }, (_, i) => ({ n: i }))
    const rijen = await fetchAllRows<{ n: number }>((from, to) =>
      Promise.resolve(page(rows, from, to)),
    )

    expect(rijen).toHaveLength(2000)
  })

  it('geeft een fout door in plaats van stilletjes minder rijen', async () => {
    await expect(
      fetchAllRows(() =>
        Promise.resolve({ data: null, error: { message: 'kapot' } }),
      ),
    ).rejects.toThrow('kapot')
  })
})

describe('fetchAllAuthUsers', () => {
  it('loopt door tot alle accounts binnen zijn', async () => {
    const alle = Array.from({ length: 450 }, (_, i) => ({ id: `u${i}` }))
    const gevraagd: number[] = []

    const users = await fetchAllAuthUsers(({ page: p, perPage }) => {
      gevraagd.push(p)
      const from = (p - 1) * perPage
      return Promise.resolve({
        data: { users: alle.slice(from, from + perPage) },
        error: null,
      })
    })

    expect(users).toHaveLength(450)
    expect(gevraagd).toEqual([1, 2, 3])
  })
})

describe('countAnswersPerUser', () => {
  it('telt totaal, goed en de laatste activiteit per gebruiker', () => {
    const rijen: AnswerRow[] = [
      {
        is_correct: true,
        answered_at: '2026-01-01T10:00:00Z',
        user_sessions_new: { user_id: 'a' },
      },
      {
        is_correct: false,
        answered_at: '2026-03-05T09:00:00Z',
        user_sessions_new: [{ user_id: 'a' }],
      },
      {
        is_correct: true,
        answered_at: '2026-02-02T10:00:00Z',
        user_sessions_new: { user_id: 'b' },
      },
      // Zonder sessie kunnen we het antwoord niet toewijzen: overslaan.
      { is_correct: true, answered_at: '2026-04-01T10:00:00Z', user_sessions_new: null },
    ]

    const perGebruiker = countAnswersPerUser(rijen)

    expect(perGebruiker.get('a')).toEqual({
      total: 2,
      correct: 1,
      lastAnsweredAt: '2026-03-05T09:00:00Z',
    })
    expect(perGebruiker.get('b')?.total).toBe(1)
    expect(perGebruiker.size).toBe(2)
  })

  it('telt een opgevraagde uitwerking niet als antwoord', () => {
    // "Ik weet het niet" komt met een lege is_correct binnen (zie AFG-102).
    const rijen: AnswerRow[] = [
      {
        is_correct: true,
        answered_at: '2026-01-01T10:00:00Z',
        user_sessions_new: { user_id: 'a' },
      },
      {
        is_correct: null,
        answered_at: '2026-01-02T10:00:00Z',
        user_sessions_new: { user_id: 'a' },
      },
    ]

    expect(countAnswersPerUser(rijen).get('a')).toEqual({
      total: 1,
      correct: 1,
      lastAnsweredAt: '2026-01-01T10:00:00Z',
    })
  })
})

// ---------------------------------------------------------------------
// Nepdatabase: genoeg van Supabase om loadUserOverview te laten draaien.
// ---------------------------------------------------------------------

type Tabellen = {
  profiles: Array<{ id: string; username: string | null; role: 'student' | 'admin'; created_at: string }>
  user_progress_new: Array<{ user_id: string; status: string }>
  session_answers_new: AnswerRow[]
}

function nepClient(tabellen: Tabellen, authUsers: Array<{ id: string; email: string }>) {
  const bouwer = (rijen: unknown[]) => {
    const api = {
      select: () => api,
      order: () => api,
      returns: () => api,
      range: (from: number, to: number) => Promise.resolve(page(rijen, from, to)),
    }
    return api
  }

  return {
    from: (tabel: keyof Tabellen) => bouwer(tabellen[tabel]),
    auth: {
      admin: {
        listUsers: ({ page: p, perPage }: { page: number; perPage: number }) => {
          const from = (p - 1) * perPage
          return Promise.resolve({
            data: { users: authUsers.slice(from, from + perPage) },
            error: null,
          })
        },
      },
    },
  } as unknown as AdminClient
}

describe('loadUserOverview', () => {
  it('telt ook antwoord 1001 en verder mee, inclusief de laatste activiteit', async () => {
    // 1480 antwoorden, zoals er nu in de database staan. De laatste 480
    // vielen voorheen weg omdat Supabase bij 1000 rijen stopt.
    const answers: AnswerRow[] = Array.from({ length: 1480 }, (_, i) => ({
      is_correct: i % 2 === 0,
      // Oplopend in de tijd, net als de volgorde van de query.
      answered_at: new Date(Date.UTC(2026, 0, 1, 0, i)).toISOString(),
      // De laatste 480 horen bij de nieuwe leerling.
      user_sessions_new: { user_id: i < 1000 ? 'oud' : 'nieuw' },
    }))

    const overzicht = await loadUserOverview(
      nepClient(
        {
          profiles: [
            { id: 'nieuw', username: 'nieuw', role: 'student', created_at: '2026-02-01' },
            { id: 'oud', username: 'oud', role: 'student', created_at: '2026-01-01' },
          ],
          user_progress_new: [
            { user_id: 'nieuw', status: 'mastered' },
            { user_id: 'nieuw', status: 'mastered' },
            { user_id: 'nieuw', status: 'in_progress' },
          ],
          session_answers_new: answers,
        },
        [{ id: 'nieuw', email: 'nieuw@voorbeeld.test' }],
      ),
    )

    const nieuw = overzicht.find((u) => u.id === 'nieuw')!
    expect(nieuw.total).toBe(480)
    expect(nieuw.mastered).toBe(2)
    // 480 antwoorden, om en om goed en fout vanaf nummer 1000 (even = goed).
    expect(nieuw.correct).toBe(240)
    expect(nieuw.percentCorrect).toBe(50)
    // Dit is waar het om begonnen was: er staat een laatste activiteit.
    expect(nieuw.lastAnsweredAt).toBe(
      new Date(Date.UTC(2026, 0, 1, 0, 1479)).toISOString(),
    )

    const oud = overzicht.find((u) => u.id === 'oud')!
    expect(oud.total).toBe(1000)
    // Geen account in de inloglijst gevonden: streepje in plaats van leeg.
    expect(oud.email).toBe('—')
  })
})
