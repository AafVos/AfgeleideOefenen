import { redirect } from 'next/navigation'

// Fallback for when middleware locale-redirect doesn't fire (e.g. Vercel cold path)
export default function RootPage() {
  redirect('/nl')
}
