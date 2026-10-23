/**
 * Nederlandse foutmelding bij een geweigerde camera- of fotobibliotheek-
 * toestemming. De uitleg waarom de app erom vraagt staat al in de systeem-
 * vraag zelf (zie `app.json`, plugin `expo-image-picker`); dit is wat de
 * leerling ziet als hij nee heeft gezegd of hem later weer intikt.
 */
export function toestemmingsmelding(
  bron: 'camera' | 'fotos',
  reactie: { granted: boolean; canAskAgain: boolean },
): string | null {
  if (reactie.granted) return null

  const wat = bron === 'camera' ? 'je camera' : 'je foto\'s'
  if (reactie.canAskAgain) {
    return `Je hebt nog geen toestemming gegeven voor ${wat}. Probeer het nog eens.`
  }
  return `Je hebt geen toestemming gegeven voor ${wat}. Zet dit aan bij de instellingen van je telefoon om een foto toe te voegen.`
}
