import { expect, test, type Locator } from '@playwright/test'

import { logIn } from './leerling'

/**
 * De oefenpagina toont de blokken onder elkaar. Een adres met ?blok=
 * scrolt daarheen, en een leeg blok staat alleen in de zijbalk.
 */
test.beforeEach(async ({ page }) => {
  await logIn(page)
})

test('de blokken staan onder elkaar, ook met een hoofdstuk in het adres @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  await expect(page.locator('#hoofdstuk-h2')).toBeVisible()
  await expect(page.locator('#blok-h2-1d')).toBeAttached()
  await expect(page.locator('#blok-h2-3d')).toBeAttached()
  // 2.5 gaat niet over differentiëren en hoort nergens te staan.
  await expect(page.locator('#blok-h2-5a')).toHaveCount(0)
  await expect(page.locator('#paragraaf-h2-5')).toHaveCount(0)

  const titel = page.getByRole('heading', { level: 1, name: 'Oefenen' })
  const deel = page.getByRole('button', { name: 'Stuur naar een klasgenoot' })
  await expect(titel).toBeVisible()
  await expect(deel).toBeVisible()
  const deelVak = await deel.boundingBox()
  expect(deelVak?.height ?? 0).toBeGreaterThanOrEqual(44)

  const breed = (page.viewportSize()?.width ?? 0) >= 1024
  if (breed) {
    const titelVak = await titel.boundingBox()
    expect(Math.abs((titelVak?.y ?? 0) - (deelVak?.y ?? 0))).toBeLessThan(20)
    const zijbalk = page.locator('aside')
    const klikbaar = zijbalk.getByRole('button', { name: /Differentiequotiënten berekenen/ })
    await expect(klikbaar).toContainText(/\d+/)
    await expect(klikbaar).toHaveClass(/cursor-pointer/)
    await expect(zijbalk.getByRole('button', { name: /2\.5/ })).toHaveCount(0)
    await zijbalk.getByRole('button', { name: /2\.1/ }).click()
    await expect(zijbalk.getByText('Soorten van stijgen')).toHaveCount(0)
    await zijbalk.getByRole('button', { name: /H7 –/ }).click()
    await expect(zijbalk.getByRole('button', { name: /7\.[1-4]/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /7\.5/ })).toBeVisible()
    await zijbalk.getByRole('button', { name: /H9 –/ }).click()
    await expect(zijbalk.getByRole('button', { name: /9\.1/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /9\.2/ })).toHaveCount(0)
    await expect(zijbalk.getByRole('button', { name: /9\.3/ })).toBeVisible()
    await zijbalk.getByRole('button', { name: /2\.3/ }).click()
    await expect(zijbalk.getByRole('button', { name: /2\.3/ })).toHaveAttribute(
      'aria-expanded',
      'true',
    )
    await zijbalk.getByRole('button', { name: /Differentiëren/ }).click()
  } else {
    await page.getByRole('button', { name: /H2 –/ }).click()
    const menu = page.getByRole('dialog')
    const klikbaar = menu.getByRole('button', { name: /Differentiequotiënten berekenen/ })
    await expect(klikbaar).toContainText(/\d+/)
    await expect(menu.getByRole('button', { name: /2\.5/ })).toHaveCount(0)
    await menu.getByRole('button', { name: /2\.1/ }).click()
    await expect(menu.getByText('Soorten van stijgen')).toHaveCount(0)
    // Een klik op het hoofdstuk sluit dit menu. 7.1–7.4 en 9.1–9.2
    // controleert de computerzijbalk hierboven.
    await menu.getByRole('button', { name: /2\.3/ }).click()
    await expect(menu.getByRole('button', { name: /2\.3/ })).toHaveAttribute('aria-expanded', 'true')
    await menu.getByRole('button', { name: /Differentiëren/ }).click()
  }

  await expect(page.locator('#blok-h2-3d')).toBeInViewport()
  await expect(page.locator('#blok-h2-1d')).toBeAttached()
})

function aantalUit(tekst: string): number {
  const gevonden = tekst.match(/\((\d+)\)/)
  if (!gevonden) throw new Error(`geen aantal in «${tekst}»`)
  return Number(gevonden[1])
}

test('filter op verhaaltjes en gewone sommen blijft staan @telefoon', async ({ page }) => {
  await page.goto('/nl/oefenen?chapter=e2e')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const hoofdstuk = page.locator('#hoofdstuk-e2e')
  const filter = page.getByRole('radiogroup', { name: 'Soort sommen' })
  await expect(filter).toHaveCount(1)
  const verhaal = filter.getByRole('radio', { name: /^Verhaaltjes \(\d+\)$/ })
  const gewoon = filter.getByRole('radio', { name: /^Gewone sommen \(\d+\)$/ })
  const alles = filter.getByRole('radio', { name: /^Alles \(\d+\)$/ })
  await expect(verhaal).toBeVisible()
  await expect(gewoon).toBeVisible()
  const som =
    aantalUit(await gewoon.innerText()) + aantalUit(await verhaal.innerText())
  expect(aantalUit(await alles.innerText())).toBe(som)
  // Het filter staat één keer bovenaan, niet in een onderdeel.
  await expect(page.locator('#blok-h2-1d').getByRole('radiogroup')).toHaveCount(0)
  await expect(hoofdstuk.getByRole('radiogroup')).toHaveCount(0)

  await verhaal.click()
  await expect(hoofdstuk.getByRole('link', { name: /omhoog gegooid/ })).toBeVisible()
  await expect(hoofdstuk.getByRole('link', { name: /^Opgave 1\./ })).toHaveCount(0)
  await expect(page).toHaveURL(/soort=verhaal/)

  await gewoon.click()
  await expect(hoofdstuk.getByRole('link', { name: /omhoog gegooid/ })).toHaveCount(0)
  await expect(hoofdstuk.getByRole('link', { name: /^Opgave 1\./ })).toBeVisible()

  // Naar een ander hoofdstuk en terug: de keuze blijft, ook zonder parameter.
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('#hoofdstuk-h2')).toBeVisible()
  await page.goto('/nl/oefenen?chapter=e2e')
  await expect(page.getByRole('radio', { name: /^Gewone sommen \(\d+\)$/ })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await expect(hoofdstuk.getByRole('link', { name: /omhoog gegooid/ })).toHaveCount(0)
})

test('filter bovenaan geldt voor heel hoofdstuk 2 @telefoon', async ({ page }) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const filter = page.getByRole('radiogroup', { name: 'Soort sommen' })
  await expect(filter).toHaveCount(1)
  const volgorde = await page.evaluate(() => {
    const titel = document.querySelector('h1')
    const knoppen = document.querySelector('[aria-label="Soort sommen"]')
    const hoofdstuk = document.getElementById('hoofdstuk-h2')
    if (!titel || !knoppen || !hoofdstuk) return false
    const volgt = (eerste: Node, tweede: Node) =>
      (eerste.compareDocumentPosition(tweede) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0
    return volgt(titel, knoppen) && volgt(knoppen, hoofdstuk)
  })
  expect(volgorde).toBe(true)

  const alles = filter.getByRole('radio', { name: /^Alles \(\d+\)$/ })
  const gewoon = filter.getByRole('radio', { name: /^Gewone sommen \(\d+\)$/ })
  const verhaal = filter.getByRole('radio', { name: /^Verhaaltjes \(\d+\)$/ })
  expect(aantalUit(await alles.innerText())).toBe(
    aantalUit(await gewoon.innerText()) + aantalUit(await verhaal.innerText()),
  )

  const hoofdstuk = page.locator('#hoofdstuk-h2')
  const tweeEen = page.locator('#paragraaf-h2-1')
  const blok23 = page.locator('#blok-h2-3d')
  await expect(hoofdstuk.locator('[data-verhaal="nee"]')).not.toHaveCount(0)
  await expect(hoofdstuk.locator('[data-verhaal="ja"]')).not.toHaveCount(0)
  // 2.1 is een verhaaltjesblok. 2.3 heeft beide soorten.
  await expect(tweeEen.locator('[data-verhaal="ja"]')).not.toHaveCount(0)
  await expect(blok23.locator('[data-verhaal="nee"]')).not.toHaveCount(0)
  await expect(blok23.locator('[data-verhaal="ja"]')).not.toHaveCount(0)

  await verhaal.click()
  await expect(hoofdstuk.locator('[data-verhaal="nee"]')).toHaveCount(0)
  await expect(hoofdstuk.locator('[data-verhaal="ja"]')).not.toHaveCount(0)
  await expect(tweeEen.locator('[data-verhaal="ja"]')).not.toHaveCount(0)
  await expect(blok23.locator('[data-verhaal="nee"]')).toHaveCount(0)
  await expect(page.locator('#blok-h2-1d > h3')).toBeVisible()
  await expect(page.locator('#paragraaf-h2-1 > h3')).toBeVisible()
  await geenLegeKoppen(hoofdstuk)

  await gewoon.click()
  await expect(hoofdstuk.locator('[data-verhaal="ja"]')).toHaveCount(0)
  await expect(hoofdstuk.locator('[data-verhaal="nee"]')).not.toHaveCount(0)
  await expect(blok23.locator('[data-verhaal="nee"]')).not.toHaveCount(0)
  // 2.1 heeft dan niets meer: de kop verdwijnt.
  await expect(page.locator('#paragraaf-h2-1 > h3')).toHaveCount(0)
  await expect(page.locator('#blok-h2-1d > h3')).toHaveCount(0)
  await geenLegeKoppen(hoofdstuk)
})

test('paragraaf- en bloktitels zijn klikbaar en openen de eerste opgave eronder (AFG-607) @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  // Vóór AFG-607 was dit platte tekst in een h3: een dode klik, geen link.
  const paragraafKop = page.locator('#paragraaf-h2-1 > h3').getByRole('link')
  await expect(paragraafKop).toHaveAttribute('href', /\/oefenen\?.*q=/)

  const blokKop = page.locator('#blok-h2-1d > h3').getByRole('link')
  await expect(blokKop).toHaveAttribute('href', /\/oefenen\?.*q=/)

  // De eerste klik kan aankomen voordat de pagina klaarstaat; die doet dan
  // niets. Dat overkomt een leerling met een trage verbinding ook.
  await expect(async () => {
    await blokKop.click()
    await expect(page.getByRole('button', { name: 'Nakijken', exact: true })).toBeVisible({
      timeout: 3_000,
    })
  }).toPass({ timeout: 60_000, intervals: [500, 1_000, 2_000] })
})

async function geenLegeKoppen(hoofdstuk: Locator) {
  const blokken = hoofdstuk.locator('[id^="blok-"]')
  const aantalBlokken = await blokken.count()
  for (let i = 0; i < aantalBlokken; i++) {
    const blok = blokken.nth(i)
    const kop = await blok.locator(':scope > h3').count()
    const tegels = await blok.locator('[data-verhaal]').count()
    expect(kop > 0).toBe(tegels > 0)
  }
  const paragrafen = hoofdstuk.locator('[id^="paragraaf-"]')
  const aantalParagrafen = await paragrafen.count()
  for (let i = 0; i < aantalParagrafen; i++) {
    const paragraaf = paragrafen.nth(i)
    const kop = await paragraaf.locator(':scope > h3').count()
    const tegels = await paragraaf.locator('[data-verhaal]').count()
    expect(kop > 0).toBe(tegels > 0)
  }
}

test('een open hoofdstuk klapt weer dicht en blijft dicht @telefoon', async ({ page }) => {
  await page.goto('/nl/oefenen?chapter=h2')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const breed = (page.viewportSize()?.width ?? 0) >= 1024
  if (breed) {
    const h2 = page.locator('aside').getByRole('button', { name: /H2 –/ })
    await expect(h2).toHaveAttribute('aria-expanded', 'true')
    await h2.click()
    await expect(h2).toHaveAttribute('aria-expanded', 'false')
    await expect(page.locator('aside').getByRole('button', { name: /2\.1/ })).toHaveCount(0)
    return
  }

  await page.getByRole('button', { name: /H2 –/ }).click()
  const menu = page.getByRole('dialog')
  const h2 = menu.getByRole('button', { name: /H2 –/ })
  await expect(h2).toHaveAttribute('aria-expanded', 'true')
  await h2.click()
  await expect(h2).toHaveAttribute('aria-expanded', 'false')
  await expect(menu.getByRole('button', { name: /2\.1/ })).toHaveCount(0)
  await expect(menu).toBeVisible()
})

function vakkenOverlappen(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  )
}

test('omhoog scrollen schuift de kop meteen, en het poppetje dekt de link niet @telefoon', async ({
  page,
}) => {
  await page.goto('/nl/oefenen')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()

  const header = page.locator('header')
  const titel = page.getByRole('heading', { level: 1, name: 'Oefenen' })
  const scroller = page.locator('[data-oefen-scroll]')
  // De pagina springt soms naar de laatste som. Daarna meten we vanaf de top.
  await page.waitForTimeout(400)
  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(titel).toBeInViewport()
  const voor = await titel.boundingBox()
  const headerVoor = await header.boundingBox()
  expect(voor && headerVoor && voor.y >= headerVoor.y + headerVoor.height - 1).toBeTruthy()

  const vak = await scroller.boundingBox()
  expect(vak).toBeTruthy()
  await page.mouse.move(vak!.x + vak!.width / 2, vak!.y + Math.min(280, vak!.height / 2))
  await page.mouse.wheel(0, 220)
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeGreaterThan(40)
  const naOmlaag = await scroller.evaluate((el) => el.scrollTop)
  await page.mouse.wheel(0, -220)
  await expect.poll(() => scroller.evaluate((el) => el.scrollTop)).toBeLessThan(naOmlaag - 30)

  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  const terug = await titel.boundingBox()
  const headerNa = await header.boundingBox()
  expect(terug && headerNa && terug.y >= headerNa.y + headerNa.height - 1).toBeTruthy()
  expect(await page.evaluate(() => window.scrollY)).toBe(0)
})

// AFG-595: op de telefoon neemt de voettekst geen vaste ruimte meer in op de
// oefenpagina. Hij scrolt mee binnen hetzelfde scrollgebied als de sommen
// (`[data-oefen-scroll]`), zodat de opgave de volle hoogte krijgt.
test('de voettekst op de oefenpagina is niet vast en komt pas in beeld na scrollen @telefoon', async ({
  page,
}) => {
  test.skip((page.viewportSize()?.width ?? 0) >= 640, 'Dit gaat over telefoonformaat.')

  await page.goto('/nl/oefenen')
  await expect(page.locator('[data-hydrated="ja"]')).toBeAttached()
  await page.waitForTimeout(400)

  const scroller = page.locator('[data-oefen-scroll]')
  // Op deze pagina staat ook nog een verborgen voettekst uit `(paginas)/layout.tsx`
  // (zie `main:has([data-oefen-volledig])` in `globals.css`) — scope daarom op
  // het scrollgebied, anders levert `page.locator('footer')` twee vakken op.
  const footer = scroller.locator('footer')
  const footerLink = scroller.getByRole('link', { name: /integraaloefenen\.nl/ })

  await scroller.evaluate((el) => {
    el.scrollTop = 0
  })
  await expect(footerLink).not.toBeInViewport()
  const positie = await footer.evaluate((el) => getComputedStyle(el).position)
  expect(['fixed', 'sticky']).not.toContain(positie)

  await scroller.evaluate((el) => {
    el.scrollTop = el.scrollHeight
  })
  await expect(footerLink).toBeInViewport()

  const poppetje = await page.getByRole('button', { name: 'Vraag het Aaf' }).boundingBox()
  const link = await footerLink.boundingBox()
  expect(poppetje && link && !vakkenOverlappen(poppetje, link)).toBeTruthy()
})
