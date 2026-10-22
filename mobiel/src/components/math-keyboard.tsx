import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Colors, Fonts } from '@/constants/theme'

/**
 * Dezelfde vier knoppen als `src/components/math-keyboard.tsx` op de site:
 * macht, wortel, breuk en pi. Ze voegen tekst in op de cursorpositie van het
 * antwoordveld (zie `insertAtCursor` in `lib/practice/input.ts`) — geen
 * LaTeX, gewoon de typsyntax die de nakijk-route ook verwacht.
 */
type Toets = { label: string; insert: string; titel: string }

const TOETSEN: Toets[] = [
  { label: 'xⁿ', insert: '^(|)', titel: 'macht' },
  { label: '√', insert: 'sqrt(|)', titel: 'wortel' },
  { label: 'a/b', insert: '(|)/()', titel: 'breuk' },
  { label: 'π', insert: 'pi', titel: 'pi' },
]

export function MathKeyboard({
  onInsert,
  disabled,
}: {
  onInsert: (tekst: string) => void
  disabled?: boolean
}) {
  const [toonUitleg, setToonUitleg] = useState(false)

  return (
    <View>
      <View style={styles.rij}>
        {TOETSEN.map((toets) => (
          <Pressable
            key={toets.titel}
            onPress={() => onInsert(toets.insert)}
            disabled={disabled}
            accessibilityLabel={toets.titel}
            style={({ pressed }) => [styles.toets, pressed && styles.toetsIngedrukt]}
          >
            <Text style={styles.toetsTekst}>{toets.label}</Text>
          </Pressable>
        ))}
        <Pressable
          onPress={() => setToonUitleg((v) => !v)}
          accessibilityLabel="Uitleg over machten en breuken typen"
          style={({ pressed }) => [
            styles.toets,
            styles.toetsUitleg,
            pressed && styles.toetsIngedrukt,
          ]}
        >
          <Text style={styles.toetsTekst}>?</Text>
        </Pressable>
      </View>

      {toonUitleg && (
        <View style={styles.uitlegKaart}>
          <Text style={styles.uitlegTitel}>Zo typ je het</Text>
          <Text style={styles.uitlegRegel}>x^2 → x²</Text>
          <Text style={styles.uitlegRegel}>x^(2x-1) → machten met meer dan één teken</Text>
          <Text style={styles.uitlegRegel}>2/3 → een breuk</Text>
          <Text style={styles.uitlegRegel}>(2x)/(x+1) → een breuk met meer dan één teken</Text>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  rij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  toets: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  toetsUitleg: {
    marginLeft: 'auto',
  },
  toetsIngedrukt: {
    backgroundColor: Colors.accentLight,
    borderColor: Colors.accent,
  },
  toetsTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.text,
  },
  uitlegKaart: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    padding: 12,
    gap: 4,
  },
  uitlegTitel: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  uitlegRegel: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    color: Colors.text,
  },
})
