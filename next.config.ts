import path from 'node:path'

import createNextIntlPlugin from 'next-intl/plugin'
import type { NextConfig } from 'next'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

const nextConfig: NextConfig = {
  // Fix: multiple package-lock.json files on this machine confuse Next.js
  // file tracing. Pin the root explicitly so Vercel builds work correctly.
  outputFileTracingRoot: path.resolve(__dirname),
}

export default withNextIntl(nextConfig)
