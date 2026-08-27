import { loadFont as loadSans } from '@remotion/google-fonts/DMSans'
import { loadFont as loadSerif } from '@remotion/google-fonts/DMSerifDisplay'

const sans = loadSans()
const serif = loadSerif()

/** Zelfde palet als de app (globals.css). */
export const theme = {
  surface: '#ffffff',
  surface2: '#f0efe9',
  border: '#e4e2d9',
  text: '#1a1a18',
  textMuted: '#7a7870',
  accent: '#2d6a4f',
  accentLight: '#e8f5ee',
  accent2: '#c94f4a',
  accent2Light: '#fbeeed',
  fontSans: sans.fontFamily,
  fontSerif: serif.fontFamily,
}
