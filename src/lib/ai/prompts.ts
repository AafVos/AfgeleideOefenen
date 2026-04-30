/**
 * Prompt-templates voor de AI-laag. Vastgepind volgens de spec in idea.md §6.2.
 */

export function buildCheckAnswerPrompt(input: {
  questionBody: string
  correctAnswer: string
  studentAnswer: string
  topicTitle: string
  clusterTitle: string
  rootCauses: Array<{ slug: string; description: string }>
  availability: Record<1 | 2 | 3, number>
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

Taak:
0. Controleer EERST of het antwoord van de leerling wiskundig equivalent is aan het correcte antwoord, maar in een andere notatie (bijv. "3*(2x+1)^2*2" is hetzelfde als "6(2x+1)^2"). Als dat zo is: stel is_mathematically_correct=true in en stop. Vul dan alleen is_mathematically_correct en error_explanation in (leg in 1 zin uit dat het goed is maar vereenvoudigd kan worden).
1. Als het antwoord echt fout is: bepaal de fundamentele fout (root cause). Gebruik bij voorkeur een bestaande slug. Als geen enkele past, verzin een korte snake_case slug die de fout beknopt beschrijft.
2. Schrijf een uitleg in het Nederlands (max 3 zinnen) die CONCREET met de getallen en termen uit DEZE vraag laat zien wat er misging. Houd dit stramien aan:
   a. Benoem de specifieke term of stap uit de oorspronkelijke formule (bijv. "de term 7x^3").
   b. Laat de foute berekening zien die de leerling vermoedelijk deed, met getallen ("jij schreef ... want ...").
   c. Laat de juiste berekening zien met getallen ("maar ... · ... = ..., dus het hoort ... te zijn").
   Gebruik gewone tekst-notatie (x^2, *, ·, /) — GEEN LaTeX-dollartekens ($...$). Wees vriendelijk en to-the-point, geen aanhef of naam.
3. Beoordeel of er voor deze root cause extra oefenvragen nodig zijn. Stel alleen needs_new_questions=true in als er voor ten minste één van de drie difficulties minder dan 2 vragen beschikbaar zijn.
4. Als je vragen voorstelt: lever maximaal 3 nieuwe vragen, verdeeld over de missende difficulties. Elk moet een uniek body, een exact correct answer en een numerieke difficulty (1, 2 of 3) hebben. Gebruik latex_body en latex_answer als de uitdrukking beter leest met LaTeX.

Voorbeeld van een GOEDE error_explanation bij vraag "Differentieer g(x) = 7x^3 + 2x", fout antwoord "7x^2":
"Bij de term 7x^3 heb je alleen de exponent verlaagd naar 2. Maar volgens de machtsregel moet je ook vermenigvuldigen: 7 · 3 = 21. De juiste afgeleide van 7x^3 is dus 21x^2, en vergeet daarna niet de +2x → +2 op te tellen."

Voorbeeld van een SLECHTE error_explanation (te vaag, geen getallen):
"Je hebt de exponent goed verlaagd, maar let goed op hoe je de nieuwe coëfficiënt berekent."

Voorbeeld is_mathematically_correct=true: vraag f(x)=(2x+1)^3, correct antwoord "6(2x+1)^2", student schreef "3*(2x+1)^2*2":
is_mathematically_correct=true, error_explanation="Klopt! Jouw antwoord 3·(2x+1)²·2 is wiskundig correct, maar schrijf de factoren samen als 6(2x+1)²."

Antwoord UITSLUITEND met dit JSON-schema:
{
  "is_mathematically_correct": boolean,
  "root_cause": "string (snake_case slug, alleen bij is_mathematically_correct=false)",
  "error_explanation": "string (NL, max 3 zinnen)",
  "needs_new_questions": boolean,
  "generated_questions": [
    {
      "body": "string (leesbare wiskundige vraag)",
      "latex_body": "string of null (optioneel)",
      "answer": "string (exact antwoord)",
      "latex_answer": "string of null (optioneel)",
      "difficulty": 1 | 2 | 3
    }
  ]
}`
}
