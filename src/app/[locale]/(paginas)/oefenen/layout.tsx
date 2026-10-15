import { requireUser } from '@/lib/supabase/require-user'

// De inlogcontrole staat hier en niet alleen in `page.tsx`, omdat
// `loading.tsx` in deze map een Suspense-grens om de pagina legt. Zie de
// uitleg bij `requireUser`.
export default async function OefenenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()
  return children
}
