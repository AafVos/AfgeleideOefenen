# Voice-over: Het stappenplan bij de quotiëntregel

Ingesproken door ElevenLabs-stem Pauline. De tekst per scène staat (als bron) in
`scripts/genereer-voiceover-quotient.sh`; na een tekstwijziging: script draaien
(`SCENES=n` voor één fragment), fragmentduren checken en de scèneduren in
`src/QuotientVideo.tsx` bijstellen.

## Opbouw

| Scène | Duur (frames) | Inhoud |
| --- | --- | --- |
| 1 · Intro | 200 | "De quotiëntregel — het stappenplan", Aaf zwaait |
| 2 · Het stappenplan | 830 | De regelkaart, daaronder stap 0 t/m 3 onder elkaar |
| 3 · Stap 0 | 300 | Het voorbeeld H2 · #36 (nummer alleen in beeld, niet ingesproken); cirkels om teller en noemer → "Quotiëntregel!" |
| 4 · De uitwerking | 1740 | Stap 1, 2 en 3 op #36, tot het antwoord −5/(3x − 1)² |

Het voorbeeld is `f(x) = (2x + 1)/(3x − 1)` uit het cluster *Eenvoudige breuk*.
De noemer blijft `(3x − 1)²` staan — die werken we bewust niet uit.

## Zelf inspreken

Zet `TEMPO` in `src/scenes-quotient.tsx` hoger (bijv. 1.35) voor meer
ademruimte; scèneduren en presenter-cues schalen mee. Klik daarna met de
presenter door de beats:

```bash
npm run presenter    # dan in de browser: ?video=quotient
```
