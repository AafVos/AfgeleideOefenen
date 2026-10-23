import { Tabs } from 'expo-router'

import { Colors, Fonts } from '@/constants/theme'

/**
 * Tabbalk voor wie ingelogd is: Oefenen en Voortgang (AFG-560). De
 * welkomstpagina (`/`) stuurt een leerling die op "Oefenen" drukt hierheen.
 */
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        // Geen tabBarIcon gezet: zonder eigen icoon valt react-navigation
        // terug op een driehoekje. `() => null` laat alleen het label zien.
        tabBarIcon: () => null,
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.surface, borderTopColor: Colors.border },
        tabBarLabelStyle: { fontFamily: Fonts.sansMedium, fontSize: 12 },
      }}
    >
      <Tabs.Screen name="oefenen" options={{ title: 'Oefenen' }} />
      <Tabs.Screen name="voortgang" options={{ title: 'Voortgang' }} />
    </Tabs>
  )
}
