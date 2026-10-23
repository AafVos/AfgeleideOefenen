import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

import { Colors, Fonts } from '@/constants/theme'
import { ApiFout, haalIndeling, type Kopje, type OverzichtHoofdstuk } from '@/lib/api/app-api'

type Status =
  | { type: 'laden' }
  | { type: 'fout'; bericht: string }
  | { type: 'klaar'; hoofdstuk: OverzichtHoofdstuk | null }

/**
 * Paragraaf → theorieblok → soort som binnen één hoofdstuk. Een hoofdstuk
 * zonder boekparagrafen (bv. Beweging, Examentraining) toont zijn `kopjes`
 * direct — zelfde regel als `bouwOefenOverzicht` op de site.
 */
export default function HoofdstukScherm() {
  const { hoofdstukId } = useLocalSearchParams<{ hoofdstukId: string }>()
  const [status, setStatus] = useState<Status>({ type: 'laden' })
  const [poging, setPoging] = useState(0)

  useEffect(() => {
    let actief = true
    haalIndeling()
      .then((alles) => {
        if (actief) {
          setStatus({ type: 'klaar', hoofdstuk: alles.find((h) => h.chapter.id === hoofdstukId) ?? null })
        }
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
  }, [hoofdstukId, poging])

  function opnieuwProberen() {
    setStatus({ type: 'laden' })
    setPoging((p) => p + 1)
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.back()} style={styles.terug} hitSlop={8}>
        <Text style={styles.terugTekst}>← Terug</Text>
      </Pressable>

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

      {status.type === 'klaar' && status.hoofdstuk === null && (
        <Text style={styles.ondertitel}>Dit hoofdstuk is niet gevonden.</Text>
      )}

      {status.type === 'klaar' && status.hoofdstuk && (
        <>
          <Text style={styles.titel}>{status.hoofdstuk.chapter.title}</Text>
          <ScrollView contentContainerStyle={styles.lijst}>
            {status.hoofdstuk.paragrafen.length === 0 ? (
              <KopjesLijst kopjes={status.hoofdstuk.kopjes} />
            ) : (
              status.hoofdstuk.paragrafen.map((p) => (
                <View key={p.id} style={styles.sectie}>
                  <Text style={styles.sectieTitel}>
                    {p.label} {p.title}
                  </Text>
                  {p.blokken.map((b) => (
                    <View key={b.id} style={styles.blok}>
                      <Text style={styles.blokTitel}>
                        {b.letter} {b.title}
                      </Text>
                      <KopjesLijst kopjes={b.kopjes} />
                    </View>
                  ))}
                </View>
              ))
            )}
          </ScrollView>
        </>
      )}
    </SafeAreaView>
  )
}

function KopjesLijst({ kopjes }: { kopjes: Kopje[] }) {
  return (
    <View style={styles.kopjesLijst}>
      {kopjes.map((k) =>
        k.sub.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => router.push(`/oefenen/som/${s.clusterId}`)}
            style={({ pressed }) => [styles.tegel, pressed && styles.tegelIngedrukt]}
          >
            <Text style={styles.tegelTekst}>{s.label}</Text>
          </Pressable>
        )),
      )}
    </View>
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
  midden: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titel: {
    fontFamily: Fonts.serif,
    fontSize: 24,
    color: Colors.text,
    marginTop: 8,
    marginBottom: 12,
  },
  ondertitel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textMuted,
  },
  lijst: {
    gap: 20,
    paddingBottom: 24,
  },
  sectie: {
    gap: 8,
  },
  sectieTitel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  blok: {
    gap: 8,
  },
  blokTitel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 15,
    color: Colors.text,
  },
  kopjesLijst: {
    gap: 8,
  },
  tegel: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  tegelIngedrukt: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  tegelTekst: {
    fontFamily: Fonts.sans,
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
    marginTop: 8,
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
