import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, posix, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const pagesRoot = join(root, 'vocs/docs/pages')
const publicRoot = join(root, 'vocs/public')
const sidebarPath = join(root, 'vocs/sidebar.ts')

const pageFiles = [
  ...new Bun.Glob('**/*.{md,mdx}').scanSync({ cwd: pagesRoot, onlyFiles: true }),
].sort()

function routeFor(file: string): string {
  return `/${file.replace(/\\/g, '/').replace(/\.(md|mdx)$/, '')}`
}

function headingAnchors(markdown: string): Set<string> {
  const anchors = new Set<string>()
  const seen = new Map<string, number>()
  let inFence = false

  for (const line of markdown.split(/\r?\n/)) {
    if (/^\s*```/.test(line)) {
      inFence = !inFence
      continue
    }
    if (inFence) continue

    const match = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!match) continue

    const base = match[2]
      .replace(/<[^>]+>/g, '')
      .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
      .replace(/[`*_~]/g, '')
      .toLowerCase()
      .replace(/[^\p{Letter}\p{Number}\s_-]/gu, '')
      .trim()
      .replace(/\s+/g, '-')

    const count = seen.get(base) ?? 0
    seen.set(base, count + 1)
    anchors.add(count === 0 ? base : `${base}-${count}`)
  }

  return anchors
}

const pages = new Map<string, { file: string; text: string; anchors: Set<string> }>()
for (const file of pageFiles) {
  const text = readFileSync(join(pagesRoot, file), 'utf8')
  pages.set(routeFor(file), { file, text, anchors: headingAnchors(text) })
}

const errors: string[] = []

function validateTarget(sourceRoute: string, sourceFile: string, rawTarget: string): void {
  if (!rawTarget || /^[a-z][a-z+.-]*:/i.test(rawTarget) || rawTarget.startsWith('//')) return

  const target = rawTarget.replace(/^<|>$/g, '')
  if (target.startsWith('~')) return

  const [withoutHash, rawAnchor] = target.split('#', 2)
  const withoutQuery = withoutHash.split('?', 1)[0]
  let route = sourceRoute

  if (target.startsWith('#')) {
    errors.push(`${sourceFile}: internal links must be root-relative: ${rawTarget}`)
  }

  if (withoutQuery) {
    if (!withoutQuery.startsWith('/')) {
      errors.push(`${sourceFile}: internal links must be root-relative: ${rawTarget}`)
    }

    if (withoutQuery.startsWith('/')) {
      route = withoutQuery.length > 1 ? withoutQuery.replace(/\/$/, '') : '/'
      if (route === '/' || existsSync(join(publicRoot, route.slice(1)))) return
    } else {
      route = posix.normalize(posix.join(posix.dirname(sourceRoute), withoutQuery))
      route = route.replace(/\.(md|mdx)$/, '').replace(/\/$/, '')
      if (!route.startsWith('/')) route = `/${route}`
    }
  }

  const targetPage = pages.get(route)
  if (!targetPage) {
    errors.push(`${sourceFile}: internal target does not exist: ${rawTarget}`)
    return
  }

  if (rawAnchor) {
    const anchor = decodeURIComponent(rawAnchor).toLowerCase()
    if (!targetPage.anchors.has(anchor)) {
      errors.push(`${sourceFile}: heading does not exist: ${rawTarget}`)
    }
  }
}

for (const [route, page] of pages) {
  const isGeneratedExample = page.file.startsWith('examples/')
  if (!isGeneratedExample) {
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(page.text)?.[1]
    if (!frontmatter || !/^description:\s*\S+/m.test(frontmatter)) {
      errors.push(`${page.file}: hand-written pages require a frontmatter description`)
    }

    for (const forbidden of [
      'ethereum.reth.rs',
      'reth-ethereum.ithaca.xyz',
      'base-sepolia.ithaca.xyz',
      't.me/ethers_rs',
    ]) {
      if (page.text.toLowerCase().includes(forbidden)) {
        errors.push(`${page.file}: contains retired or shared endpoint/reference: ${forbidden}`)
      }
    }
  }

  for (const match of page.text.matchAll(/!?\[[^\]]*]\((<?[^)\s>]+>?)/g)) {
    validateTarget(route, page.file, match[1])
  }
  for (const match of page.text.matchAll(/\b(?:href|src)\s*=\s*["']([^"']+)["']/g)) {
    validateTarget(route, page.file, match[1])
  }
}

const sidebar = readFileSync(sidebarPath, 'utf8')
for (const match of sidebar.matchAll(/\blink:\s*['"]([^'"]+)['"]/g)) {
  validateTarget('/index', 'vocs/sidebar.ts', match[1])
}

if (errors.length) {
  for (const error of [...new Set(errors)].sort()) console.error(error)
  process.exit(1)
}

console.log(`Validated ${pages.size} documentation routes and their internal links.`)
