/**
 * Minimal client voor de Google Gemini REST API.
 *
 * Gebruikt geen SDK zodat we geen grote dependency nodig hebben en de
 * endpoint-URL expliciet in view blijft.
 *
 * Docs: https://ai.google.dev/api/generate-content
 */

const DEFAULT_MODEL = 'gemini-2.5-flash'
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models'

export type GeminiJsonResponse<T> =
  | { ok: true; data: T; raw: string }
  | { ok: false; error: string; raw?: string }

/** Het responseSchema dat Gemini teruggeeft, in OpenAPI-stijl. */
export type GeminiSchema = {
  type: 'OBJECT' | 'ARRAY' | 'STRING' | 'BOOLEAN' | 'NUMBER' | 'INTEGER'
  properties?: Record<string, GeminiSchema>
  items?: GeminiSchema
  required?: string[]
  description?: string
}

const HEX_ESCAPE = /^[0-9a-fA-F]{4}$/

/**
 * Verdubbel losse LaTeX-backslashes zodat `JSON.parse` er niet over struikelt.
 *
 * Gemini zet LaTeX in een JSON-tekst soms met een enkele backslash neer
 * (bijv. `\sin(4x)` in plaats van `\\sin(4x)`). `\s` is geen geldige
 * JSON-escape, dus `JSON.parse` gooit dan een fout. Erger: `\frac` is
 * toevallig wél een geldige escape (formfeed) en glipt er stilletjes doorheen.
 *
 * Alleen een echte JSON-escape blijft staan: `\"`, `\\`, `\/` en `\uXXXX`.
 * Elke andere backslash is vrijwel zeker een LaTeX-commando (`\sin`, `\frac`,
 * `\neq`, `\left`, `\{`, ...) en wordt verdubbeld. De functie is idempotent:
 * een al verdubbelde `\\sin` blijft onaangeroerd.
 */
export function repairLatexBackslashes(raw: string): string {
  let result = ''
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i]
    if (ch !== '\\') {
      result += ch
      continue
    }

    const next = raw[i + 1]
    if (next === undefined) {
      result += ch
      continue
    }

    // Echte JSON-escapes ongewijzigd laten.
    if (next === '\\' || next === '"' || next === '/') {
      result += ch + next
      i++
      continue
    }
    if (next === 'u' && HEX_ESCAPE.test(raw.slice(i + 2, i + 6))) {
      result += raw.slice(i, i + 6)
      i += 5
      continue
    }

    // Al het andere is LaTeX: verdubbelen.
    result += '\\\\'
  }
  return result
}

/**
 * Roep Gemini aan en forceer een JSON-response.
 * T is de verwachte shape van de JSON.
 */
export async function generateJson<T>(
  prompt: string,
  options: {
    model?: string
    temperature?: number
    signal?: AbortSignal
    schema?: GeminiSchema
  } = {},
): Promise<GeminiJsonResponse<T>> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { ok: false, error: 'GEMINI_API_KEY is niet geconfigureerd.' }
  }

  const model = options.model ?? DEFAULT_MODEL
  const url = `${BASE_URL}/${model}:generateContent?key=${apiKey}`

  let res: Response
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      signal: options.signal,
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.4,
          responseMimeType: 'application/json',
          ...(options.schema ? { responseSchema: options.schema } : {}),
        },
      }),
    })
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Netwerkfout naar Gemini.',
    }
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    return {
      ok: false,
      error: `Gemini ${res.status}: ${text || res.statusText}`.slice(0, 400),
    }
  }

  type GeminiResp = {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> }
      finishReason?: string
    }>
    promptFeedback?: { blockReason?: string }
  }
  const json = (await res.json()) as GeminiResp

  if (json.promptFeedback?.blockReason) {
    return {
      ok: false,
      error: `Gemini blokkeerde de prompt (${json.promptFeedback.blockReason}).`,
    }
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) {
    return { ok: false, error: 'Lege response van Gemini.' }
  }

  // Herstel losse LaTeX-backslashes vóór het parsen. Idempotent, dus een al
  // nette JSON (met `\\sin` enzovoort) blijft exact gelijk.
  const repaired = repairLatexBackslashes(text)
  try {
    const data = JSON.parse(repaired) as T
    return { ok: true, data, raw: text }
  } catch {
    return { ok: false, error: 'Gemini gaf geen geldige JSON terug.', raw: text }
  }
}
