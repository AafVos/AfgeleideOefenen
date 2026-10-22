// Kleuren en lettertypen, overgenomen uit src/app/globals.css van de site
// (de hoofdmap van de repo), zodat de app er als dezelfde familie uitziet.
// De site heeft geen donkere modus; deze app ook niet.

export const Colors = {
  bg: '#f7f6f3',
  surface: '#ffffff',
  surface2: '#f0efe9',
  border: '#e4e2d9',
  text: '#1a1a18',
  textMuted: '#716c68',
  accent: '#2d6a4f',
  accentLight: '#e8f5ee',
  accent2: '#be444a',
  accent2Light: '#fbeeed',
} as const

export const Fonts = {
  sans: 'DMSans_400Regular',
  sansMedium: 'DMSans_500Medium',
  sansBold: 'DMSans_700Bold',
  serif: 'DMSerifDisplay_400Regular',
} as const
