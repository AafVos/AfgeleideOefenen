import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'

import { Colors, Fonts } from '@/constants/theme'
import { useSessie } from '@/lib/auth/sessie-context'
import { ApiFout, haalVoortgang, type VoortgangHoofdstuk, type VoortgangSoort } from '@/lib/api/app-api'

type Status =
  | { type: 'laden' }
  | { type: 'fout'; bericht: string }
  | { type: 'klaar'; hoofdstukken: VoortgangHoofdstuk[] }

/**
 * Voortgang per hoofdstuk en soort som (AFG-560). Dezelfde cijfers als het
 * dashboard op de site: `/api/app/voortgang` rekent met dezelfde
 * `bouwOnderwerpVoortgang` en `telBeheerst` als `/dashboard`.
 */
export default function VoortgangScherm() {
  const { sessie, laden: sessieLaden } = useSessie()
  const [status, setStatus] = useState<Status>({ type: 'laden' })
  const [poging, setPoging] = useState(0)
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    if (sessieLaden) return
    if (!sessie) {
      router.replace('/inloggen')
      return
    }
    let actief = true
    haalVoortgang()
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
      <Text style={styles.titel}>Voortgang</Text>
      <Text style={styles.ondertitel}>Wat je al beheerst, per hoofdstuk</Text>

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
        <Text style={styles.ondertitel}>Er is nog geen voortgang om te laten zien.</Text>
      )}

      {status.type === 'klaar' && status.hoofdstukken.length > 0 && (
        <ScrollView contentContainerStyle={styles.lijst}>
          {status.hoofdstukken.map((h) => (
            <HoofdstukKaart
              key={h.id}
              hoofdstuk={h}
              open={open === h.id}
              onToggle={() => setOpen((huidig) => (huidig === h.id ? null : h.id))}
            />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

function HoofdstukKaart({
  hoofdstuk,
  open,
  onToggle,
}: {
  hoofdstuk: VoortgangHoofdstuk
  open: boolean
  onToggle: () => void
}) {
  return (
    <View style={styles.kaart}>
      <Pressable onPress={onToggle} style={styles.kaartKop} hitSlop={4}>
        <Text style={styles.kaartTitel} numberOfLines={1}>
          {hoofdstuk.title}
        </Text>
        <Text style={styles.kaartAantal}>
          {hoofdstuk.mastered}/{hoofdstuk.total}
        </Text>
        <Text style={[styles.kaartPct, hoofdstuk.pct === 100 && styles.kaartPctVol]}>
          {hoofdstuk.pct}%
        </Text>
      </Pressable>

      <View style={styles.balkOndergrond}>
        <View style={[styles.balkGevuld, { width: `${hoofdstuk.pct}%` }]} />
      </View>

      {open && (
        <View style={styles.soortenLijst}>
          {hoofdstuk.soorten.map((soort) => (
            <SoortRegel key={soort.id} soort={soort} />
          ))}
        </View>
      )}
    </View>
  )
}

function SoortRegel({ soort }: { soort: VoortgangSoort }) {
  return (
    <View style={styles.soortRegel}>
      <View style={[styles.stip, soort.isKnown && styles.stipBeheerst]} />
      <Text style={styles.soortTitel} numberOfLines={2}>
        {soort.title}
      </Text>
      <Text style={[styles.soortReeks, soort.isKnown && styles.soortReeksBeheerst]}>
        {soort.isKnown ? 'Beheerst' : `${soort.correctStreak}/3 goed op rij`}
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
    paddingHorizontal: 24,
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
  kaart: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  kaartKop: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  kaartTitel: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.text,
  },
  kaartAantal: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textMuted,
  },
  kaartPct: {
    width: 38,
    textAlign: 'right',
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  kaartPctVol: {
    color: Colors.accent,
  },
  balkOndergrond: {
    height: 4,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 2,
    backgroundColor: Colors.surface2,
    overflow: 'hidden',
  },
  balkGevuld: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: Colors.accent,
  },
  soortenLijst: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 6,
  },
  soortRegel: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  stip: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.border,
  },
  stipBeheerst: {
    backgroundColor: Colors.accent,
  },
  soortTitel: {
    flex: 1,
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
  },
  soortReeks: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textMuted,
  },
  soortReeksBeheerst: {
    fontFamily: Fonts.sansMedium,
    color: Colors.accent,
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
