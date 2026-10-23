import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Colors, Fonts } from '@/constants/theme'
import { useSessie } from '@/lib/auth/sessie-context'
import { ApiFout, haalIndeling, type OverzichtHoofdstuk } from '@/lib/api/app-api'

type Status =
  | { type: 'laden' }
  | { type: 'fout'; bericht: string }
  | { type: 'klaar'; hoofdstukken: OverzichtHoofdstuk[] }

/**
 * Hoofdstukken kiezen, zelfde indeling als `/oefenen` op de site
 * (`oefenIndeling()` in `src/lib/practice/oefenen-indeling.ts`, hoofdmap).
 */
export default function OefenenScherm() {
  const { sessie, laden: sessieLaden } = useSessie()
  const [status, setStatus] = useState<Status>({ type: 'laden' })
  const [poging, setPoging] = useState(0)

  useEffect(() => {
    if (sessieLaden) return
    if (!sessie) {
      router.replace('/inloggen')
      return
    }
    // Geen setState vóór de await: dat telt als render-tijd, niet als
    // reactie op iets buiten React (zie react-hooks/set-state-in-effect).
    // Een nieuwe poging zet `status` daarom terug bij de knop zelf, niet hier.
    let actief = true
    haalIndeling()
      .then((hoofdstukken) => {
        if (actief) setStatus({ type: 'klaar', hoofdstukken })
      })
      .catch((e: unknown) => {
        if (actief) {
          setStatus({
            type: 'fout',
            bericht: e instanceof ApiFout ? e.message : 'Er ging iets mis. Probeer het nog eens.',
          })
        }
      })
    return () => {
      actief = false
    }
  }, [sessie, sessieLaden, poging])

  function opnieuwProberen() {
    setStatus({ type: 'laden' })
    setPoging((p) => p + 1)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.back()} style={styles.terug} hitSlop={8}>
        <Text style={styles.terugTekst}>← Terug</Text>
      </Pressable>

      <Text style={styles.titel}>Oefenen</Text>
      <Text style={styles.ondertitel}>Kies een hoofdstuk om te beginnen</Text>

      {status.type === 'laden' && (
        <View style={styles.midden}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      )}

      {status.type === 'fout' && (
        <View style={styles.foutBanner} accessibilityRole="alert">
          <Text style={styles.foutTekst}>{status.bericht}</Text>
          <Pressable onPress={opnieuwProberen} style={styles.opnieuwKnop} hitSlop={8}>
            <Text style={styles.opnieuwTekst}>Opnieuw proberen</Text>
          </Pressable>
        </View>
      )}

      {status.type === 'klaar' && status.hoofdstukken.length === 0 && (
        <Text style={styles.ondertitel}>Er zijn nog geen oefenopgaven.</Text>
      )}

      {status.type === 'klaar' && status.hoofdstukken.length > 0 && (
        <ScrollView contentContainerStyle={styles.lijst}>
          {status.hoofdstukken.map((h) => (
            <Pressable
              key={h.chapter.id}
              onPress={() => router.push(`/oefenen/${h.chapter.id}`)}
              style={({ pressed }) => [styles.tegel, pressed && styles.tegelIngedrukt]}
            >
              <Text style={styles.tegelTekst}>{h.chapter.title}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 24,
  },
  terug: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  terugTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.textMuted,
  },
  titel: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    marginTop: 8,
  },
  ondertitel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textMuted,
    marginTop: 4,
    marginBottom: 16,
  },
  midden: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lijst: {
    gap: 10,
    paddingBottom: 24,
  },
  tegel: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  tegelIngedrukt: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  tegelTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.text,
  },
  foutBanner: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent2,
    backgroundColor: Colors.accent2Light,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  foutTekst: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.accent2,
  },
  opnieuwKnop: {
    minHeight: 44,
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  opnieuwTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.accent2,
    textDecorationLine: 'underline',
  },
})
