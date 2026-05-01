/**
 * Prompt-templates voor de AI-laag.
 */

export function buildCheckAnswerPrompt(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  rootCauses: Array<{ slug: string; description: string }>
  availability: Record<1 | 2 | 3, number>
  stepsAlreadyExist: boolean
}): string {
  const rootCauseLines = input.rootCauses
    .map((r) => `- ${r.slug}: ${r.description}`)
    .join('\n')

  return `Je bent een wiskundedocent voor VWO-leerlingen die leren differentiëren.
De site gebruikt de notatie van Getal & Ruimte.
Antwoord ALTIJD in het Nederlands en ALLEEN met geldige JSON (geen Markdown, geen uitleg erbuiten).

Context:
- Topic: ${input.topicTitle}
- Cluster: ${input.clusterTitle}
- Vraag: ${input.questionBody}
- Correct antwoord: ${input.correctAnswer}
- Antwoord van de leerling: ${input.studentAnswer}

Bekende root causes voor dit topic (kies bij voorkeur een van deze slugs):
${rootCauseLines || '- (geen opgegeven)'}

Hoeveelheid al bestaande vragen in dit cluster per moeilijkheid:
- difficulty 1 (basis): ${input.availability[1]}
- difficulty 2 (standaard): ${input.availability[2]}
- difficulty 3 (uitdaging): ${input.availability[3]}

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
   Gebruik gewone tekst-notatie (x^2, *, ·) — GEEN LaTeX ($...$). Vriendelijk, geen aanhef.
${input.stepsAlreadyExist
  ? '3. Er is al een stappenplan voor deze vraag — laat solution_steps LEEG ([]).'
  : `3. Schrijf een STAPPENPLAN voor deze specifieke vraag: 3 à 4 stappen in compacte wiskundige notatie. Gebruik dit exacte formaat:
   - Stap 1: benoem de deelfuncties, bijv. "f(x) = g(x) + h(x) met g(x) = x^4 en h(x) = -5x"
   - Stap 2: leid elke deelfunctie apart af, bijv. "g'(x) = 4x^3 en h'(x) = -5"
   - Stap 3: pas de bijbehorende regel toe en combineer, bijv. "Somregel: f'(x) = g'(x) + h'(x) = 4x^3 + (-5) = 4x^3 - 5"
   - (optioneel stap 4 als vereenvoudigen nodig is)
   Gebruik wiskundige tekst-notatie (x^2, f'(x), g(x)) — GEEN LaTeX-dollartekens. Elke stap is 1 compacte zin.`}
4. Beoordeel of extra oefenvragen nodig zijn (needs_new_questions=true alleen als minder dan 2 vragen per difficulty).
5. Stel max 3 nieuwe vragen voor over de missende difficulties.

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "root_cause": "string (snake_case slug, leeg als is_mathematically_correct=true)",
  "error_explanation": "string (leeg als is_mathematically_correct=true, anders max 3 zinnen NL)",
  "solution_steps": [
    "string (stap 1, concreet met getallen van DEZE vraag)",
    "string (stap 2)",
    "..."
  ],
  "needs_new_questions": boolean,
  "generated_questions": [
    {
      "body": "string",
      "latex_body": "string of null",
      "answer": "string",
      "latex_answer": "string of null",
      "difficulty": 1 | 2 | 3
    }
  ]
}`
}
