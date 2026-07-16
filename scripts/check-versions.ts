import { versions } from '../vocs/versions'

const generatedSnippets = new Map([
  [
    new URL('../vocs/docs/snippets/installation/alloy.toml', import.meta.url),
    `alloy = "${versions.alloy}"\n`,
  ],
  [
    new URL('../vocs/docs/snippets/installation/individual-crates.toml', import.meta.url),
    [
      '[dependencies]',
      `alloy-primitives = { version = "${versions.alloyCore}", default-features = false, features = ["rand", "serde", "map-foldhash"] }`,
      `alloy-provider = { version = "${versions.alloy}", default-features = false, features = ["ipc"] }`,
      '# ..snip..',
      '',
    ].join('\n'),
  ],
])

let valid = true

for (const [url, expected] of generatedSnippets) {
  const actual = await Bun.file(url).text()
  if (actual !== expected) {
    valid = false
    console.error(`${url.pathname} is stale; expected documentation versions from vocs/versions.ts`)
  }
}

if (!valid) process.exit(1)
