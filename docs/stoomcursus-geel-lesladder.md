# Gele module — lesladder "Begrijp het verhaaltje"

Doel: de leerling leert **niet** 17 losse trucjes, maar één denkbeweging:

> **signaalwoord in de vraag → conditie op de afgeleide → vast stappenplan**

Bij elk verhaaltje stelt de leerling zichzelf steeds dezelfde drie vragen:
1. **Wat wordt er gevraagd?** (zoek het signaalwoord)
2. **Welke conditie hoort daarbij?** ($f'(x)=0$ · $f'(a)$ invullen · $f'(x)=c$ oplossen · $f''(x)=0$ · …)
3. **Voer het vaste stappenplan uit.**

De tredes lopen van makkelijk naar moeilijk; elke trede voegt precies één nieuw idee toe (kolom "nieuw").
Notatie in KaTeX (`$...$`), zodat dit één-op-één naar `messages/nl.json` kan porten.

Examenvoorbeelden verwijzen naar de getagde bank (`content-bron/examens/`). Zes types
(11, 17, 8, 9, 10, 15) kwamen in de centrale examens 2021–2026 niet als los onderdeel voor;
daar staat alleen een schoolvoorbeeld met de notitie *"nog geen voorbeeld in de bank"*.

---

## BLOK A — De afgeleide = 0 (iets is optimaal)

### Trede 1 — Maximum / minimum · (verhaaltje 1) · *de kern*

- **ALS** er staat: *maximum, minimum, grootste, kleinste, optimaal, top, extreme waarde*
- **DAN** → $f'(x) = 0$

**Stappenplan**
1. Herken het signaalwoord → dit wordt $f'(x)=0$
2. Bereken $f'(x)$
3. Stel $f'(x)=0$
4. Los op → dit is de $x$ van de top
5. Vragen ze de wáárde? Vul die $x$ in $f$ in

**Voorbeeld 1 — school (uitgewerkt)**
> De opbrengst is $O(x) = -x^2 + 6x + 1$. Voor welke $x$ is de opbrengst maximaal, en hoe groot is die dan?

- "maximaal" → $O'(x)=0$
- $O'(x) = -2x + 6$
- $-2x + 6 = 0 \Rightarrow x = 3$
- $O(3) = -9 + 18 + 1 = 10$ → maximale opbrengst is **10**

**Voorbeeld 2 — examen (2023 tijdvak 1, vraag 1)**
> $f(x) = 2x + \frac{1}{x}$ (voor $x>0$) heeft een minimum. Bereken exact dit minimum.

- "minimum" → $f'(x)=0$
- Herschrijf: $f(x)=2x+x^{-1}$, dus $f'(x)=2-x^{-2}$
- $2-\frac{1}{x^2}=0 \Rightarrow x^2=\tfrac12 \Rightarrow x=\tfrac{1}{2}\sqrt2$
- Invullen geeft het minimum $=2\sqrt2$

---

### Trede 2 — Stijgen / dalen / monotonie · (verhaaltje 16) · *nieuw: teken van $f'$*

- **ALS** er staat: *waar stijgt/daalt $f$, aantonen dat $f$ stijgt, is $f$ monotoon, bolle/holle*
- **DAN** → bekijk het **teken** van $f'(x)$ ($f'>0$ = stijgt, $f'<0$ = daalt)

**Stappenplan**
1. Bereken $f'(x)$
2. Stijgen/dalen aantonen in een punt? Vul dat punt in en check het teken van $f'$
3. Over een interval? Onderzoek waar $f'(x)>0$ (of $<0$)

**Voorbeeld 1 — school (uitgewerkt)**
> Toon aan dat $f(x)=x^3+x$ overal stijgt.

- $f'(x)=3x^2+1$
- $3x^2 \ge 0$, dus $f'(x)\ge 1 > 0$ voor alle $x$ → $f$ stijgt overal

**Voorbeeld 2 — examen (2024 tijdvak 1, vraag 1)**
> $f(x)=x^5-3x\sqrt{x}$, met $A(1,-2)$ op de grafiek. Bewijs dat de grafiek in $A$ stijgt.

- "stijgt" → teken van $f'$ in $A$
- $f(x)=x^5-3x^{3/2}$, dus $f'(x)=5x^4-\tfrac92 x^{1/2}$
- $f'(1)=5-\tfrac92=\tfrac12>0$ → stijgt in $A$

---

## BLOK B — De afgeleide invullen (hoe steil / hoe snel hier?)

### Trede 3 — Helling in een punt · (verhaaltje 3) · *nieuw: $f'(a)$ invullen*

- **ALS** er staat: *de helling / richtingscoëfficiënt in het punt met $x=a$*
- **DAN** → bereken $f'(x)$ en vul $a$ in: $f'(a)$

**Stappenplan**
1. Bereken $f'(x)$
2. Vul $x=a$ in → $f'(a)$ is de helling

**Voorbeeld 1 — school (uitgewerkt)**
> Wat is de helling van $f(x)=x^2$ in het punt $x=3$?

- $f'(x)=2x$
- $f'(3)=6$ → helling is **6**

**Voorbeeld 2 — examen (2021 tijdvak 1, vraag 1)**
> $f(x)=x-x^2$. Lijn $l$ raakt de grafiek in de oorsprong. (De rc van $l$ heb je nodig.)

- helling in $x=0$ → $f'(0)$
- $f'(x)=1-2x$, dus $f'(0)=1$ → rc van $l$ is $1$

---

### Trede 4 — Snelheid / versnelling · (verhaaltje 4) · *nieuw: $v=s'$, $a=s''$*

- **ALS** er staat: *snelheid of versnelling op tijdstip $t$*
- **DAN** → snelheid $v(t)=s'(t)$, versnelling $a(t)=s''(t)$, dan invullen

**Stappenplan**
1. Snelheid gevraagd → differentieer de plaats/hoogte: $v=s'$
2. Versnelling gevraagd → differentieer nog een keer: $a=s''$
3. Vul het tijdstip $t$ in (of los op als de snelheid gegeven is)

**Voorbeeld 1 — school (uitgewerkt)**
> Hoogte $h(t)=-5t^2+20t$. Wat is de snelheid op $t=1$?

- snelheid → $h'(t)=-10t+20$
- $h'(1)=10$ → snelheid is **10** (m/s)

**Voorbeeld 2 — examen (2025 tijdvak 1, vraag 12)**
> $Z(t)=150-100\cos(4t)$. Er zijn twee hoogtes waar de snelheid $255$ is. Bereken deze hoogtes.

- "snelheid" → $v(t)=Z'(t)=400\sin(4t)$ (kettingregel)
- gegeven snelheid → los $400\sin(4t)=255$ op, vul $t$ terug in $Z$

---

### Trede 5 — Gemiddelde snelheid/toename · (verhaaltje 14) · *DE VALKUIL: níet de afgeleide*

- **ALS** er staat: *gemiddelde snelheid / gemiddelde toename over $[a,b]$*
- **DAN** → differentiequotiënt $\dfrac{f(b)-f(a)}{b-a}$ — **dus géén $f'$!**

**Waarom hier?** Dit lijkt op Blok B, maar hier gebruik je de afgeleide juist *niet*.
Dat contrast is precies wat je wil aanleren: "gemiddeld" = quotiënt van verschillen, "op een moment" = afgeleide.

**Stappenplan**
1. Zie je "gemiddeld"? → geen afgeleide, maar $\frac{f(b)-f(a)}{b-a}$
2. Bereken $f(a)$ en $f(b)$
3. Deel het verschil door $b-a$

**Voorbeeld 1 — school (uitgewerkt)**
> $f(x)=x^2$. Gemiddelde toename over $[1,3]$?

- $\frac{f(3)-f(1)}{3-1}=\frac{9-1}{2}=4$

**Voorbeeld 2 — examen (2026 tijdvak 2, vraag 12)**
> $f(x)=\frac{3}{\sqrt x}$ met $A(1,3)$, $B(9,1)$. Zoek het punt waar de helling van $f$ gelijk is aan de helling van koorde $AB$.

- helling koorde $AB$ (= differentiequotiënt): $\frac{1-3}{9-1}=-\tfrac14$
- helling van $f$ (= afgeleide): $f'(x)=-\tfrac32 x^{-3/2}$
- gelijkstellen $f'(x)=-\tfrac14$ → hier zie je beide begrippen naast elkaar

---

## BLOK C — De afgeleide = een getal oplossen

### Trede 6 — Helling is gegeven · (verhaaltje 6) · *nieuw: $f'(x)=c$ oplossen*

- **ALS** er staat: *rc $=\dots$, evenwijdig aan $\dots$, helling gelijk aan $\dots$* (en je zoekt het punt)
- **DAN** → los $f'(x)=c$ op

**Stappenplan**
1. Bepaal de gegeven helling $c$ (bij "evenwijdig aan": de rc van die lijn)
2. Bereken $f'(x)$
3. Los $f'(x)=c$ op → dit geeft de $x$ van het gezochte punt

**Voorbeeld 1 — school (uitgewerkt)**
> $f(x)=x^2$. In welk punt is de helling gelijk aan $6$?

- $f'(x)=2x$
- $2x=6 \Rightarrow x=3$ → in het punt $x=3$

**Voorbeeld 2 — examen (2024 tijdvak 1, vraag 6)**
> $g$ ontstaat door verschuiven van $f(x)=(3x-7)^2$; $g$ gaat door $A(5,40)$ en de raaklijnhelling in $A$ is $-6$. Stel $g$ op.

- "helling $=-6$" → $g'(x)=-6$ oplossen om de verschuiving te vinden
- werk met $f'(x)=2(3x-7)\cdot 3$ (kettingregel) en de gegeven helling

---

### Trede 7 — Raaklijn opstellen · (verhaaltje 5) · *nieuw: rc én $b$ (tweedelig plan)*

- **ALS** er staat: *stel de raaklijn op in het gegeven punt $A$*
- **DAN** → rc $=f'(a)$, daarna $b$ berekenen met het punt

**Stappenplan**
1. rc van de raaklijn $= f'(a)$
2. Raaklijn: $y=\text{rc}\cdot x + b$
3. Vul $A(a, f(a))$ in om $b$ te vinden

**Voorbeeld 1 — school (uitgewerkt)**
> Raaklijn aan $f(x)=x^2$ in $A(3,9)$.

- rc $=f'(3)=6$, dus $y=6x+b$
- $9=6\cdot3+b \Rightarrow b=-9$ → raaklijn $y=6x-9$

**Voorbeeld 2 — examen (2021 tijdvak 2, vraag 6)**
> $f_p(x)=\tfrac14x^4-x^3+px$. Lijn $l$ is de raaklijn in $A$ ($x=2$) en snijdt de $y$-as in $B(0,4)$.

- raaklijn in $A$ → rc $=f_p'(2)$, dan $b$ via het punt $A$
- (daarna redeneren over $B$ en $M$)

---

## BLOK D — De tweede afgeleide

### Trede 8 — Buigpunt · (verhaaltje 2) · *nieuw: $f''(x)=0$*

- **ALS** er staat: *buigpunt, bolle/holle kant, waar verandert de kromming*
- **DAN** → $f''(x)=0$

**Stappenplan**
1. Bereken $f'(x)$, dan $f''(x)$
2. Stel $f''(x)=0$
3. Los op → $x$ van het buigpunt (vul in $f$ in voor de $y$)

**Voorbeeld 1 — school (uitgewerkt)**
> Buigpunt van $f(x)=x^3-3x^2$.

- $f'(x)=3x^2-6x$, $f''(x)=6x-6$
- $6x-6=0 \Rightarrow x=1$; $f(1)=1-3=-2$ → buigpunt $(1,-2)$

**Voorbeeld 2 — examen (2025 tijdvak 1, vraag 1)**
> $f(x)=x^4-30x^2$. Bewijs dat de $y$-coördinaat van de buigpunten $-125$ is.

- "buigpunten" → $f''(x)=0$
- $f'(x)=4x^3-60x$, $f''(x)=12x^2-60$
- $12x^2-60=0 \Rightarrow x^2=5$; invullen in $f$ geeft $y=-125$

---

### Trede 9 — Buigraaklijn · (verhaaltje 7) · *nieuw: $f''=0$, dán $f'$ invullen*

- **ALS** er staat: *raaklijn in het buigpunt (buigraaklijn)*
- **DAN** → eerst $f''(x)=0$ (buigpunt), dán $f'$ invullen voor de rc

**Stappenplan**
1. $f''(x)=0$ → $x$ van het buigpunt
2. rc van de buigraaklijn $= f'(\text{die }x)$
3. $b$ via het buigpunt (net als trede 7)

**Voorbeeld 1 — school (uitgewerkt)**
> Buigraaklijn aan $f(x)=x^3-3x^2$ (buigpunt $(1,-2)$ uit trede 8).

- rc $=f'(1)=3-6=-3$, dus $y=-3x+b$
- $-2=-3\cdot1+b \Rightarrow b=1$ → buigraaklijn $y=-3x+1$

**Voorbeeld 2 — examen (2022 tijdvak 2, vraag 2)**
> $f(x)=2(2x-1)^3+3(2x-1)^2$ met $f'(x)=48x^2-24x$. Lijn $k$ raakt in het buigpunt. Stel $k$ op.

- "buigpunt" → $f''(x)=0$: $f''(x)=96x-24=0 \Rightarrow x=\tfrac14$
- rc $=f'(\tfrac14)$, daarna $b$ via het buigpunt

---

## BLOK E — Werken met een parameter

### Trede 10 — Raaklijn gegeven, bereken parameter · (verhaaltje 12) · *nieuw: oplossen naar $p$*

- **ALS** er staat: *een raaklijn/helling is gegeven en je moet de parameter ($p$, $a$, …) berekenen*
- **DAN** → $f_p'(x_A)=\text{rc}$, oplossen voor de parameter

**Stappenplan**
1. Bereken $f_p'(x)$ (parameter blijft erin staan)
2. Vul het raakpunt in en stel gelijk aan de gegeven rc
3. Los op naar de parameter

**Voorbeeld 1 — school (uitgewerkt)**
> $f_a(x)=ax^2$. De helling in $x=1$ is $6$. Bepaal $a$.

- $f_a'(x)=2ax$, dus $f_a'(1)=2a$
- $2a=6 \Rightarrow a=3$

**Voorbeeld 2 — examen (2024 tijdvak 2, vraag 9)**
> $f(x)=ax^2+bx+c$; door $S(0,2)$, raaklijn in $S$ snijdt de $x$-as in $(\tfrac23\sqrt3,0)$. Bereken $a,b,c$.

- raaklijn in $S$ → $f'(0)=b$ = rc van die raaklijn
- combineer met de gegeven punten om $a,b,c$ op te lossen

---

### Trede 11 — Kromme door alle toppen · (verhaaltje 13) · *nieuw: $p$ vrijmaken en invullen*

- **ALS** er staat: *de lijn/kromme waarop alle toppen liggen (voor elke $p$)*
- **DAN** → $f_p'(x)=0$, maak $p$ vrij, vul terug in

**Stappenplan**
1. $f_p'(x)=0$ → de $x$ van de top (met $p$ erin)
2. Maak $p$ vrij, óf druk de top-coördinaten uit in $p$
3. Elimineer $p$ → de vergelijking van de kromme door de toppen

**Voorbeeld 1 — school (uitgewerkt)**
> $f_p(x)=x^2-2px$. Op welke kromme liggen alle toppen?

- $f_p'(x)=2x-2p=0 \Rightarrow x=p$
- top: $y=f_p(p)=p^2-2p^2=-p^2$; met $x=p$ → $y=-x^2$ → alle toppen op $y=-x^2$

**Voorbeeld 2 — examen (2021 tijdvak 1, vraag 12)**
> $f_p(x)=\frac{x^3+4p}{x^2}$ ($p>0$) heeft één top. Bewijs dat er een lijn is waarop al die toppen liggen.

- $f_p'(x)=0$ → $x$ van de top in termen van $p$
- top-coördinaten uitdrukken, $p$ elimineren → blijkt een rechte lijn ($y=\tfrac32 x$)

---

### Trede 12 — Aantal extremen/raaklijnen bij parameter · (verhaaltje 11) · *nieuw: discriminant van $f'$*

- **ALS** er staat: *voor welke $p$ heeft $f$ twee/één/geen extremen (of raaklijnen met helling $c$)*
- **DAN** → onderzoek de discriminant van $f_p'(x)=c$

**Stappenplan**
1. Stel $f_p'(x)=0$ (of $=c$)
2. Dit is een vergelijking in $x$ met parameter $p$ → bekijk de discriminant $D$
3. $D>0$: twee, $D=0$: één, $D<0$: geen

**Voorbeeld 1 — school (uitgewerkt)**
> Voor welke $p$ heeft $f(x)=x^3+px+1$ twee extremen?

- $f'(x)=3x^2+p=0$; twee oplossingen ⇔ $x^2=-\tfrac{p}{3}>0 \Rightarrow p<0$

*Nog geen voorbeeld in de examenbank 2021–2026 (dit type kwam die jaren niet los voor).*

---

### Trede 13 — Aantal buigpunten bij parameter · (verhaaltje 17) · *nieuw: discriminant van $f''$*

- **ALS** er staat: *voor welke $p$ heeft $f$ twee/geen buigpunten*
- **DAN** → onderzoek de discriminant van $f_p''(x)=0$

**Stappenplan**
1. Bereken $f_p''(x)$
2. Stel $f_p''(x)=0$ → vergelijking in $x$ met parameter
3. Discriminant: $D>0$ twee buigpunten, $D<0$ geen

**Voorbeeld 1 — school (uitgewerkt)**
> Voor welke $p$ heeft $f(x)=x^4+px^2$ twee buigpunten?

- $f''(x)=12x^2+2p=0 \Rightarrow x^2=-\tfrac{p}{6}$; twee oplossingen ⇔ $p<0$

*Nog geen voorbeeld in de examenbank 2021–2026.*

---

## BLOK F — Terugredeneren & aantallen oplossingen

### Trede 14 — Van $f'$ terug naar $f$ · (verhaaltje 8) · *nieuw: teken van $f'$ lezen*

- **ALS** er staat: *de afgeleide- of hellinggrafiek is gegeven en je moet iets over $f$ zeggen*
- **DAN** → terugredeneren: waar $f'=0$ zit een top van $f$; teken van $f'$ = stijgen/dalen van $f$

**Stappenplan**
1. Zoek nulpunten van $f'$ → daar heeft $f$ toppen
2. Teken van $f'$ links/rechts → stijgt of daalt $f$
3. Combineer tot een uitspraak/schets van $f$

**Voorbeeld 1 — school (uitgewerkt)**
> $f'(x)=x-2$ is gegeven. Wat weet je over $f$?

- $f'=0$ bij $x=2$; links $f'<0$ (daalt), rechts $f'>0$ (stijgt) → $f$ heeft een **minimum** bij $x=2$

*Nog geen voorbeeld in de examenbank 2021–2026.*

---

### Trede 15 — Aantal oplossingen van $f(x)=p$ · (verhaaltje 9) · *nieuw: toppen → aflezen*

- **ALS** er staat: *voor welke $p$ heeft $f(x)=p$ drie/twee/één oplossing(en)*
- **DAN** → bepaal de toppen ($f'(x)=0$) en lees af op welke hoogtes de horizontale lijn $y=p$ de grafiek snijdt

**Stappenplan**
1. Toppen bepalen met $f'(x)=0$ → de top-hoogtes (max- en min-waarde)
2. Teken/denk de grafiek; $y=p$ is een horizontale lijn
3. Tel snijpunten afhankelijk van $p$ t.o.v. de top-hoogtes

**Voorbeeld 1 — school (uitgewerkt)**
> $f(x)=x^3-3x$ (top-waarden $2$ en $-2$). Voor welke $p$ heeft $f(x)=p$ drie oplossingen?

- toppen: $f'(x)=3x^2-3=0 \Rightarrow x=\pm1$; $f(-1)=2$ (max), $f(1)=-2$ (min)
- drie snijpunten ⇔ $-2<p<2$

*Nog geen voorbeeld in de examenbank 2021–2026.*

---

### Trede 16 — Aantal raaklijnen vanuit een punt · (verhaaltje 10) · *nieuw: raaklijn door een gegeven punt*

- **ALS** er staat: *aantal oplossingen van $f(x)=ax$ (lijn door oorsprong), of aantal raaklijnen vanuit een punt*
- **DAN** → stel de raaklijn door dat punt op en onderzoek hoeveel er zijn

**Stappenplan**
1. Raakpunt $(a,f(a))$; rc $=f'(a)$
2. Eis dat de raaklijn door het gegeven punt gaat → vergelijking in $a$
3. Aantal oplossingen voor $a$ = aantal raaklijnen

**Voorbeeld 1 — school (uitgewerkt)**
> Hoeveel raaklijnen aan $f(x)=x^2$ gaan door $(0,-1)$?

- raaklijn in $a$: $y=2a\,x-a^2$; door $(0,-1)$: $-1=-a^2 \Rightarrow a=\pm1$ → **twee** raaklijnen

*Nog geen voorbeeld in de examenbank 2021–2026.*

---

### Trede 17 — Afgeleide via de definitie · (verhaaltje 15) · *nieuw: differentiequotiënt-limiet*

- **ALS** er staat: *bereken de afgeleide met de definitie / het differentiequotiënt / de limiet $h\to0$*
- **DAN** → $f'(x)=\lim_{h\to0}\dfrac{f(x+h)-f(x)}{h}$ uitwerken

**Stappenplan**
1. Zet $\frac{f(x+h)-f(x)}{h}$ op
2. Werk de teller uit en deel weg door $h$
3. Neem de limiet $h\to0$

**Voorbeeld 1 — school (uitgewerkt)**
> Bepaal $f'(x)$ voor $f(x)=x^2$ met de definitie.

- $\frac{(x+h)^2-x^2}{h}=\frac{2xh+h^2}{h}=2x+h$
- $\lim_{h\to0}(2x+h)=2x$

*Nog geen voorbeeld in de examenbank 2021–2026.*

---

## Samenvatting van de ladder

| # | Trede | Signaalwoord | Denk → | (verhaaltje) |
|---|-------|--------------|--------|:---:|
| 1 | Maximum/minimum | max, min, top, optimaal | $f'(x)=0$ | 1 |
| 2 | Stijgen/dalen | stijgt, daalt, monotoon | teken van $f'$ | 16 |
| 3 | Helling in een punt | helling/rc bij $x=a$ | $f'(a)$ invullen | 3 |
| 4 | Snelheid/versnelling | snelheid, versnelling | $v=s'$, $a=s''$ | 4 |
| 5 | Gemiddelde toename | *gemiddeld* over $[a,b]$ | differentiequotiënt (valkuil!) | 14 |
| 6 | Helling gegeven | rc $=c$, evenwijdig aan | $f'(x)=c$ oplossen | 6 |
| 7 | Raaklijn opstellen | raaklijn in $A$ | rc $=f'(a)$, dan $b$ | 5 |
| 8 | Buigpunt | buigpunt, bol/hol | $f''(x)=0$ | 2 |
| 9 | Buigraaklijn | raaklijn in buigpunt | $f''=0$, dan $f'$ | 7 |
| 10 | Parameter uit raaklijn | bereken $p$ uit helling | $f_p'(x_A)=$ rc | 12 |
| 11 | Kromme door toppen | lijn door alle toppen | $f_p'=0$, $p$ elimineren | 13 |
| 12 | Aantal extremen (param.) | voor welke $p$ … extremen | discriminant van $f'$ | 11 |
| 13 | Aantal buigpunten (param.) | voor welke $p$ … buigpunten | discriminant van $f''$ | 17 |
| 14 | Van $f'$ naar $f$ | hellinggrafiek gegeven | teken van $f'$ lezen | 8 |
| 15 | Aantal oplossingen $f=p$ | hoeveel oplossingen | toppen → aflezen | 9 |
| 16 | Raaklijnen vanuit punt | aantal raaklijnen | raaklijn door punt | 10 |
| 17 | Afgeleide via definitie | met de definitie/limiet | $\lim_{h\to0}\frac{f(x+h)-f(x)}{h}$ | 15 |
