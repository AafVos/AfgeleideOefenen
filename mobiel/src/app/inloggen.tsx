import { useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import * as Linking from 'expo-linking'

import { Poppetje } from '@/components/poppetje'
import { Colors, Fonts } from '@/constants/theme'
import { SITE_URL } from '@/constants/site'
import { inlogFoutmelding, inlogFoutSleutel, type InlogFoutSleutel } from '@/lib/auth/inlog-fout'
import { supabase } from '@/lib/supabase'
import { raakvlak } from '@/lib/ui/raakvlak'

export default function InlogScherm() {
  const [email, setEmail] = useState('')
  const [wachtwoord, setWachtwoord] = useState('')
  const [toonWachtwoord, setToonWachtwoord] = useState(false)
  const [bezig, setBezig] = useState(false)
  const [foutKey, setFoutKey] = useState<InlogFoutSleutel | null>(null)

  async function inloggen() {
    if (bezig) return
    if (!email.trim() || !wachtwoord) {
      setFoutKey('errorMissingFields')
      return
    }

    setBezig(true)
    setFoutKey(null)
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: wachtwoord,
    })
    setBezig(false)

    if (error) {
      // Het wachtwoord gaat nooit terug het veld in, het e-mailadres blijft
      // staan (AFG-553).
      setWachtwoord('')
      setFoutKey(inlogFoutSleutel(error.message))
      return
    }

    router.replace('/')
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Pressable onPress={() => router.back()} style={styles.terug} hitSlop={8}>
        <Text style={styles.terugTekst}>← Terug</Text>
      </Pressable>

      <View style={styles.midden}>
        <Poppetje size={64} />
        <Text style={styles.titel}>Inloggen</Text>
        <Text style={styles.ondertitel}>Log in met je account van afgeleideoefenen.nl</Text>

        <View style={styles.veld}>
          <Text style={styles.label}>E-mailadres</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            style={styles.invoer}
          />
        </View>

        <View style={styles.veld}>
          <Text style={styles.label}>Wachtwoord</Text>
          <View style={styles.wachtwoordRij}>
            <TextInput
              value={wachtwoord}
              onChangeText={setWachtwoord}
              secureTextEntry={!toonWachtwoord}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="current-password"
              textContentType="password"
              style={[styles.invoer, styles.wachtwoordInvoer]}
            />
            <Pressable
              onPress={() => setToonWachtwoord((v) => !v)}
              style={styles.toggle}
              hitSlop={8}
            >
              <Text style={styles.toggleTekst}>{toonWachtwoord ? 'Verberg' : 'Toon'}</Text>
            </Pressable>
          </View>
        </View>

        {foutKey && (
          <View style={styles.foutBanner} accessibilityRole="alert">
            <Text style={styles.foutTekst}>{inlogFoutmelding[foutKey]}</Text>
          </View>
        )}

        <Pressable
          onPress={inloggen}
          disabled={bezig}
          style={({ pressed }) => [styles.knop, (pressed || bezig) && styles.knopIngedrukt]}
        >
          {bezig ? (
            <ActivityIndicator color={Colors.surface} />
          ) : (
            <Text style={styles.knopTekst}>Inloggen</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => Linking.openURL(`${SITE_URL}/nl/wachtwoord-vergeten`)}
          style={raakvlak()}
          hitSlop={8}
        >
          <Text style={styles.link}>Wachtwoord vergeten?</Text>
        </Pressable>

        <View style={styles.registrerenRij}>
          <Text style={styles.ondertitel}>Nog geen account? </Text>
          <Pressable
            onPress={() => Linking.openURL(`${SITE_URL}/nl/registreren`)}
            style={raakvlak()}
            hitSlop={8}
          >
            <Text style={styles.link}>Registreer op de site</Text>
          </Pressable>
        </View>
      </View>
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
  midden: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 24,
  },
  titel: {
    fontFamily: Fonts.serif,
    fontSize: 28,
    color: Colors.text,
    textAlign: 'center',
  },
  ondertitel: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: 'center',
  },
  veld: {
    width: '100%',
    marginTop: 8,
  },
  label: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.text,
    marginBottom: 6,
  },
  invoer: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    fontFamily: Fonts.sans,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  wachtwoordRij: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  wachtwoordInvoer: {
    flex: 1,
  },
  toggle: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
  },
  toggleTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    color: Colors.textMuted,
  },
  foutBanner: {
    width: '100%',
    marginTop: 4,
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
  knop: {
    width: '100%',
    minHeight: 44,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  knopIngedrukt: {
    opacity: 0.85,
  },
  knopTekst: {
    fontFamily: Fonts.sansMedium,
    fontSize: 16,
    color: Colors.surface,
  },
  link: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    color: Colors.accent,
  },
  registrerenRij: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
})
