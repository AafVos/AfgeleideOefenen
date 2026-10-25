import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Poppetje } from '@/components/poppetje'
import { Colors, Fonts } from '@/constants/theme'
import { useSessie } from '@/lib/auth/sessie-context'
import { supabase } from '@/lib/supabase'

export default function StartScherm() {
  const { sessie } = useSessie()

  if (sessie) {
    return <IngelogdScherm email={sessie.user.email ?? ''} />
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.midden}>
        <Poppetje size={96} />
        <Text style={styles.titel}>AfgeleideOefenen</Text>
        <Text style={styles.ondertitel}>Oefen vwo wiskunde B — differentiëren</Text>
      </View>

      <Pressable
        onPress={() => router.push('/inloggen')}
        style={({ pressed }) => [styles.knop, pressed && styles.knopIngedrukt]}
      >
        <Text style={styles.knopTekst}>Inloggen</Text>
      </Pressable>
    </SafeAreaView>
  )
}

function IngelogdScherm({ email }: { email: string }) {
  const [bezig, setBezig] = useState(false)

  async function uitloggen() {
    setBezig(true)
    await supabase.auth.signOut()
    // Geen setBezig(false) nodig: na het uitloggen verdwijnt dit scherm
    // vanzelf (sessie wordt null) en toont StartScherm het inlogscherm weer.
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.midden}>
        <Poppetje size={96} />
        <Text style={styles.titel}>Welkom terug</Text>
        <Text style={styles.ondertitel}>Je bent ingelogd als {email}</Text>
      </View>

      <Pressable
        onPress={() => router.push('/oefenen')}
        style={({ pressed }) => [styles.knop, pressed && styles.knopIngedrukt]}
      >
        <Text style={styles.knopTekst}>Oefenen</Text>
      </Pressable>

      <Pressable
        onPress={uitloggen}
        disabled={bezig}
        style={({ pressed }) => [
          styles.knop,
          styles.knopSecundair,
          styles.knopMetRuimte,
          (pressed || bezig) && styles.knopIngedrukt,
        ]}
      >
        {bezig ? (
          <ActivityIndicator color={Colors.text} />
        ) : (
          <Text style={[styles.knopTekst, styles.knopTekstSecundair]}>Uitloggen</Text>
        )}
      </Pressable>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  midden: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  titel: {
    fontFamily: Fonts.serif,
    fontSize: 32,
    color: Colors.text,
    textAlign: 'center',
  },
  ondertitel: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  knop: {
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  knopIngedrukt: {
    opacity: 0.85,
  },
  knopTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.surface,
  },
  knopSecundair: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  knopMetRuimte: {
    marginTop: 10,
  },
  knopTekstSecundair: {
    color: Colors.text,
  },
})
