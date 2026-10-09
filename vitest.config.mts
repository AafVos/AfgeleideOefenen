import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    // Laat `@/...` in de tests hetzelfde oplossen als in de app (tsconfig
    // paths). Vite doet dit zelf; de plugin vite-tsconfig-paths is hiervoor
    // niet meer nodig.
    tsconfigPaths: true,
  },
  test: {
    // Alleen pure rekenregels: geen browser, geen database, geen Gemini.
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
