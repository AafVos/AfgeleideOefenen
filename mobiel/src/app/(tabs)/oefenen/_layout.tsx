import { Stack } from 'expo-router'

import { Colors } from '@/constants/theme'

/**
 * Eigen stapel binnen de tab "Oefenen": hoofdstuk kiezen → soort som kiezen →
 * opgave maken. De tabbalk blijft daarbij in beeld.
 */
export default function OefenenLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.bg },
      }}
    />
  )
}
