import { versions } from '../vocs/versions'

const args = Bun.argv.slice(2)
const updateIndex = args.indexOf('--update')
const requestedAlloyVersion = updateIndex === -1 ? undefined : args[updateIndex + 1]

if (updateIndex !== -1 && !requestedAlloyVersion) {
  console.error('Usage: bun scripts/check-versions.ts --update <version>')
  process.exit(1)
}

if (requestedAlloyVersion && !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(requestedAlloyVersion)) {
  console.error(`Invalid Alloy version: ${requestedAlloyVersion}`)
  process.exit(1)
}

const targetVersions = {
  ...versions,
  alloy: requestedAlloyVersion ?? versions.alloy,
}

const generatedSnippets = new Map([
  [
    new URL('../vocs/docs/snippets/installation/alloy.toml', import.meta.url),
    `alloy = "${targetVersions.alloy}"\n`,
  ],
  [
    new URL('../vocs/docs/snippets/installation/alloy-full.toml', import.meta.url),
    `alloy = { version = "${targetVersions.alloy}", features = ["full"] }\n`,
  ],
  [
    new URL('../vocs/docs/snippets/installation/alloy-minimal.toml', import.meta.url),
    `alloy = { version = "${targetVersions.alloy}", default-features = false, features = ["sol-types"] }\n`,
  ],
  [
    new URL('../vocs/docs/snippets/installation/individual-crates.toml', import.meta.url),
    [
      '[dependencies]',
      `alloy-primitives = { version = "${targetVersions.alloyCore}", default-features = false, features = ["rand", "serde", "map-foldhash"] }`,
      `alloy-provider = { version = "${targetVersions.alloy}", default-features = false, features = ["ipc"] }`,
      '# ..snip..',
      '',
    ].join('\n'),
  ],
])

if (requestedAlloyVersion) {
  const versionsUrl = new URL('../vocs/versions.ts', import.meta.url)
  const source = await Bun.file(versionsUrl).text()
  const updated = source.replace(
    /alloy: '[^']+',/,
    `alloy: '${requestedAlloyVersion}',`,
  )

  if (updated === source && requestedAlloyVersion !== versions.alloy) {
    console.error('Could not update Alloy version in vocs/versions.ts')
    process.exit(1)
  }

  await Bun.write(versionsUrl, updated)
  for (const [url, expected] of generatedSnippets) await Bun.write(url, expected)
  console.log(`Updated documented Alloy version to ${requestedAlloyVersion}.`)
  process.exit(0)
}

let valid = true

for (const [url, expected] of generatedSnippets) {
  const actual = await Bun.file(url).text()
  if (actual !== expected) {
    valid = false
    console.error(`${url.pathname} is stale; expected documentation versions from vocs/versions.ts`)
  }
}

if (!valid) process.exit(1)
