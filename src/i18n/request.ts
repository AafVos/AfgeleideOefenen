import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'

import { SITE, brandForLocale, domainForLocale } from '@/config/site'

import { routing } from './routing'

type Msg = Record<string, unknown>

function deepMerge(base: Msg, override: Msg): Msg {
  const out: Msg = { ...base }
  for (const [k, v] of Object.entries(override)) {
    const existing = out[k]
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      existing &&
      typeof existing === 'object' &&
      !Array.isArray(existing)
    ) {
      out[k] = deepMerge(existing as Msg, v as Msg)
    } else {
      out[k] = v
    }
  }
  return out
}

function substituteSiteVars(value: unknown, brand: string, domain: string): unknown {
  if (typeof value === 'string') {
    return value.replaceAll('__BRAND__', brand).replaceAll('__DOMAIN__', domain)
  }
  if (Array.isArray(value)) {
    return value.map((v) => substituteSiteVars(v, brand, domain))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substituteSiteVars(v, brand, domain)
    }
    return out
  }
  return value
}

async function loadOverrides(locale: string): Promise<Msg> {
  // Only the integralen site has overrides; afgeleiden uses the base as-is.
  if (SITE !== 'integralen') return {}
  try {
    const mod = await import(`../../messages/overrides/integralen.${locale}.json`)
    return mod.default as Msg
  } catch {
    return {}
  }
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  const base = (await import(`../../messages/${locale}.json`)).default as Msg
  const overrides = await loadOverrides(locale)
  const merged = deepMerge(base, overrides)

  return {
    locale,
    messages: substituteSiteVars(
      merged,
      brandForLocale(locale),
      domainForLocale(locale),
    ) as Msg,
  }
})
