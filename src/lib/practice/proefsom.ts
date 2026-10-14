import { answersMatch } from './engine'

export type Proefsom = 'easy' | 'medium' | 'hard'

/**
 * Schrijfwijzen die de proefsom op de startpagina goedkeurt.
 * Dezelfde vergelijking als het oefenen, zodat een macht van het
 * toetsenbord (`^(x)`) en een voorvoegsel (`y =`) ook goed zijn.
 */
const GEACCEPTEERD: Record<Proefsom, readonly [string, ...string[]]> = {
  easy: ['6x+5', '5+6x'],
  medium: ['3cos(3x)', '3cos3x'],
  hard: [
    '2xe^x+x^2e^x',
    'x^2e^x+2xe^x',
    '(x^2+2x)e^x',
    '(2x+x^2)e^x',
    'x(x+2)e^x',
    '(x+2)xe^x',
  ],
}

export function proefsomKlopt(soort: Proefsom, antwoord: string): boolean {
  const [eerste, ...rest] = GEACCEPTEERD[soort]
  return answersMatch(antwoord, eerste, [...rest])
}
