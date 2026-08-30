const MAX_ZIJDE = 1600
const KWALITEIT = 0.82

/**
 * Schaalt een foto terug tot maximaal 1600 px op de langste zijde en
 * comprimeert naar JPEG. Een gefotografeerde boekpagina blijft daarmee prima
 * leesbaar, terwijl een telefoonfoto van 4 MB terugvalt naar een paar honderd
 * kB. Dat is nodig: een Server Action accepteert maar een paar MB aan
 * formulierdata, en Vercel kapt een request af rond 4,5 MB.
 *
 * Lukt decoderen niet (bijvoorbeeld HEIC in een browser die dat niet kan),
 * dan gaat het originele bestand mee en vangt de groottecontrole het af.
 */
export async function verkleinFoto(bestand: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(bestand)
    const schaal = Math.min(1, MAX_ZIJDE / Math.max(bitmap.width, bitmap.height))
    const breedte = Math.round(bitmap.width * schaal)
    const hoogte = Math.round(bitmap.height * schaal)

    const canvas = document.createElement('canvas')
    canvas.width = breedte
    canvas.height = hoogte
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      bitmap.close()
      return bestand
    }
    ctx.drawImage(bitmap, 0, 0, breedte, hoogte)
    bitmap.close()

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', KWALITEIT),
    )
    // Al klein genoeg? Dan is het origineel prima.
    if (!blob || blob.size >= bestand.size) return bestand

    const naam = `${bestand.name.replace(/\.[^.]+$/, '')}.jpg`
    return new File([blob], naam, { type: 'image/jpeg', lastModified: Date.now() })
  } catch {
    return bestand
  }
}
