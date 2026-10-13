-- Hoofdstuk 15 heet in het boek "Afgeleiden en primitieven", maar op deze
-- site staan alleen hellingen, raaklijnen en optimaliseren. Primitieven
-- horen bij integraal. Herhaalbaar: twee keer draaien zet dezelfde titel.

UPDATE public.chapters
SET title = 'Hellingen, raaklijnen en optimaliseren'
WHERE slug = 'h15'
  AND title IS DISTINCT FROM 'Hellingen, raaklijnen en optimaliseren';
