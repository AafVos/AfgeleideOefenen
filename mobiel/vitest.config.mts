import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    tsconfigPaths: true,
  },
  test: {
    // Alleen pure logica: geen Expo-runtime, geen Supabase, geen telefoon.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
