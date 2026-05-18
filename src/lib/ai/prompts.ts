/**
 * Prompt-templates voor de AI-laag.
 */

import { SITE_CONFIG } from '@/config/site'

export function buildCheckAnswerPromptNew(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  stepsAlreadyExist: boolean
}): string {
  return `Je bent een wiskundedocent voor VWO-leerlingen die leren ${SITE_CONFIG.subjectVerbNl}.
De site gebruikt de notatie van Getal & Ruimte.
Antwoord ALTIJD in het Nederlands en ALLEEN met geldige JSON (geen Markdown, geen uitleg erbuiten).

Context:
- Topic: ${input.topicTitle}
- Cluster: ${input.clusterTitle}
- Vraag: ${SITE_CONFIG.taskPromptNl} ${input.questionBody}
- Correct antwoord: ${input.correctAnswer}
- Antwoord van de leerling: ${input.studentAnswer}

=== STAP 1: IS HET WISKUNDIG EQUIVALENT? ===
Bereken of het antwoord van de leerling wiskundig EXACT hetzelfde resultaat geeft als het correcte antwoord.
Vereenvoudig beide uitdrukkingen volledig en vergelijk.

Voorbeelden van EQUIVALENTE antwoorden (is_mathematically_correct = true):
- Student: "3*(2x+1)^2*2"  →  Correct: "6(2x+1)^2"  →  3·2·(2x+1)^2 = 6(2x+1)^2  ✓ EQUIVALENT
- Student: "2*(3x+2)*3"    →  Correct: "6(3x+2)"     →  2·3·(3x+2) = 6(3x+2)       ✓ EQUIVALENT
- Student: "4*x^3"         →  Correct: "4x^3"         →  identiek                    ✓ EQUIVALENT

Voorbeelden van NIET-equivalente antwoorden (is_mathematically_correct = false):
- Student: "3*(2x+1)*2"    →  Correct: "6(2x+1)^2"  →  6(2x+1) ≠ 6(2x+1)^2        ✗ FOUT (exponent ontbreekt)
- Student: "7x^2"          →  Correct: "21x^2"       →  7 ≠ 21                       ✗ FOUT

Als is_mathematically_correct = true: stel alleen is_mathematically_correct=true in, laat de andere velden LEEG ("" / []), en stop.

=== STAP 2 (alleen als het echt fout is) ===
1. Bepaal de categorie van de fout in max 4 woorden Nederlands (bijv. "kettingregel vergeten", "exponent fout", "constante factor weggelaten").
2. Schrijf een uitleg in max 3 zinnen die CONCREET laat zien wat er misging:
   a. Benoem de specifieke stap die fout ging.
   b. Laat de foute berekening zien met de getallen van deze vraag.
   c. Laat de juiste berekening zien.
   Gebruik Nederlandse tekst met wiskundige uitdrukkingen tussen $...$ (inline LaTeX). Vriendelijk, geen aanhef.
${input.stepsAlreadyExist
  ? '3. Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).'
  : `3. Schrijf een STAPPENPLAN voor deze specifieke vraag: 3 à 4 stappen. Gebruik dit exacte formaat:
   - Elke stap is 1 zin: Nederlandse instructie gevolgd door de wiskunde tussen $...$ (inline LaTeX).
   - Voorbeeld stap: "Identificeer de buitenste functie $g(u) = u^{1/2}$ en binnenste $u(x) = 2x+1$."
   - Voorbeeld stap: "Differentieer: $g'(u) = \\frac{1}{2}u^{-1/2}$ en $u'(x) = 2$."
   Gebruik ALTIJD $...$ rond wiskunde, nooit kale tekst-notatie zoals x^2 of f'(x) buiten dollartekens.`}

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "category": "string (max 4 woorden NL, leeg als is_mathematically_correct=true)",
  "error_explanation": "string (leeg als is_mathematically_correct=true, anders max 3 zinnen NL)",
  "solution_steps": [
    "string (stap 1, concreet met getallen van DEZE vraag)",
    "string (stap 2)",
    "..."
  ]
}`
}

export function buildCheckAnswerPrompt(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  rootCauses: Array<{ slug: string; description: string }>
  stepsAlreadyExist: boolean
}): string {
  const rootCauseLines = input.rootCauses
    .map((r) => `- ${r.slug}: ${r.description}`)
    .join('\n')

  return `Je bent een wiskundedocent voor VWO-leerlingen die leren ${SITE_CONFIG.subjectVerbNl}.
De site gebruikt de notatie van Getal & Ruimte.
Antwoord ALTIJD in het Nederlands en ALLEEN met geldige JSON (geen Markdown, geen uitleg erbuiten).

Context:
- Topic: ${input.topicTitle}
- Cluster: ${input.clusterTitle}
- Vraag: ${SITE_CONFIG.taskPromptNl} ${input.questionBody}
- Correct antwoord: ${input.correctAnswer}
- Antwoord van de leerling: ${input.studentAnswer}

Bekende root causes voor dit topic (kies bij voorkeur een van deze slugs):
${rootCauseLines || '- (geen opgegeven)'}

=== STAP 1: IS HET WISKUNDIG EQUIVALENT? ===
Bereken of het antwoord van de leerling wiskundig EXACT hetzelfde resultaat geeft als het correcte antwoord.
Vereenvoudig beide uitdrukkingen volledig en vergelijk.

Voorbeelden van EQUIVALENTE antwoorden (is_mathematically_correct = true):
- Student: "3*(2x+1)^2*2"  →  Correct: "6(2x+1)^2"  →  3·2·(2x+1)^2 = 6(2x+1)^2  ✓ EQUIVALENT
- Student: "2*(3x+2)*3"    →  Correct: "6(3x+2)"     →  2·3·(3x+2) = 6(3x+2)       ✓ EQUIVALENT
- Student: "4*x^3"         →  Correct: "4x^3"         →  identiek                    ✓ EQUIVALENT

Voorbeelden van NIET-equivalente antwoorden (is_mathematically_correct = false):
- Student: "3*(2x+1)*2"    →  Correct: "6(2x+1)^2"  →  6(2x+1) ≠ 6(2x+1)^2        ✗ FOUT (exponent ontbreekt)
- Student: "7x^2"          →  Correct: "21x^2"       →  7 ≠ 21                       ✗ FOUT

Als is_mathematically_correct = true: stel alleen is_mathematically_correct=true in, laat error_explanation LEEG (""), en stop.

=== STAP 2 (alleen als het echt fout is) ===
1. Bepaal de fundamentele fout (root cause). Gebruik bij voorkeur een bestaande slug.
2. Schrijf een uitleg in max 3 zinnen die CONCREET laat zien wat er misging:
   a. Benoem de specifieke stap die fout ging.
   b. Laat de foute berekening zien met de getallen van deze vraag.
   c. Laat de juiste berekening zien.
   Gebruik Nederlandse tekst met wiskundige uitdrukkingen tussen $...$ (inline LaTeX). Vriendelijk, geen aanhef.
   Voorbeeld: "Je hebt $f'(x) = 2x$ berekend, maar de kettingregel vereist $f'(x) = 2(3x+2)^1 \cdot 3$."
${input.stepsAlreadyExist
  ? '3. Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).'
  : `3. Schrijf een STAPPENPLAN voor deze specifieke vraag: 3 à 4 stappen. Gebruik dit exacte formaat:
   - Elke stap is 1 zin: Nederlandse instructie gevolgd door de wiskunde tussen $...$ (inline LaTeX).
   - Voorbeeld stap: "Identificeer de buitenste functie $g(u) = u^{1/2}$ en binnenste $u(x) = 2x+1$."
   - Voorbeeld stap: "Differentieer: $g'(u) = \\frac{1}{2}u^{-1/2}$ en $u'(x) = 2$."
   - Voorbeeld stap: "Pas de kettingregel toe: $f'(x) = g'(u(x)) \\cdot u'(x) = \\frac{1}{\\sqrt{2x+1}}$."
   Gebruik ALTIJD $...$ rond wiskunde, nooit kale tekst-notatie zoals x^2 of f'(x) buiten dollartekens.`}

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "root_cause": "string (snake_case slug, leeg als is_mathematically_correct=true)",
  "error_explanation": "string (leeg als is_mathematically_correct=true, anders max 3 zinnen NL)",
  "solution_steps": [
    "string (stap 1, concreet met getallen van DEZE vraag)",
    "string (stap 2)",
    "..."
  ]
}`
}
