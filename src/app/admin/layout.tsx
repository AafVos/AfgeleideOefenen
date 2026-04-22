import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Admin · afgeleideoefenen.nl',
}

const NAV = [
  { href: '/admin', label: 'Overzicht' },
  { href: '/admin/topics', label: 'Topics' },
  { href: '/admin/questions', label: 'Vragen' },
  { href: '/admin/root-causes', label: 'Root causes' },
  { href: '/admin/flags', label: 'Flags' },
  { href: '/admin/users', label: 'Gebruikers' },
]

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/inloggen')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-accent">
            Admin
          </p>
          <h1 className="font-serif text-2xl text-text">Beheer</h1>
        </div>
      </div>

      <nav className="mb-6 flex flex-wrap gap-1 rounded-xl border border-border bg-surface p-1">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-3 py-1.5 text-sm text-text-muted hover:bg-surface-2 hover:text-text"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  )
}
