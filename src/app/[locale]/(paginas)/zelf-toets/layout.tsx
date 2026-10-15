import { requireUser } from '@/lib/supabase/require-user'

// De inlogcontrole staat hier en niet alleen in `page.tsx`, omdat
// `loading.tsx` in deze map een Suspense-grens om de pagina legt — ook om de
// toets zelf en de uitslag eronder. Zie de uitleg bij `requireUser`.
export default async function ZelfToetsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  return children
}
