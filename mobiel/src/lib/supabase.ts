import 'react-native-url-polyfill/auto'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { createClient } from '@supabase/supabase-js'

// Dezelfde Supabase als de site (zie EXPO_PUBLIC_*-waarden in .env.example):
// geen eigen backend, geen eigen accounts.
//
// AsyncStorage is de opslag die Supabase zelf aanraadt voor Expo/React
// Native, ook op web (daar valt het terug op localStorage). `expo-secure-
// store` is hier bewust niet gebruikt: die heeft een limiet van 2048 bytes
// per waarde en een sessie van Supabase past daar niet altijd in.
//
// `npx expo start --web` rendert elke pagina ook één keer op de server
// (Node), waar `window`/`localStorage` niet bestaan. AsyncStorage's
// web-implementatie raakt die aan zodra je hem aanroept, niet pas bij het
// inladen — zonder deze wrapper stopt de ontwikkelserver meteen met
// `ReferenceError: window is not defined`.
const serverVeiligeOpslag = {
  getItem: (key: string) =>
    typeof window === 'undefined' ? Promise.resolve(null) : AsyncStorage.getItem(key),
  setItem: (key: string, value: string) =>
    typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.setItem(key, value),
  removeItem: (key: string) =>
    typeof window === 'undefined' ? Promise.resolve() : AsyncStorage.removeItem(key),
}

export const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: serverVeiligeOpslag,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  },
)
