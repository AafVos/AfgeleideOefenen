import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'

export async function SiteHeader() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let username: string | null = null
  let role: string | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('username, role')
      .eq('id', user.id)
      .maybeSingle()
    username = data?.username ?? null
    role = data?.role ?? null
  }

  return (
    <header className="sticky top-0 z-30 h-14 border-b border-border bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
        <Link
          href="/"
          className="font-serif text-lg font-medium tracking-tight text-text"
        >
          afgeleideoefenen
          <span className="text-accent">.nl</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm">
          {user ? (
            <>
              <Link
                href="/oefenen"
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                Oefenen
              </Link>
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                Dashboard
              </Link>
              {role === 'admin' && (
                <Link
                  href="/admin"
                  className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  Admin
                </Link>
              )}
              <span className="mx-2 hidden text-text-muted sm:inline">
                {username ?? user.email}
              </span>
              <form action="/uitloggen" method="post">
                <button
                  type="submit"
                  className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
                >
                  Uitloggen
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/inloggen"
                className="rounded-md px-3 py-1.5 text-text-muted hover:bg-surface-2 hover:text-text"
              >
                Inloggen
              </Link>
              <Link
                href="/registreren"
                className="ml-1 rounded-md bg-accent px-3 py-1.5 text-white hover:bg-accent/90"
              >
                Registreren
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
