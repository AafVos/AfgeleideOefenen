import { StyleSheet, Text, View } from 'react-native'

import { Math } from '@/components/math'
import { Fonts } from '@/constants/theme'
import { tokenizeRichMath } from '@/lib/practice/rich-math'

/**
 * Tekst met optionele `$...$`/`$$...$$` stukken — zie `tokenizeRichMath`.
 *
 * React Native kent geen "inline" tekstvloei zoals HTML (`<span>` tussen
 * woorden): een `View` zet alles onder elkaar. Een rij met `flexWrap: 'wrap'`
 * komt er het dichtst bij — tekststukjes en kleine inline-formules lopen zo
 * naast elkaar door, en breken pas naar een nieuwe regel als de rij vol is.
 * Een displayformule (`$$...$$`) krijgt `flexBasis: '100%'`, zodat die altijd
 * op haar eigen regel begint, net als op de site.
 */
export function RichMath({
  source,
  textStyle,
}: {
  source: string
  textStyle?: object
}) {
  const tokens = tokenizeRichMath(source)
  return (
    <View style={styles.rij}>
      {tokens.map((t, idx) =>
        t.type === 'text' ? (
          t.value.trim() ? (
            <Text key={idx} style={[styles.tekst, textStyle]}>
              {t.value}
            </Text>
          ) : null
        ) : (
          <View key={idx} style={t.display ? styles.displayFormule : styles.inlineFormule}>
            <Math tex={t.value} displayMode={t.display} />
          </View>
        ),
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  rij: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tekst: {
    fontFamily: Fonts.sans,
    fontSize: 18,
  },
  inlineFormule: {
    marginHorizontal: 2,
  },
  displayFormule: {
    flexBasis: '100%',
    marginVertical: 4,
  },
})
