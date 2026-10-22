/**
 * CORS voor `/api/app/*`: de routes die de mobiele app (`mobiel/`) gebruikt.
 *
 * Deze routes zijn de enige in de site die van buiten de eigen browser
 * aangeroepen worden (vanaf een losse Expo-app, en lokaal vanuit
 * `expo start --web` op een andere poort). Ze gebruiken geen cookies — alle
 * toegang loopt via een bearer-token dat de aanroeper zelf meestuurt — dus
 * een brede `Access-Control-Allow-Origin` geeft geen CSRF-risico: een
 * andere site kan een leerling nooit stilletjes zijn eigen token laten
 * meesturen.
 */
export const APP_CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

export function appCorsJson(body: unknown, init?: { status?: number }): Response {
  return Response.json(body, {
    status: init?.status ?? 200,
    headers: APP_CORS_HEADERS,
  })
}

export function appCorsPreflight(): Response {
  return new Response(null, { status: 204, headers: APP_CORS_HEADERS })
}
