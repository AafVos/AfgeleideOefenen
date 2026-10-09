# Voice-over: Machten en wortels herschrijven

Ingesproken door ElevenLabs-stem **Pauline**. De tekst per scène staat (als
bron) in `scripts/genereer-voiceover-herschrijven.sh`; na een tekstwijziging:
script draaien (`SCENES=n` voor één fragment), daarna de beats bijstellen.

Dit script gebruikt het with-timestamps-endpoint: naast elk `scene-n.mp3` komt
een `scene-n.json` met per teken de starttijd. Met
`python3 scripts/beats.py public/voiceover-herschrijven/scene-4.json "Stap één"`
zie je op welk frame een woord valt. De beats staan bovenaan
`src/scenes-herschrijven.tsx` (`B2` t/m `B6`), de scèneduren in
`src/HerschrijvenVideo.tsx`.

Algemene uitleg bij het H6-topic *Machten en wortels herschrijven*. De
voorbeelden komen van de theoriekaarten in de app: `6/x³` (cluster Negatieve
machten) en `x · √x` (cluster Gemengde machten en wortels).

## Opbouw

| Scène | Inhoud |
| --- | --- |
| 1 · Intro | "Machten en wortels herschrijven", Aaf zwaait |
| 2 · Eerst herschrijven | Machtsregel-kaart; "dat kan pas als er echt x tot een macht staat"; dan `1/xⁿ = x⁻ⁿ`, `√x = x^(1/2)`, `ⁿ√(xᵐ) = x^(m/n)` één voor één |
| 3 · Het stappenplan | Stap 0 (alleen x in de noemer of onder de wortel → herschrijven), stap 1 t/m 3 |
| 4 · Een macht in de noemer | `f(x) = 6/x³` → `6x⁻³` → `−3 · 6x⁻³⁻¹ = −18x⁻⁴` → `−18/x⁴` |
| 5 · Een wortel | `f(x) = x · √x` → `x¹ · x^(1/2) = x^(3/2)` → `(3/2)x^(1/2)` → `1,5√x`; Aaf springt |
| 6 · Samengevat | Drie punten, de kettingregel als afbakening (`√(x² + 1)`), "Succes!" |

In scène 4 staan de exponent die naar voren komt en de `−3 − 1` in terracotta:
dáár gaat het mis bij leerlingen, de kleur doet het werk.
