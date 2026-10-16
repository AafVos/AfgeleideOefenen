// Leest de status en de foutregels van een Workers-bouw.
// Waarden van variabelen, sleutels en e-mailadressen worden niet afgedrukt.
//
//   CLOUDFLARE_API_TOKEN=... UUIDS="<uuid> <uuid>" node scripts/bouwlog.mjs

const account = '63fa4eae83e6c6a3fcd67ca9a7bb5e25'
const token = process.env.CLOUDFLARE_API_TOKEN
const uuids = (process.env.UUIDS ?? '')
  .split(/[\s,]+/)
  .map((uuid) => uuid.trim())
  .filter(Boolean)

if (!token) {
  console.error('Geen CLOUDFLARE_API_TOKEN.')
  process.exit(2)
}
if (uuids.length === 0 || uuids.some((uuid) => !/^[0-9a-f-]{36}$/i.test(uuid))) {
  console.error('Geef minstens één bouw-uuid mee, alleen hex en streepjes.')
  process.exit(2)
}

function scherm(tekst) {
  return String(tekst)
    .replace(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, '<email>')
    .replace(/(authorization:\s*)\S+/gi, '$1<weggelaten>')
    .replace(/(bearer\s+)\S+/gi, '$1<weggelaten>')
    .replace(/[A-Za-z0-9_\-]{32,}/g, '<id>')
}

async function vraag(pad) {
  const antwoord = await fetch(`https://api.cloudflare.com/client/v4${pad}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const tekst = await antwoord.text()
  let json
  try {
    json = JSON.parse(tekst)
  } catch {
    json = null
  }
  return { status: antwoord.status, json }
}

function regelsVan(json) {
  const regels = json?.result?.lines
  if (!Array.isArray(regels)) return []
  return regels.map((regel) => (Array.isArray(regel) ? String(regel[1] ?? '') : String(regel)))
}

const tagAntwoord = await vraag(`/accounts/${account}/workers/scripts`)
const scripts = tagAntwoord.json?.result
const onze = Array.isArray(scripts) ? scripts.find((item) => item.id === 'afgeleide-oefenen') : null
console.log(`scripts-http=${tagAntwoord.status} worker-tag=${onze ? 'gevonden' : 'niet-gevonden'}`)

if (onze?.tag) {
  const config = await vraag(`/accounts/${account}/builds/workers/${onze.tag}`)
  console.log(`config-http=${config.status}`)
  const resultaat = config.json?.result
  const triggers = []
  if (resultaat && typeof resultaat === 'object') {
    for (const [sleutel, waarde] of Object.entries(resultaat)) {
      if (waarde && typeof waarde === 'object' && ('build_command' in waarde || 'deploy_command' in waarde)) {
        triggers.push([sleutel, waarde])
      }
      if (Array.isArray(waarde)) {
        for (const item of waarde) {
          if (item && typeof item === 'object' && ('build_command' in item || 'deploy_command' in item)) {
            triggers.push([sleutel, item])
          }
        }
      }
    }
  }
  if (triggers.length === 0 && config.json && config.status !== 200) {
    console.log(`config-fout=${scherm(JSON.stringify(config.json.errors ?? config.json)).slice(0, 300)}`)
  }
  for (const [naam, trigger] of triggers) {
    const variabelen = trigger.environment_variables
    const namen = variabelen && typeof variabelen === 'object' ? Object.keys(variabelen).sort() : []
    console.log(
      [
        `trigger=${naam}`,
        `tak=${scherm(trigger.branch_includes ?? trigger.branch ?? '')}`,
        `bouw=${scherm(trigger.build_command ?? '')}`,
        `uitrollen=${scherm(trigger.deploy_command ?? '')}`,
        `variabelen=${namen.join(',') || '(geen)'}`,
      ].join(' | '),
    )
  }
}

const foutpatroon = /error|fail|fout|must match|✘|denied|forbidden|unauthorized/i

for (const uuid of uuids) {
  console.log(`\n# bouw ${uuid}`)
  const bouw = await vraag(`/accounts/${account}/builds/builds/${uuid}`)
  console.log(`bouw-http=${bouw.status}`)
  const resultaat = bouw.json?.result
  if (!resultaat) {
    console.log(`bouw-fout=${scherm(JSON.stringify(bouw.json?.errors ?? bouw.json)).slice(0, 400)}`)
    continue
  }
  const meta = resultaat.build_trigger_metadata ?? {}
  const variabelen = meta.environment_variables
  const namen = variabelen && typeof variabelen === 'object' ? Object.keys(variabelen).sort() : []
  console.log(
    [
      `uitkomst=${resultaat.build_outcome ?? ''}`,
      `status=${resultaat.status ?? ''}`,
      `bron=${meta.build_trigger_source ?? ''}`,
      `tak=${scherm(meta.branch ?? '')}`,
      `bouw=${scherm(meta.build_command ?? '')}`,
      `uitrollen=${scherm(meta.deploy_command ?? '')}`,
      `variabelen=${namen.join(',') || '(geen)'}`,
      `trigger=${scherm(resultaat.trigger?.trigger_name ?? '')}`,
      `script-tag-gelijk=${resultaat.trigger?.external_script_id && onze?.tag ? resultaat.trigger.external_script_id === onze.tag : 'onbekend'}`,
    ].join(' | '),
  )

  const logs = await vraag(`/accounts/${account}/builds/builds/${uuid}/logs`)
  console.log(`log-http=${logs.status}`)
  const regels = regelsVan(logs.json).filter((regel) => foutpatroon.test(regel))
  if (regels.length === 0) {
    const laatste = regelsVan(logs.json).slice(-8).map(scherm)
    console.log(laatste.length ? `laatste=\n${laatste.join('\n')}` : 'geen logregels')
    if (logs.status !== 200) {
      console.log(`log-fout=${scherm(JSON.stringify(logs.json?.errors ?? '')).slice(0, 300)}`)
    }
  } else {
    console.log(regels.slice(-30).map(scherm).join('\n'))
  }
}
