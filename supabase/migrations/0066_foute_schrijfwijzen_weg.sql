-- Foute schrijfwijzen stonden als extra antwoord. De nakijkcode keurt
-- zo'n vorm dan altijd goed, zonder nog te rekenen. Een leerling die
-- die vorm typt, kreeg dus goed, terwijl de vorm niet de afgeleide is.
--
-- De vormen zijn later in de live database gezet. Ze staan niet in een
-- eerdere migratie. Deze migratie haalt alleen die vormen weg, bij
-- precies deze vragen. Het opgeslagen antwoord en de andere
-- schrijfwijzen blijven.
--
-- Bestaat een vraag niet (lege testdatabase), dan verandert er niets.
-- Twee keer draaien haalt niets extra weg.
--
-- Nageteld, per vraag: het opgeslagen antwoord is de afgeleide, de
-- weggehaalde vorm niet.
--   (3x^3-1)^2: 2·9x^2(3x^3-1) = 54x^5-18x^2. 54^(5) is 54 tot de macht 5.
--   5x^6-3x^5+2x-7: 30x^5-15x^4+2. Een macht die een spatie is, is 90x+2.
--   (1/2)x^3+2x^2(x-4)+6: 7,5x^2-16x. 7(1)/(2) is 3,5, niet 7,5.
--   x^3·√x: 3,5x^2√x. 3(1)/(2) is 1,5.
--   x^2·√x: 2,5x√x. 2(1)/(2) is 1.
--   x·√x: 1,5√x. 1(1)/(2) is 0,5.
--   x^2(x√x-3): 3,5x^2√x-6x. 3(1)/(2) is 1,5.
--   sin(x): cos(x). coss(x) is geen cosinus.
--   x^2 ln(x): 2x ln(x)+x. 2xlinx+x mist de haakjes en de letter n.
--   3^(2x-1): 2·3^(2x-1) ln(3). Het woord "keer" hoort niet in een antwoord.
--   (x-2)/(x+5): 7/(x+5)^2. Zonder haakjes om de teller staat alleen
--     het laatste stuk boven de breukstreep.
--   (2x+1)/(3x-1): -5/(3x-1)^2. Zelfde, teller zonder haakjes.
--   (3-4x)/(2x+5): -26/(2x+5)^2. Zelfde.
--   (2x-3)/(3x-1): 7/(3x-1)^2. Zelfde.
--   (5t+2)/(1-3t): 11/(1-3t)^2. Zelfde.
--   2e^x/(x-1): 2(x-2)e^x/(x-1)^2. Alleen de tweede term staat onder de streep.

BEGIN;

UPDATE public.questions_new AS q
SET answer_alternatives = (
  SELECT COALESCE(array_agg(vorm ORDER BY volgorde), '{}'::text[])
  FROM unnest(q.answer_alternatives) WITH ORDINALITY AS u(vorm, volgorde)
  WHERE NOT (vorm = ANY (v.fout))
)
FROM (
  VALUES
    (
      '05a00b99-624c-4461-bd9d-648fdea1908c'::uuid,
      $a0$2 \cdot 9x^2(3x^3 - 1)$a0$,
      ARRAY[$f0x0$54^(5)-18x^(2)$f0x0$]::text[],
      ARRAY[$b0x0$54x^5-18x^2$b0x0$, $b0x1$2*9x²*(3x³-1)$b0x1$]::text[]
    ),
    (
      '0fa2df10-772a-41f2-9532-9234983c690d'::uuid,
      $a1$7/(x + 5)^2$a1$,
      ARRAY[$f1x0$(x+5)*1-(x-2)*1/(x+5)^2$f1x0$, $f1x1$(x+5)-(x-2)/(x+5)²$f1x1$]::text[],
      ARRAY[$b1x0$7/(x+5)²$b1x0$, $b1x1$(7)/((x+5)²)$b1x1$, $b1x2$(7)/((x+5)^2  )$b1x2$, $b1x3$(7)/(x^(2)+10x+25)$b1x3$]::text[]
    ),
    (
      '1bf88f41-f979-42f8-9f28-da2965f5c0c1'::uuid,
      $a2$3,5*x^2*sqrt(x)$a2$,
      ARRAY[$f2x0$3(1)/(2)x^(2)sqrt(x)$f2x0$]::text[],
      ARRAY[$b2x0$3,5x^2,5$b2x0$, $b2x1$3,5x^(5/2)$b2x1$, $b2x2$x^(3)/2sqrt(x)+3x^(2)sqrt(x)$b2x2$]::text[]
    ),
    (
      '3e2f20ba-dda3-4e35-a4be-eb40cb231864'::uuid,
      $a3$7,5x^2 - 16x$a3$,
      ARRAY[$f3x0$7(1)/(2)x^(2)-16x$f3x0$, $f3x1$7,5x  2  −16x$f3x1$]::text[],
      ARRAY[$b3x0$7.5x^2-16x$b3x0$, $b3x1$1 1/2 x^2 + 6x^2 - 16x$b3x1$, $b3x2$15/2x^2-16x$b3x2$, $b3x3$7,5x²-16x$b3x3$]::text[]
    ),
    (
      '6b72010b-a3d5-4b38-9c0e-267099dfd6de'::uuid,
      $a4$2 \cdot  3^(2x-1) ln(3)$a4$,
      ARRAY[$f4x0$3^2x−1ln(3) keer 2$f4x0$]::text[],
      ARRAY[$b4x0$2*3^(2x-1)*ln(3)$b4x0$]::text[]
    ),
    (
      '81f23bc2-a8f4-42b1-90c6-a6d533b4d29a'::uuid,
      $a5$-5/(3x - 1)^2$a5$,
      ARRAY[$f5x0$(3x-1)*2-(2x+1)*3 / (3x-1)^2$f5x0$]::text[],
      ARRAY[$b5x0$-5/(3x-1)²$b5x0$, $b5x1$((3x-1)2-(2x+1)3)/((3x-1)^2)$b5x1$, $b5x2$(-5)/(9x^(2)-6x+1)$b5x2$]::text[]
    ),
    (
      '8d71be66-979f-4332-9bfd-dadcbe0f7554'::uuid,
      $a6$-26/(2x + 5)^2$a6$,
      ARRAY[$f6x0$((2x+5)*-4)-((3-4x)*2)/(2x+5)^2$f6x0$]::text[],
      ARRAY[$b6x0$-26/(2x+5)²$b6x0$, $b6x1$(-4*(2x+5)-(3-4x)*2)/((2x+5)^2)$b6x1$, $b6x2$(-26)/((2x+5)^2)$b6x2$, $b6x3$(-26)/(4x^(2)+20x+25)$b6x3$]::text[]
    ),
    (
      '9c8b2f45-db73-4d46-b307-683cbbc2b9f2'::uuid,
      $a7$7/(3x - 1)^2$a7$,
      ARRAY[$f7x0$(3x-1)*2-(2x-3)*3/(3x-1)^2$f7x0$]::text[],
      ARRAY[$b7x0$(7)/((3x-1)^2)$b7x0$, $b7x1$(7)/(9x^(2)-6x+1)$b7x1$]::text[]
    ),
    (
      '9ff414bd-16d5-4437-ab92-97cce68385f5'::uuid,
      $a8$2,5*x*sqrt(x)$a8$,
      ARRAY[$f8x0$2(1)/(2)xsqrt(x)$f8x0$]::text[],
      ARRAY[$b8x0$2,5x^1,5$b8x0$, $b8x1$2,5x^(3/2)$b8x1$]::text[]
    ),
    (
      'a116750d-06ea-4c06-8449-4f1175dea56c'::uuid,
      $a9$cos(x)$a9$,
      ARRAY[$f9x0$coss(x)$f9x0$]::text[],
      ARRAY[$b9x0$cosx$b9x0$]::text[]
    ),
    (
      'a83c1598-3e67-41da-8293-fde6061bbe2e'::uuid,
      $a10$1,5*sqrt(x)$a10$,
      ARRAY[$f10x0$1(1)/(2)sqrt(x)$f10x0$]::text[],
      ARRAY[$b10x0$1,5x^0,5$b10x0$, $b10x1$x/2sqrt(x)+sqrt(x)$b10x1$]::text[]
    ),
    (
      'babdc77b-9b16-40b8-8c3e-23a7ea861549'::uuid,
      $a11$3,5*x^2*sqrt(x) - 6x$a11$,
      ARRAY[$f11x0$3(1)/(2)x^(2)sqrt(x)-6x$f11x0$]::text[],
      ARRAY[$b11x0$x^2*1,5x^(0,5)+(x^(1,5)-3)*2x$b11x0$]::text[]
    ),
    (
      'c6e612d4-2fc3-4006-b569-40a9c32dea46'::uuid,
      $a12$2x ln(x) + x$a12$,
      ARRAY[$f12x0$2xlinx+x$f12x0$]::text[],
      ARRAY[$b12x0$x+2xln(x)$b12x0$]::text[]
    ),
    (
      'c8ad10ad-3e72-4224-8f05-b73092f06f62'::uuid,
      $a13$2(x-2) e^x / (x-1)^2$a13$,
      ARRAY[$f13x0$2xe^x- 4e^x /(x-1)^2$f13x0$]::text[],
      ARRAY[$b13x0$2e^x*-(x-1)^(-2)+2e^x*(x-1)^(-1)$b13x0$]::text[]
    ),
    (
      'c9bcb44e-5bde-4f8e-aa21-bfa16d45eaf6'::uuid,
      $a14$11/(1 - 3t)^2$a14$,
      ARRAY[$f14x0$(1-3t)*5-(5t+2)*-3/(1-3t)^2$f14x0$]::text[],
      ARRAY[$b14x0$11/(1-3t)²$b14x0$, $b14x1$(11)/(1-6t+9t^(2))$b14x1$]::text[]
    ),
    (
      'd994c241-46ad-4331-85fe-1bd1f67fee91'::uuid,
      $a15$30x^5 - 15x^4 + 2$a15$,
      ARRAY[$f15x0$30x  5  −15x  4  +2$f15x0$]::text[],
      ARRAY[$b15x0$30x⁵-15x⁴+2$b15x0$]::text[]
    )
) AS v(id, antwoord, fout, blijven)
WHERE q.id = v.id
  AND q.answer = v.antwoord
  AND q.answer_alternatives && v.fout;

DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM (
    VALUES
    (
      '05a00b99-624c-4461-bd9d-648fdea1908c'::uuid,
      $a0$2 \cdot 9x^2(3x^3 - 1)$a0$,
      ARRAY[$f0x0$54^(5)-18x^(2)$f0x0$]::text[],
      ARRAY[$b0x0$54x^5-18x^2$b0x0$, $b0x1$2*9x²*(3x³-1)$b0x1$]::text[]
    ),
    (
      '0fa2df10-772a-41f2-9532-9234983c690d'::uuid,
      $a1$7/(x + 5)^2$a1$,
      ARRAY[$f1x0$(x+5)*1-(x-2)*1/(x+5)^2$f1x0$, $f1x1$(x+5)-(x-2)/(x+5)²$f1x1$]::text[],
      ARRAY[$b1x0$7/(x+5)²$b1x0$, $b1x1$(7)/((x+5)²)$b1x1$, $b1x2$(7)/((x+5)^2  )$b1x2$, $b1x3$(7)/(x^(2)+10x+25)$b1x3$]::text[]
    ),
    (
      '1bf88f41-f979-42f8-9f28-da2965f5c0c1'::uuid,
      $a2$3,5*x^2*sqrt(x)$a2$,
      ARRAY[$f2x0$3(1)/(2)x^(2)sqrt(x)$f2x0$]::text[],
      ARRAY[$b2x0$3,5x^2,5$b2x0$, $b2x1$3,5x^(5/2)$b2x1$, $b2x2$x^(3)/2sqrt(x)+3x^(2)sqrt(x)$b2x2$]::text[]
    ),
    (
      '3e2f20ba-dda3-4e35-a4be-eb40cb231864'::uuid,
      $a3$7,5x^2 - 16x$a3$,
      ARRAY[$f3x0$7(1)/(2)x^(2)-16x$f3x0$, $f3x1$7,5x  2  −16x$f3x1$]::text[],
      ARRAY[$b3x0$7.5x^2-16x$b3x0$, $b3x1$1 1/2 x^2 + 6x^2 - 16x$b3x1$, $b3x2$15/2x^2-16x$b3x2$, $b3x3$7,5x²-16x$b3x3$]::text[]
    ),
    (
      '6b72010b-a3d5-4b38-9c0e-267099dfd6de'::uuid,
      $a4$2 \cdot  3^(2x-1) ln(3)$a4$,
      ARRAY[$f4x0$3^2x−1ln(3) keer 2$f4x0$]::text[],
      ARRAY[$b4x0$2*3^(2x-1)*ln(3)$b4x0$]::text[]
    ),
    (
      '81f23bc2-a8f4-42b1-90c6-a6d533b4d29a'::uuid,
      $a5$-5/(3x - 1)^2$a5$,
      ARRAY[$f5x0$(3x-1)*2-(2x+1)*3 / (3x-1)^2$f5x0$]::text[],
      ARRAY[$b5x0$-5/(3x-1)²$b5x0$, $b5x1$((3x-1)2-(2x+1)3)/((3x-1)^2)$b5x1$, $b5x2$(-5)/(9x^(2)-6x+1)$b5x2$]::text[]
    ),
    (
      '8d71be66-979f-4332-9bfd-dadcbe0f7554'::uuid,
      $a6$-26/(2x + 5)^2$a6$,
      ARRAY[$f6x0$((2x+5)*-4)-((3-4x)*2)/(2x+5)^2$f6x0$]::text[],
      ARRAY[$b6x0$-26/(2x+5)²$b6x0$, $b6x1$(-4*(2x+5)-(3-4x)*2)/((2x+5)^2)$b6x1$, $b6x2$(-26)/((2x+5)^2)$b6x2$, $b6x3$(-26)/(4x^(2)+20x+25)$b6x3$]::text[]
    ),
    (
      '9c8b2f45-db73-4d46-b307-683cbbc2b9f2'::uuid,
      $a7$7/(3x - 1)^2$a7$,
      ARRAY[$f7x0$(3x-1)*2-(2x-3)*3/(3x-1)^2$f7x0$]::text[],
      ARRAY[$b7x0$(7)/((3x-1)^2)$b7x0$, $b7x1$(7)/(9x^(2)-6x+1)$b7x1$]::text[]
    ),
    (
      '9ff414bd-16d5-4437-ab92-97cce68385f5'::uuid,
      $a8$2,5*x*sqrt(x)$a8$,
      ARRAY[$f8x0$2(1)/(2)xsqrt(x)$f8x0$]::text[],
      ARRAY[$b8x0$2,5x^1,5$b8x0$, $b8x1$2,5x^(3/2)$b8x1$]::text[]
    ),
    (
      'a116750d-06ea-4c06-8449-4f1175dea56c'::uuid,
      $a9$cos(x)$a9$,
      ARRAY[$f9x0$coss(x)$f9x0$]::text[],
      ARRAY[$b9x0$cosx$b9x0$]::text[]
    ),
    (
      'a83c1598-3e67-41da-8293-fde6061bbe2e'::uuid,
      $a10$1,5*sqrt(x)$a10$,
      ARRAY[$f10x0$1(1)/(2)sqrt(x)$f10x0$]::text[],
      ARRAY[$b10x0$1,5x^0,5$b10x0$, $b10x1$x/2sqrt(x)+sqrt(x)$b10x1$]::text[]
    ),
    (
      'babdc77b-9b16-40b8-8c3e-23a7ea861549'::uuid,
      $a11$3,5*x^2*sqrt(x) - 6x$a11$,
      ARRAY[$f11x0$3(1)/(2)x^(2)sqrt(x)-6x$f11x0$]::text[],
      ARRAY[$b11x0$x^2*1,5x^(0,5)+(x^(1,5)-3)*2x$b11x0$]::text[]
    ),
    (
      'c6e612d4-2fc3-4006-b569-40a9c32dea46'::uuid,
      $a12$2x ln(x) + x$a12$,
      ARRAY[$f12x0$2xlinx+x$f12x0$]::text[],
      ARRAY[$b12x0$x+2xln(x)$b12x0$]::text[]
    ),
    (
      'c8ad10ad-3e72-4224-8f05-b73092f06f62'::uuid,
      $a13$2(x-2) e^x / (x-1)^2$a13$,
      ARRAY[$f13x0$2xe^x- 4e^x /(x-1)^2$f13x0$]::text[],
      ARRAY[$b13x0$2e^x*-(x-1)^(-2)+2e^x*(x-1)^(-1)$b13x0$]::text[]
    ),
    (
      'c9bcb44e-5bde-4f8e-aa21-bfa16d45eaf6'::uuid,
      $a14$11/(1 - 3t)^2$a14$,
      ARRAY[$f14x0$(1-3t)*5-(5t+2)*-3/(1-3t)^2$f14x0$]::text[],
      ARRAY[$b14x0$11/(1-3t)²$b14x0$, $b14x1$(11)/(1-6t+9t^(2))$b14x1$]::text[]
    ),
    (
      'd994c241-46ad-4331-85fe-1bd1f67fee91'::uuid,
      $a15$30x^5 - 15x^4 + 2$a15$,
      ARRAY[$f15x0$30x  5  −15x  4  +2$f15x0$]::text[],
      ARRAY[$b15x0$30x⁵-15x⁴+2$b15x0$]::text[]
    )
  ) AS v(id, antwoord, fout, blijven)
  JOIN public.questions_new AS q
    ON q.id = v.id
  WHERE q.answer IS DISTINCT FROM v.antwoord
     OR q.answer_alternatives && v.fout
     OR NOT (q.answer_alternatives @> v.blijven);

  IF n <> 0 THEN
    RAISE EXCEPTION
      'Er staat nog een foute schrijfwijze bij, of een goede vorm is weg (aantal %)',
      n;
  END IF;
END $$;

COMMIT;
