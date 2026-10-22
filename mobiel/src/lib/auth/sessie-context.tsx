import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'

import { supabase } from '@/lib/supabase'

type SessieWaarde = {
  sessie: Session | null
  /** True totdat de bewaarde sessie (AsyncStorage) voor het eerst gelezen is. */
  laden: boolean
}

const SessieContext = createContext<SessieWaarde>({ sessie: null, laden: true })

export function SessieProvider({ children }: { children: ReactNode }) {
  const [sessie, setSessie] = useState<Session | null>(null)
  const [laden, setLaden] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessie(data.session)
      setLaden(false)
    })

    const { data } = supabase.auth.onAuthStateChange((_event, nieuweSessie) => {
      setSessie(nieuweSessie)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  return <SessieContext.Provider value={{ sessie, laden }}>{children}</SessieContext.Provider>
}

export function useSessie() {
  return useContext(SessieContext)
}
