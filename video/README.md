# Uitlegvideo's met Aaf

> Nieuwe video maken? Lees eerst [GUIDELINES.md](GUIDELINES.md) — daar staat
> waar elke video aan moet voldoen (stijl, didactiek, voice-over, timing).

Remotion-project voor uitlegvideo's in de stijl van de app: witte achtergrond,
Aaf rechtsonder (dezelfde tekening als in `src/components/welcome-tour.tsx`),
DM Sans/DM Serif en het kleurenpalet uit `globals.css`.

## Commando's (vanuit deze map)

| Commando | Wat het doet |
| --- | --- |
| `npm run studio` | Opent Remotion Studio in de browser: video afspelen, per frame doorspoelen, live aanpassen. |
| `npm run render` | Rendert "Som-productmethode" naar `out/som-product.mp4`. |
| `npm run render:regels` | Rendert "Somregel of productregel?" naar `out/somregel-of-productregel.mp4`. |
| `npm run render:som29` | Rendert "Uitleg bij som 29" naar `out/som-29.mp4`. |
| `npm run render:som30` | Rendert "Uitleg bij som 30" naar `out/som-30.mp4`. |
| `npm run still -- --frame=200 out/still.png` | Rendert één frame als afbeelding. |
| `npm run presenter` | Opent de presenter: klik zelf per animatiestap door de video (voor eigen voice-over inspreken). Kies de video met `?video=som30` in de URL; zie `VOICEOVER-som29.md` / `VOICEOVER-som30.md`. |

## Structuur

- `src/Aaf.tsx` — Aaf met poses: `idle`, `wave`, `point`, `nod`, `jump`, `think`.
- `src/ui.tsx` — bouwstenen: scène-layout, fade-ins, handgetekende omcirkeling, rood kruis, chips.
- `src/scenes.tsx` + `src/SomProductVideo.tsx` — video "Som-productmethode" (kwadratische vergelijkingen).
- `src/scenes-regels.tsx` + `src/RegelsVideo.tsx` — video "Somregel of productregel?" (differentiëren).
- `scripts/genereer-voiceover*.sh` — voice-over genereren via ElevenLabs (API-key in `.env`).
- `src/scenes-som29.tsx` + `src/Som29Video.tsx` — video "Uitleg bij som 29".
- `src/scenes-som30.tsx` + `src/Som30Video.tsx` — video "Uitleg bij som 30".
- `VOICEOVER.md` — het insprekscript van de som-productvideo met tijden.

## Nieuwe video maken

Gaat het om een uitlegvideo bij één som? Volg dan de vaste vijf-scène-opzet uit
[GUIDELINES.md](GUIDELINES.md#vaste-opzet-uitlegvideo-bij-een-som) en kopieer
`scenes-som30.tsx` als sjabloon.

1. Kopieer `scenes.tsx` + `SomProductVideo.tsx` naar bijv. `AbcFormuleVideo.tsx`.
2. Registreer een tweede `<Composition>` in `src/Root.tsx` met een eigen `id`.
3. Render met `npx remotion render <id> out/<naam>.mp4`.
