import { useState } from 'react'
import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'

import { Colors, Fonts } from '@/constants/theme'
import { toestemmingsmelding } from '@/lib/media/camera-toestemming'

/**
 * Een foto van je uitwerking erbij, als geheugensteun tijdens het maken van
 * de som (AFG-559). De foto gaat nergens heen: geen upload, geen Supabase,
 * niets op de site. Hij verdwijnt zodra je een nieuwe opgave opent of
 * opnieuw probeert.
 */
export function FotoUitwerking({
  uri,
  onChange,
}: {
  uri: string | null
  onChange: (uri: string | null) => void
}) {
  const [bezig, setBezig] = useState(false)
  const [fout, setFout] = useState<string | null>(null)

  async function maakFoto() {
    if (bezig) return
    setBezig(true)
    setFout(null)
    try {
      const toestemming = await ImagePicker.requestCameraPermissionsAsync()
      const melding = toestemmingsmelding('camera', toestemming)
      if (melding) {
        setFout(melding)
        return
      }
      const resultaat = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      })
      if (!resultaat.canceled && resultaat.assets[0]) {
        onChange(resultaat.assets[0].uri)
      }
    } catch {
      setFout('Het maken van de foto is niet gelukt. Probeer het nog eens.')
    } finally {
      setBezig(false)
    }
  }

  async function kiesFoto() {
    if (bezig) return
    setBezig(true)
    setFout(null)
    try {
      const toestemming = await ImagePicker.requestMediaLibraryPermissionsAsync()
      const melding = toestemmingsmelding('fotos', toestemming)
      if (melding) {
        setFout(melding)
        return
      }
      const resultaat = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.7,
      })
      if (!resultaat.canceled && resultaat.assets[0]) {
        onChange(resultaat.assets[0].uri)
      }
    } catch {
      setFout('Het kiezen van een foto is niet gelukt. Probeer het nog eens.')
    } finally {
      setBezig(false)
    }
  }

  return (
    <View style={styles.blok}>
      <Text style={styles.titel}>Foto van je uitwerking (optioneel)</Text>

      {uri ? (
        <View style={styles.voorvertoning}>
          <Image source={{ uri }} style={styles.afbeelding} resizeMode="contain" />
          <Pressable
            onPress={() => onChange(null)}
            hitSlop={16}
            accessibilityLabel="Foto weghalen"
            style={({ pressed }) => [styles.kruisje, pressed && styles.kruisjeIngedrukt]}
          >
            <Text style={styles.kruisjeTekst}>×</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.knoppenRij}>
          <Pressable
            onPress={maakFoto}
            disabled={bezig}
            style={({ pressed }) => [
              styles.knopSecundair,
              (pressed || bezig) && styles.knopUitgeschakeld,
            ]}
          >
            <Text style={styles.knopSecundairTekst}>Maak een foto</Text>
          </Pressable>
          <Pressable
            onPress={kiesFoto}
            disabled={bezig}
            style={({ pressed }) => [
              styles.knopSecundair,
              (pressed || bezig) && styles.knopUitgeschakeld,
            ]}
          >
            <Text style={styles.knopSecundairTekst}>Kies een foto</Text>
          </Pressable>
        </View>
      )}

      {fout && (
        <View style={styles.foutBanner} accessibilityRole="alert">
          <Text style={styles.foutTekst}>{fout}</Text>
        </View>
      )}

      <Text style={styles.uitleg}>Deze foto blijft alleen op je telefoon.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  blok: {
    gap: 8,
  },
  titel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  knoppenRij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
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
  knopUitgeschakeld: {
    opacity: 0.5,
  },
  knopSecundairTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.text,
  },
  voorvertoning: {
    alignSelf: 'flex-start',
    position: 'relative',
  },
  afbeelding: {
    width: 160,
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface2,
  },
  kruisje: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.accent2,
  },
  kruisjeIngedrukt: {
    opacity: 0.7,
  },
  kruisjeTekst: {
    fontFamily: Fonts.sansBold,
    fontSize: 16,
    lineHeight: 16,
    color: Colors.surface,
  },
  foutBanner: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.accent2,
    backgroundColor: Colors.accent2Light,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  foutTekst: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.accent2,
  },
  uitleg: {
    fontFamily: Fonts.sans,
    fontSize: 12,
    color: Colors.textMuted,
  },
})
