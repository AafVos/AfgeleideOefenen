import { useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router, useLocalSearchParams } from 'expo-router'

import { FotoUitwerking } from '@/components/foto-uitwerking'
import { Math as Formule } from '@/components/math'
import { MathKeyboard } from '@/components/math-keyboard'
import { RichMath } from '@/components/rich-math'
import { Colors, Fonts } from '@/constants/theme'
import {
  ApiFout,
  haalOpgave,
  stuurAntwoordIn,
  type NakijkUitslag,
  type Opgave,
  type Stap,
} from '@/lib/api/app-api'
import { insertAtCursor, toLatexPreview } from '@/lib/practice/input'

type Toestand =
  | { fase: 'invoer'; fout: string | null }
  | { fase: 'nakijken' }
  | { fase: 'goed'; streak: number; mastered: boolean }
  | {
      fase: 'fout'
      jouwAntwoord: string
      goedeAntwoord: string
      latexGoedeAntwoord: string | null
      uitleg: string | null
      melding: string | null
      uitwerkingZichtbaar: boolean
    }

function metVoorvoegsel(prefix: string, rest: string): string {
  return prefix ? `${prefix} ${rest}` : rest
}

type LaadStatus = { type: 'laden' } | { type: 'fout'; bericht: string } | { type: 'klaar' }

export default function SomScherm() {
  const { clusterId } = useLocalSearchParams<{ clusterId: string }>()
  const [laadStatus, setLaadStatus] = useState<LaadStatus>({ type: 'laden' })
  const [clusterTitle, setClusterTitle] = useState('')
  const [opgave, setOpgave] = useState<Opgave | null>(null)
  const [poging, setPoging] = useState(0)
  const [antwoord, setAntwoord] = useState('')
  const [fotoUri, setFotoUri] = useState<string | null>(null)
  const [toestand, setToestand] = useState<Toestand>({ fase: 'invoer', fout: null })
  const selectieRef = useRef({ start: 0, eind: 0 })
  const gestartOp = useRef<number | null>(null)

  useEffect(() => {
    let actief = true
    haalOpgave(clusterId)
      .then((res) => {
        if (!actief) return
        setClusterTitle(res.clusterTitle)
        setOpgave(res.opgave)
        gestartOp.current = Date.now()
        setAntwoord('')
        setFotoUri(null)
        setToestand({ fase: 'invoer', fout: null })
        setLaadStatus({ type: 'klaar' })
      })
      .catch((e: unknown) => {
        if (actief) {
          setLaadStatus({
            type: 'fout',
            bericht: e instanceof ApiFout ? e.message : 'Er ging iets mis. Probeer het nog eens.',
          })
        }
      })
    return () => {
      actief = false
    }
  }, [clusterId, poging])

  /** Een nieuwe opgave uit dezelfde soort som (na "Volgende" of bij opnieuw proberen laden). */
  function volgende() {
    setLaadStatus({ type: 'laden' })
    setPoging((p) => p + 1)
  }

  function voegIn(tekst: string) {
    const { start, eind } = selectieRef.current
    const { value, caret } = insertAtCursor(antwoord, start, eind, tekst)
    setAntwoord(value)
    selectieRef.current = { start: caret, eind: caret }
  }

  async function nakijken() {
    if (!opgave || !antwoord.trim()) return
    setToestand({ fase: 'nakijken' })
    const seconden = Math.round((Date.now() - (gestartOp.current ?? Date.now())) / 1000)
    let uitslag: NakijkUitslag
    try {
      uitslag = await stuurAntwoordIn(opgave.id, antwoord, seconden)
    } catch (e) {
      setToestand({
        fase: 'invoer',
        fout: e instanceof ApiFout ? e.message : 'Nakijken is niet gelukt. Probeer het nog eens.',
      })
      return
    }

    if (uitslag.kind === 'error') {
      setToestand({ fase: 'invoer', fout: uitslag.message })
      return
    }
    if (uitslag.kind === 'correct') {
      setToestand({ fase: 'goed', streak: uitslag.streak, mastered: uitslag.mastered })
      return
    }
    setToestand({
      fase: 'fout',
      jouwAntwoord: antwoord,
      goedeAntwoord: uitslag.correctAnswer,
      latexGoedeAntwoord: uitslag.latexCorrectAnswer,
      uitleg: uitslag.errorExplanation,
      melding: uitslag.melding,
      uitwerkingZichtbaar: false,
    })
  }

  function opnieuw() {
    setAntwoord('')
    setFotoUri(null)
    setToestand({ fase: 'invoer', fout: null })
    gestartOp.current = Date.now()
  }

  if (laadStatus.type === 'laden') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.midden}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      </SafeAreaView>
    )
  }

  if (laadStatus.type === 'fout' || !opgave) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Pressable onPress={() => router.back()} style={styles.terug} hitSlop={8}>
          <Text style={styles.terugTekst}>← Terug</Text>
        </Pressable>
        <View style={styles.foutBanner} accessibilityRole="alert">
          <Text style={styles.foutTekst}>
            {laadStatus.type === 'fout' ? laadStatus.bericht : 'Opgave niet gevonden.'}
          </Text>
          <Pressable onPress={volgende} style={styles.opnieuwKnop} hitSlop={8}>
            <Text style={styles.opnieuwTekst}>Opnieuw proberen</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const prefix = opgave.answerPrefix

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => router.back()} style={styles.terug} hitSlop={8}>
          <Text style={styles.terugTekst}>← Terug</Text>
        </Pressable>

        {clusterTitle ? <Text style={styles.clusterTitel}>{clusterTitle}</Text> : null}

        <View style={styles.formuleBlok}>
          {opgave.latex_body?.includes('$') ? (
            <RichMath source={opgave.latex_body} />
          ) : (
            <Formule tex={opgave.latex_body ?? ''} displayMode />
          )}

          {toestand.fase === 'invoer' && (
            <View style={styles.previewBlok}>
              <Formule
                tex={metVoorvoegsel(prefix, antwoord.trim() ? toLatexPreview(antwoord) : '\\ldots')}
                displayMode
              />
            </View>
          )}

          {toestand.fase === 'fout' && toestand.jouwAntwoord.trim() && (
            <View style={styles.antwoordKaart}>
              <Text style={styles.antwoordLabel}>Jouw antwoord</Text>
              <Formule tex={metVoorvoegsel(prefix, toLatexPreview(toestand.jouwAntwoord))} />
            </View>
          )}

          {toestand.fase === 'fout' && toestand.uitwerkingZichtbaar && (
            <View style={[styles.antwoordKaart, styles.antwoordKaartGoed]}>
              <Text style={[styles.antwoordLabel, styles.antwoordLabelGoed]}>Juiste antwoord</Text>
              <Formule
                tex={metVoorvoegsel(
                  prefix,
                  (toestand.latexGoedeAntwoord ?? toestand.goedeAntwoord).replaceAll('$', ''),
                )}
              />
            </View>
          )}
        </View>

        {toestand.fase === 'invoer' && (
          <View style={styles.invoerBlok}>
            <TextInput
              value={antwoord}
              onChangeText={setAntwoord}
              onSelectionChange={(e) => {
                selectieRef.current = {
                  start: e.nativeEvent.selection.start,
                  eind: e.nativeEvent.selection.end,
                }
              }}
              placeholder="Bijv. 12x^2"
              placeholderTextColor={Colors.textMuted}
              style={styles.invoer}
              autoCapitalize="none"
              autoCorrect={false}
              editable={toestand.fase === 'invoer'}
            />
            <MathKeyboard onInsert={voegIn} />

            <FotoUitwerking uri={fotoUri} onChange={setFotoUri} />

            {toestand.fout && (
              <View style={styles.foutBanner} accessibilityRole="alert">
                <Text style={styles.foutTekst}>{toestand.fout}</Text>
              </View>
            )}

            <Pressable
              onPress={nakijken}
              disabled={!antwoord.trim()}
              style={({ pressed }) => [
                styles.knop,
                (pressed || !antwoord.trim()) && styles.knopUitgeschakeld,
              ]}
            >
              <Text style={styles.knopTekst}>Nakijken</Text>
            </Pressable>
          </View>
        )}

        {toestand.fase === 'nakijken' && (
          <View style={styles.midden}>
            <ActivityIndicator color={Colors.accent} />
          </View>
        )}

        {toestand.fase === 'goed' && (
          <View style={[styles.uitslagKaart, styles.uitslagGoed]}>
            <Text style={styles.uitslagTitel}>{toestand.mastered ? 'Geweldig, onderdeel afgerond!' : 'Goed!'}</Text>
            <Text style={styles.uitslagTekst}>
              {toestand.mastered
                ? 'Je hebt 3 keer goed op rij. Dit onderdeel staat nu als afgerond op je voortgangspagina.'
                : `${toestand.streak} van de 3 goed op rij.`}
            </Text>
            <View style={styles.knoppenRij}>
              <Pressable onPress={volgende} style={styles.knop}>
                <Text style={styles.knopTekst}>Volgende</Text>
              </Pressable>
              <Pressable onPress={opnieuw} style={styles.knopSecundair}>
                <Text style={styles.knopSecundairTekst}>Opnieuw proberen</Text>
              </Pressable>
            </View>
          </View>
        )}

        {toestand.fase === 'fout' && (
          <View style={[styles.uitslagKaart, styles.uitslagFout]}>
            <Text style={styles.uitslagTitel}>Niet helemaal goed</Text>
            {toestand.uitleg && <Text style={styles.uitslagTekst}>{toestand.uitleg}</Text>}
            {toestand.melding && <Text style={styles.uitslagTekstMuted}>{toestand.melding}</Text>}

            {toestand.uitwerkingZichtbaar && <StappenLijst steps={opgave.steps} />}

            <View style={styles.knoppenRij}>
              <Pressable onPress={opnieuw} style={styles.knop}>
                <Text style={styles.knopTekst}>Opnieuw proberen</Text>
              </Pressable>
              {!toestand.uitwerkingZichtbaar && (
                <Pressable
                  onPress={() => setToestand({ ...toestand, uitwerkingZichtbaar: true })}
                  style={styles.knopSecundair}
                >
                  <Text style={styles.knopSecundairTekst}>Laat het goede antwoord zien</Text>
                </Pressable>
              )}
              {toestand.uitwerkingZichtbaar && (
                <Pressable onPress={volgende} style={styles.knopSecundair}>
                  <Text style={styles.knopSecundairTekst}>Volgende</Text>
                </Pressable>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  )
}

function StappenLijst({ steps }: { steps: Stap[] }) {
  const geordend = [...steps].sort((a, b) => a.step_order - b.step_order)
  if (geordend.length === 0) {
    return <Text style={styles.uitslagTekstMuted}>Bij deze opgave staat nog geen stappenplan klaar.</Text>
  }
  return (
    <View style={styles.stappen}>
      <Text style={styles.stappenTitel}>Stappenplan: zo hoort het stap voor stap</Text>
      {geordend.map((s, i) => (
        <View key={s.id} style={styles.stap}>
          <Text style={styles.stapLabel}>Stap {i + 1}:</Text>
          <RichMath source={s.step_description} />
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 16,
  },
  midden: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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
  clusterTitel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  formuleBlok: {
    gap: 12,
  },
  previewBlok: {
    marginTop: 4,
  },
  antwoordKaart: {
    borderWidth: 1,
    borderColor: Colors.accent2,
    backgroundColor: Colors.accent2Light,
    borderRadius: 10,
    padding: 12,
  },
  antwoordKaartGoed: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  antwoordLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    color: Colors.accent2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  antwoordLabelGoed: {
    color: Colors.accent,
  },
  invoerBlok: {
    gap: 8,
  },
  invoer: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 17,
    color: Colors.text,
    backgroundColor: Colors.surface,
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
  knopUitgeschakeld: {
    opacity: 0.5,
  },
  knopTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.surface,
  },
  knopSecundair: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  knopSecundairTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.text,
  },
  knoppenRij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  uitslagKaart: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  uitslagGoed: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentLight,
  },
  uitslagFout: {
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  uitslagTitel: {
    fontFamily: Fonts.serif,
    fontSize: 20,
    color: Colors.text,
  },
  uitslagTekst: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
  },
  uitslagTekstMuted: {
    fontFamily: Fonts.sans,
    fontSize: 13,
    color: Colors.textMuted,
  },
  stappen: {
    marginTop: 8,
    gap: 10,
  },
  stappenTitel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
  },
  stap: {
    gap: 2,
  },
  stapLabel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
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
