import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts,
} from '@expo-google-fonts/dm-sans'
import { DMSerifDisplay_400Regular } from '@expo-google-fonts/dm-serif-display'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import * as SplashScreen from 'expo-splash-screen'
import { useEffect } from 'react'

import { Colors } from '@/constants/theme'
import { SessieProvider, useSessie } from '@/lib/auth/sessie-context'

SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const [fontsGeladen] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
    DMSerifDisplay_400Regular,
  })

  return (
    <SessieProvider>
      <AppInhoud fontsGeladen={fontsGeladen} />
    </SessieProvider>
  )
}

// Wacht met het verbergen van het opstartscherm tot zowel de lettertypen als
// de bewaarde sessie geladen zijn — anders flitst even het inlogscherm op
// voordat de bewaarde sessie bekend is.
function AppInhoud({ fontsGeladen }: { fontsGeladen: boolean }) {
  const { laden: sessieLaden } = useSessie()
  const klaar = fontsGeladen && !sessieLaden

  useEffect(() => {
    if (klaar) {
      SplashScreen.hideAsync()
    }
  }, [klaar])

  if (!klaar) {
    return null
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
        }}
      />
    </>
  )
}
