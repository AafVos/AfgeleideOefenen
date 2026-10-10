import { createServiceRoleClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui'

import { GebruikersTabel } from './gebruikers-tabel'
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
          {users.length} {users.length === 1 ? 'account' : 'accounts'}, nieuwste
          aanmelding bovenaan. Klik op een rol om iemand admin te maken of terug
          te zetten naar student.
        </p>
      </div>

      <GebruikersTabel users={users} />
    </div>
  )
}
