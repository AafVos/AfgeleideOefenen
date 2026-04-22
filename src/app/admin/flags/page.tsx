import Link from 'next/link'

import { Badge, Button, Card } from '@/components/ui'
import { createServiceRoleClient } from '@/lib/supabase/server'

import { resolveFlagAction } from './actions'

export const metadata = { title: 'Flags · Admin' }

type FlagRow = {
  id: string
  reason: string | null
  status: 'open' | 'resolved' | 'dismissed'
  created_at: string
  user_id: string
  question: {
    id: string
    body: string
    difficulty: number
  } | null
}

export default async function AdminFlagsPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  const params = (await searchParams) ?? {}
  const activeStatus: 'open' | 'resolved' | 'dismissed' =
    params.status === 'resolved'
      ? 'resolved'
      : params.status === 'dismissed'
        ? 'dismissed'
        : 'open'

  const supabase = createServiceRoleClient()

  const { data: flags } = await supabase
    .from('question_flags')
    .select(
      'id, reason, status, created_at, user_id, question:questions(id, body, difficulty)',
    )
    .eq('status', activeStatus)
    .order('created_at', { ascending: false })
    .returns<FlagRow[]>()

  const users =
    flags && flags.length
      ? await supabase
          .from('profiles')
          .select('id, username')
          .in(
            'id',
            Array.from(new Set(flags.map((f) => f.user_id))),
          )
      : { data: [] }

  const usernameById = new Map(
    (users.data ?? []).map((u) => [u.id, u.username] as const),
  )

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-xl text-text">Flags</h2>
        <p className="mt-1 text-sm text-text-muted">
          Vragen die studenten als &ldquo;klopt niet&rdquo; hebben gemarkeerd.
        </p>
      </div>

      <nav className="flex gap-1 rounded-lg border border-border bg-surface p-1 text-sm">
        {(['open', 'resolved', 'dismissed'] as const).map((s) => (
          <Link
            key={s}
            href={`/admin/flags?status=${s}`}
            className={
              s === activeStatus
                ? 'rounded-md bg-accent-light px-3 py-1.5 font-medium text-accent'
                : 'rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text'
            }
          >
            {s === 'open' ? 'Open' : s === 'resolved' ? 'Opgelost' : 'Afgewezen'}
          </Link>
        ))}
      </nav>

      {!flags?.length ? (
        <Card>
          <p className="text-sm text-text-muted">
            Geen flags in deze categorie.
          </p>
        </Card>
      ) : (
        <ul className="space-y-3">
          {flags.map((flag) => (
            <li key={flag.id}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-64 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {flag.question && (
                        <Badge
                          tone={
                            flag.question.difficulty === 1
                              ? 'accent'
                              : flag.question.difficulty === 2
                                ? 'warn'
                                : 'danger'
                          }
                        >
                          Moeilijkheid {flag.question.difficulty}
                        </Badge>
                      )}
                      <span className="text-xs text-text-muted">
                        door{' '}
                        <span className="font-medium text-text">
                          {usernameById.get(flag.user_id) ?? '—'}
                        </span>{' '}
                        · {new Date(flag.created_at).toLocaleString('nl-NL')}
                      </span>
                    </div>

                    {flag.question ? (
                      <p className="font-serif text-base leading-snug text-text">
                        {flag.question.body}
                      </p>
                    ) : (
                      <p className="text-sm italic text-text-muted">
                        (vraag is inmiddels verwijderd)
                      </p>
                    )}

                    {flag.reason && (
                      <p className="rounded-md border border-border bg-surface-2 p-3 text-sm text-text">
                        {flag.reason}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    {flag.question && (
                      <Link
                        href={`/admin/questions/${flag.question.id}`}
                        className="inline-flex items-center justify-center rounded-md border border-border px-3 py-1.5 text-sm text-text hover:border-accent hover:text-accent"
                      >
                        Bekijk vraag
                      </Link>
                    )}
                    {flag.status === 'open' && (
                      <>
                        <form
                          action={async () => {
                            'use server'
                            await resolveFlagAction(flag.id, 'resolved')
                          }}
                        >
                          <Button type="submit" className="w-full">
                            Markeer opgelost
                          </Button>
                        </form>
                        <form
                          action={async () => {
                            'use server'
                            await resolveFlagAction(flag.id, 'dismissed')
                          }}
                        >
                          <Button
                            type="submit"
                            variant="secondary"
                            className="w-full"
                          >
                            Negeer
                          </Button>
                        </form>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
