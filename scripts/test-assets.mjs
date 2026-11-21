/**
 * Production bundle checks.
 *
 * The service worker is disabled in development, so offline behaviour can only
 * be verified against a real build. This checks the things that silently break
 * a deployed static site: precached paths that were never emitted, manifest
 * icons at the wrong path, and image references with no file behind them.
 *
 *   npm run build && node scripts/test-assets.mjs
 */

import { readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'

const DIST = 'dist'
let failures = 0

function check(label, condition, detail = '') {
  if (condition) console.log(`ok    ${label}`)
  else {
    failures++
    console.error(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`)
  }
}

async function exists(path) {
  try {
    const info = await stat(path)
    return info.isFile() && info.size > 0
  } catch (err) {
    return false
  }
}

// ── Everything the built page references must exist ──────────────────────
const html = await readFile(join(DIST, 'index.html'), 'utf8')
const refs = [...html.matchAll(/(?:src|href)="(\/[^"]+)"/g)].map((m) => m[1])
check('index.html references at least one asset', refs.length > 0)

for (const ref of refs) {
  const file = join(DIST, ref.replace(/^\//, ''))
  check(`page reference exists: ${ref}`, await exists(file))
}

// ── Service worker precache list ─────────────────────────────────────────
const sw = await readFile(join(DIST, 'sw.js'), 'utf8')
const shellMatch = sw.match(/const SHELL = \[([\s\S]*?)\]/)
check('service worker declares a precache list', Boolean(shellMatch))

if (shellMatch) {
  const shell = [...shellMatch[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
  check('precache list is not empty', shell.length > 0)
  for (const entry of shell) {
    const file = join(DIST, entry.replace(/^\//, '') || 'index.html')
    check(`precached path exists: ${entry}`, await exists(file))
  }
}

// ── Manifest icons ───────────────────────────────────────────────────────
const manifest = JSON.parse(await readFile(join(DIST, 'manifest.json'), 'utf8'))
check('manifest declares icons', Array.isArray(manifest.icons) && manifest.icons.length > 0)
for (const icon of manifest.icons || []) {
  const file = join(DIST, icon.src.replace(/^\//, ''))
  check(`manifest icon exists: ${icon.src}`, await exists(file))
}
check('manifest declares a maskable icon', (manifest.icons || []).some((i) => String(i.purpose).includes('maskable')))

// ── Card images referenced by the app ────────────────────────────────────
const main = await readFile('src/main.js', 'utf8')
const keys = [...main.matchAll(/^\s+(?:'[^']+'|[A-Za-z][\w &]*?):\s*'([a-z]+)',$/gm)].map((m) => m[1])
const unique = [...new Set(keys)]
check('image map found', unique.length > 0)

for (const key of unique) {
  const file = join('public', 'images', `card-${key}.jpg`)
  check(`card image exists: card-${key}.jpg`, await exists(file))
}

// ── Service worker registration is production-only ───────────────────────
const scripts = refs.filter((ref) => ref.endsWith('.js'))
check('page loads a built script', scripts.length > 0)
for (const ref of scripts) {
  const js = await readFile(join(DIST, ref.replace(/^\//, '')), 'utf8')
  check(`service worker registration present in ${ref}`, js.includes('serviceWorker'))
}

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
