import { readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { versions } from '../vocs/versions'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publicDir = join(root, 'vocs/dist/public')
const pagesDir = join(root, 'vocs/docs/pages')
const baseUrl = 'https://alloy.rs'

function absoluteLinks(markdown: string): string {
  return markdown.replace(/]\(\/(?!\/)/g, `](${baseUrl}/`)
}

const llmsPath = join(publicDir, 'llms.txt')
const llmsFullPath = join(publicDir, 'llms-full.txt')
const llms = absoluteLinks(await readFile(llmsPath, 'utf8'))
const llmsFull = absoluteLinks(await readFile(llmsFullPath, 'utf8'))

await writeFile(llmsPath, llms)
await writeFile(llmsFullPath, llmsFull)

if (/]\(\/(?!\/)/.test(llms) || /]\(\/(?!\/)/.test(llmsFull)) {
  throw new Error('Agent text still contains root-relative Markdown links')
}

const sourceByRoute = new Map<string, string>()
for (const file of new Bun.Glob('**/*.{md,mdx}').scanSync({ cwd: pagesDir, onlyFiles: true })) {
  sourceByRoute.set(`/${file.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '')}`, file)
}

function kindFor(pathname: string): string {
  if (pathname.startsWith('/examples/')) return 'example'
  if (pathname.startsWith('/migrating-')) return 'migration'
  if (pathname.startsWith('/reference/')) return 'reference'
  if (pathname.startsWith('/introduction/')) return 'introduction'
  return 'guide'
}

const pages = [...llms.matchAll(/^- \[([^\]]+)]\((https:\/\/alloy\.rs\/[^)]+)\)(?:: (.*))?$/gm)]
  .map((match) => {
    const url = match[2]
    const pathname = new URL(url).pathname
    const source = sourceByRoute.get(pathname)
    const parts = pathname.split('/').filter(Boolean)
    const category = parts[1]
    const name = parts[2]

    return {
      id: pathname,
      title: match[1],
      description: match[3] ?? '',
      kind: kindFor(pathname),
      section: parts[0] ?? 'home',
      url,
      source_url: source
        ? `https://github.com/alloy-rs/docs/blob/main/vocs/docs/pages/${source}`
        : null,
      example_source_url:
        parts[0] === 'examples' && category && name && name !== 'README'
          ? `https://github.com/alloy-rs/examples/blob/main/examples/${category}/examples/${name}.rs`
          : null,
    }
  })
  .filter((page, index, all) => all.findIndex((candidate) => candidate.url === page.url) === index)

const indexedPaths = new Set(pages.map((page) => page.id))
for (const [pathname, source] of sourceByRoute) {
  if (indexedPaths.has(pathname)) continue

  const text = await readFile(join(pagesDir, source), 'utf8')
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1] ?? ''
  const frontmatterTitle = /^title:\s*(.+)$/m.exec(frontmatter)?.[1]
  const heading = /^#\s+(.+)$/m.exec(text)?.[1]
  const parts = pathname.split('/').filter(Boolean)
  const category = parts[1]
  const name = parts[2]
  const fallbackName = (name === 'README' ? `${category} examples` : parts.at(-1) ?? 'Alloy')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())

  pages.push({
    id: pathname,
    title: frontmatterTitle ?? heading ?? fallbackName,
    description:
      /^description:\s*(.+)$/m.exec(frontmatter)?.[1] ??
      (name === 'README' ? `Runnable Alloy ${category} examples` : ''),
    kind: kindFor(pathname),
    section: parts[0] ?? 'home',
    url: `${baseUrl}${pathname}`,
    source_url: `https://github.com/alloy-rs/docs/blob/main/vocs/docs/pages/${source}`,
    example_source_url:
      parts[0] === 'examples' && category && name && name !== 'README'
        ? `https://github.com/alloy-rs/examples/blob/main/examples/${category}/examples/${name}.rs`
        : null,
  })
  indexedPaths.add(pathname)
}

const url = (path: string) => `${baseUrl}${path}`
const topics = [
  {
    id: 'install-and-features',
    intent: 'Install Alloy or choose a minimal dependency and feature set',
    keywords: ['cargo', 'install', 'dependency', 'feature', 'no_std', 'wasm'],
    docs: [url('/introduction/installation'), url('/reference/feature-flags')],
    examples: [],
    features: [],
    configuration: [],
  },
  {
    id: 'connect-provider',
    intent: 'Connect to an RPC endpoint over HTTP, WebSocket, or IPC',
    keywords: ['provider', 'rpc', 'http', 'websocket', 'ws', 'ipc', 'ProviderBuilder'],
    docs: [url('/rpc-providers/introduction'), url('/introduction/getting-started')],
    examples: [url('/examples/providers/http'), url('/examples/providers/ws'), url('/examples/providers/ipc')],
    features: ['provider-http', 'provider-ws', 'provider-ipc'],
    configuration: ['RPC_URL', 'WS_URL', 'IPC_PATH'],
  },
  {
    id: 'stream-chain-data',
    intent: 'Subscribe, poll, resume block or log processing, and handle reorgs',
    keywords: ['subscribe', 'watch', 'poll', 'block', 'log', 'indexer', 'reorg', 'backfill'],
    docs: [url('/rpc-providers/subscriptions-and-polling')],
    examples: [url('/examples/subscriptions/subscribe_blocks'), url('/examples/subscriptions/subscribe_logs')],
    features: ['provider-ws'],
    configuration: ['WS_URL'],
  },
  {
    id: 'contract-interaction',
    intent: 'Generate typed contract bindings and read, write, deploy, or query events',
    keywords: ['contract', 'sol!', 'abi', 'call', 'deploy', 'event', 'revert'],
    docs: [url('/contract-interactions/using-sol!'), url('/contract-interactions/read-contract'), url('/contract-interactions/write-contract')],
    examples: [url('/examples/contracts/README')],
    features: ['contract'],
    configuration: ['RPC_URL'],
  },
  {
    id: 'transactions',
    intent: 'Build, fill, sign, send, and confirm a transaction',
    keywords: ['transaction', 'fill', 'sign', 'send', 'receipt', 'confirm', 'nonce', 'gas'],
    docs: [url('/transactions/introduction'), url('/transactions/transaction-lifecycle')],
    examples: [url('/examples/transactions/README')],
    features: ['provider-http', 'signer-local'],
    configuration: ['RPC_URL', 'PRIVATE_KEY'],
  },
  {
    id: 'blob-transactions',
    intent: 'Build EIP-4844 blobs or EIP-7594 PeerDAS sidecars',
    keywords: ['blob', 'EIP-4844', 'EIP-7594', 'PeerDAS', 'KZG', 'sidecar'],
    docs: [url('/transactions/sending-an-EIP-4844-transaction'), url('/transactions/sending-an-EIP-7594-transaction')],
    examples: [url('/examples/transactions/send_eip4844_transaction'), url('/examples/transactions/send_eip7594_transaction')],
    features: ['kzg'],
    configuration: [],
  },
  {
    id: 'signers-and-wallets',
    intent: 'Choose a local, hardware, cloud, or remote signer and configure EthereumWallet',
    keywords: ['signer', 'wallet', 'private key', 'mnemonic', 'keystore', 'AWS', 'GCP', 'Ledger', 'Trezor', 'Turnkey'],
    docs: [url('/guides/signers-vs-ethereum-wallet')],
    examples: [url('/examples/wallets/README'), url('/examples/wallets/ethereum_wallet')],
    features: ['signer-local'],
    configuration: ['PRIVATE_KEY'],
  },
  {
    id: 'testing',
    intent: 'Test with a mock transport, local node, pinned fork, or live RPC',
    keywords: ['test', 'mock', 'Anvil', 'Geth', 'Reth', 'fork', 'fixture'],
    docs: [url('/guides/testing')],
    examples: [url('/examples/providers/mocking'), url('/examples/node-bindings/README')],
    features: ['provider-anvil-node'],
    configuration: ['RPC_URL'],
  },
  {
    id: 'multiple-networks',
    intent: 'Use Ethereum, AnyNetwork, an ecosystem network, or a custom Network',
    keywords: ['Network', 'AnyNetwork', 'Optimism', 'Base', 'custom chain', 'deserialization'],
    docs: [url('/guides/interacting-with-multiple-networks'), url('/reference/protocol-and-rpc-types')],
    examples: [url('/examples/advanced/any_network')],
    features: ['network'],
    configuration: ['RPC_URL'],
  },
  {
    id: 'provider-reliability',
    intent: 'Configure retries, rate limits, fallbacks, timeouts, and error handling',
    keywords: ['retry', 'backoff', 'rate limit', 'fallback', 'timeout', 'TransportError'],
    docs: [url('/rpc-providers/reliability'), url('/guides/layers')],
    examples: [url('/examples/layers/retry_layer'), url('/examples/layers/fallback_layer')],
    features: ['transport-throttle'],
    configuration: ['RPC_URL', 'RPC_URLS'],
  },
  {
    id: 'rpc-namespaces',
    intent: 'Use debug, trace, txpool, engine, admin, Anvil, MEV, or other RPC methods',
    keywords: ['debug', 'trace', 'txpool', 'engine', 'admin', 'Anvil', 'MEV', 'extension trait'],
    docs: [url('/rpc-providers/rpc-namespaces')],
    examples: [url('/examples/transactions/trace_call'), url('/examples/transactions/debug_trace_call_many')],
    features: ['provider-debug-api', 'provider-trace-api'],
    configuration: ['RPC_URL'],
  },
  {
    id: 'types-and-serialization',
    intent: 'Choose primitives, consensus, RPC, EIP, network, genesis, trie, or serde types',
    keywords: ['primitive', 'consensus', 'rpc type', 'EIP', 'genesis', 'trie', 'serde', 'RLP'],
    docs: [url('/reference/protocol-and-rpc-types'), url('/using-primitive-types/introduction')],
    examples: [url('/examples/providers/embed_consensus_rpc')],
    features: ['consensus', 'eips', 'serde'],
    configuration: [],
  },
  {
    id: 'abi-encoding',
    intent: 'Encode or decode static Solidity types, dynamic ABI, JSON ABI, logs, errors, or call data',
    keywords: ['ABI', 'encode', 'decode', 'sol!', 'DynSol', 'JsonAbi', 'event', 'error'],
    docs: [url('/guides/static-dynamic-abi-in-alloy'), url('/contract-interactions/using-sol!')],
    examples: [url('/examples/sol-macro/README'), url('/examples/advanced/encoding_dyn_abi')],
    features: ['sol-types', 'dyn-abi', 'json-abi'],
    configuration: [],
  },
  {
    id: 'migrate-from-ethers',
    intent: 'Map ethers-rs crates, types, middleware, and conversions to Alloy',
    keywords: ['ethers-rs', 'migration', 'Middleware', 'conversion'],
    docs: [url('/migrating-from-ethers/reference'), url('/migrating-from-ethers/conversions')],
    examples: [],
    features: [],
    configuration: [],
  },
]

const pageUrls = new Set(pages.map((page) => page.url))
for (const topic of topics) {
  for (const target of [...topic.docs, ...topic.examples]) {
    if (!pageUrls.has(target)) throw new Error(`Agent topic ${topic.id} references missing page ${target}`)
  }
}

const index = {
  schema_version: 1,
  project: 'Alloy',
  canonical_base_url: baseUrl,
  target_versions: { alloy: versions.alloy, alloy_core: versions.alloyCore },
  retrieval_order: [
    `${baseUrl}/agent-index.json`,
    `${baseUrl}/llms.txt`,
    'the smallest relevant page and linked runnable examples',
    'https://docs.rs/alloy/latest/alloy/ for exact symbols and feature gates',
    `${baseUrl}/llms-full.txt only when individual page retrieval is unavailable`,
  ],
  resources: {
    agent_guide: `${baseUrl}/introduction/prompting`,
    compact_corpus: `${baseUrl}/llms.txt`,
    full_corpus: `${baseUrl}/llms-full.txt`,
    api_reference: 'https://docs.rs/alloy/latest/alloy/',
    examples_repository: 'https://github.com/alloy-rs/examples',
    source_repository: 'https://github.com/alloy-rs/alloy',
  },
  topics,
  pages,
}

await writeFile(join(publicDir, 'agent-index.json'), `${JSON.stringify(index, null, 2)}\n`)
console.log(`Generated agent-index.json with ${topics.length} topics and ${pages.length} pages.`)
