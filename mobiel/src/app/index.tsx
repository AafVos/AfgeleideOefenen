import { Pressable, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { Poppetje } from '@/components/poppetje'
import { Colors, Fonts } from '@/constants/theme'

export default function StartScherm() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.midden}>
        <Poppetje size={96} />
        <Text style={styles.titel}>AfgeleideOefenen</Text>
        <Text style={styles.ondertitel}>Oefen vwo wiskunde B — differentiëren</Text>
      </View>

      <Pressable
        // Gaat pas naar het inlogscherm zodra dat gebouwd is (App 2/5).
        onPress={() => {}}
        style={({ pressed }) => [styles.knop, pressed && styles.knopIngedrukt]}
      >
        <Text style={styles.knopTekst}>Inloggen</Text>
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
})
