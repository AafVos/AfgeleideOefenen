import { getRequestConfig } from 'next-intl/server'

import { SITE_CONFIG } from '@/config/site'

import { routing } from './routing'

type Msg = Record<string, unknown>

/**
 * `__BRAND__` en `__BRAND_SUFFIX__` zijn samen de naam in de kop: het eerste
 * deel in gewone kleur, het tweede in de accentkleur. Op afgeleideoefenen.nl
 * is dat "AfgeleideOefenen" + ".nl", op wiskundemetaaf.nl "Wiskunde met" +
 * "Aaf".
 */
function substituteSiteVars(
  value: unknown,
  brand: string,
  brandSuffix: string,
  domain: string,
): unknown {
  if (typeof value === 'string') {
    return value
      .replaceAll('__BRAND_SUFFIX__', brandSuffix)
      .replaceAll('__BRAND__', brand)
      .replaceAll('__DOMAIN__', domain)
  }
  if (Array.isArray(value)) {
    return value.map((v) => substituteSiteVars(v, brand, brandSuffix, domain))
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = substituteSiteVars(v, brand, brandSuffix, domain)
    }
    return out
  }
  return value
}

export default getRequestConfig(async () => {
  // Er is maar één taal: Nederlands.
  const locale = routing.defaultLocale

  const base = (await import('../../messages/nl.json')).default as Msg

  return {
    locale,
    messages: substituteSiteVars(
      base,
      SITE_CONFIG.brandVoor,
      SITE_CONFIG.brandAccent,
      SITE_CONFIG.domain,
    ) as Msg,
  }
})
