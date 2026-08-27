# Voice-over: Wanneer kies je de som-productmethode?

Totale lengte: 98 seconden. Tijden hieronder horen bij de scènes in
`src/SomProductVideo.tsx` — als je een scène langer/korter maakt, pas beide aan.

**Huidige stand:** in `public/voiceover/scene-1.mp3` t/m `scene-6.mp3` staat een
ElevenLabs-voice-over (stem "Jessica"). Opnieuw genereren — bijv. met een
andere stem of aangepaste tekst — kan met `bash scripts/genereer-voiceover.sh`
(API-key staat in `.env`, andere stem kiezen via `VOICE_ID=…`). Eigen opnames
gebruiken kan ook: vervang de zes bestanden met **dezelfde bestandsnamen**.
Elk fragment start 0,5 s na het begin van zijn scène (zie `Stem` in
`SomProductVideo.tsx`).

## Script

**Scène 1 · Intro (0:00 – 0:10)**
> Hoi! In dit filmpje leer je wanneer je de som-productmethode kiest om een
> kwadratische vergelijking op te lossen.

**Scène 2 · Kijk naar de vergelijking (0:10 – 0:25)**
> Kijk eerst goed naar de vergelijking. Hier staat x-kwadraat plus zeven x plus
> twaalf is nul. Er staat géén getal voor de x-kwadraat. Dan kan de
> som-productmethode!

**Scène 3 · Zoek twee getallen (0:25 – 0:45)**
> Nu zoek je twee getallen die keer elkaar twaalf zijn, én plus elkaar zeven.
> Eén keer twaalf? De som is dertien, dat klopt niet. Twee keer zes? Som is
> acht, ook niet. Drie keer vier is twaalf… en drie plus vier is zeven. Die is
> het!

**Scène 4 · Oplossen (0:45 – 0:56)**
> Dus je schrijft: x plus drie, keer x plus vier, is nul. De oplossingen zijn
> dan x is min drie, of x is min vier. Gelukt!

**Scène 5 · Wanneer níét? (0:56 – 1:16)**
> Maar soms lukt het niet. Kijk naar x-kwadraat plus vijf x plus drie is nul.
> Eén keer drie is drie, maar de som is vier — en geen vijf. Er zijn geen
> gehele getallen die passen. Vind je geen mooie gehele getallen? Dan gebruik
> je gewoon de abc-formule.

**Scène 6 · Samenvatting (1:16 – 1:38)**
> Samengevat. Stel jezelf twee vragen. Eén: staat er één, of niets, voor de
> x-kwadraat? Twee: zie je snel twee gehele getallen met het juiste product en
> de juiste som? Twee keer ja? Dan kies je som-product. Anders pak je de
> abc-formule. Succes!

## Zelf inspreken

Spreek per scène in (rustig tempo, korte pauzes tussen zinnen) en plak de
stukken achter elkaar, of spreek alles in één keer in terwijl je de video
meekijkt in Remotion Studio (`npm run studio`).

## AI-stem (ElevenLabs)

1. Kies op elevenlabs.io een Nederlandse stem (model "Eleven Multilingual").
2. Plak het script per scène en genereer de audio.
3. Plak de fragmenten in een audio-editor (bijv. Audacity) op de juiste
   starttijden en exporteer als `voiceover.mp3`.
