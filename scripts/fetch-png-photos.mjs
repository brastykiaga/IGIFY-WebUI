/**
 * Search Wikimedia Commons for Papua New Guinea photographs per module and
 * download 800px thumbnails for review.
 *
 * Commons is used directly (rather than an aggregator) because it exposes
 * licence metadata and a resized thumbnail URL in a single API call, which
 * keeps downloads small and provenance accurate.
 *
 * Only 800px thumbnails are fetched: enough to review and enough for the final
 * 800x450 card crop.
 *
 * Usage: node scripts/fetch-png-photos.mjs [stagingDir]
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = process.argv[2] || join(process.env.TEMP || '.', 'igify-candidates')
const UA = 'IGIFY-prototype/1.1 (image review; contact: project owner)'
const API = 'https://commons.wikimedia.org/w/api.php'

const CATEGORIES = {
  news: ['Kundiawa', 'Simbu Province', 'Port Moresby town'],
  learn: ['Papua New Guinea school', 'Papua New Guinea classroom', 'Papua New Guinea students'],
  discover: ['Kundiawa', 'Papua New Guinea highlands', 'Papua New Guinea landscape'],
  community: ['Goroka Show', 'Papua New Guinea village', 'Simbu Province'],
  faith: ['category:Churches in Papua New Guinea', 'church Papua New Guinea'],
  farming: [
    'incategory:"Agriculture in Papua New Guinea"',
    'Papua New Guinea coffee',
    'Papua New Guinea garden',
  ],
  media: ['Papua New Guinea dance', 'Papua New Guinea music', 'Papua New Guinea television'],
}

const PER_CATEGORY = 4

// Optional third argument restricts the run, e.g. "news,faith,media".
const ONLY = process.argv[3] ? new Set(process.argv[3].split(',')) : null

// Reject maps, diagrams, documents and other non-photographic material.
const EXCLUDE = /(map|diagram|chart|logo|coat of arms|stamp|banknote|coin|drawing|engraving|poster|book|document|manuscript|sign|plaque|graph)/i

// Licences that need no more than attribution. Share-alike is avoided so the
// prototype does not inherit obligations it has not assessed.
const ALLOWED = /^(cc0|public domain|pd|cc by( \d(\.\d)?)?|cc by-sa( \d(\.\d)?)?)$/i

function cleanHtml(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

// Commons rate-limits aggressive clients; space out requests.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function search(query) {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    generator: 'search',
    gsrsearch: `${query} filetype:bitmap`,
    gsrnamespace: '6',
    gsrlimit: '25',
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '800',
  })

  await sleep(900)
  const res = await fetch(`${API}?${params}`, { headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()
  return json?.query?.pages || []
}

// Some subjects are better covered by an explicit Commons category than by
// full-text search.
async function searchCategory(category) {
  const listParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    list: 'categorymembers',
    cmtitle: `Category:${category}`,
    cmtype: 'file',
    cmlimit: '20',
  })

  await sleep(900)
  const listRes = await fetch(`${API}?${listParams}`, { headers: { 'User-Agent': UA } })
  if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`)
  const listJson = await listRes.json()
  const titles = (listJson?.query?.categorymembers || []).map((m) => m.title).slice(0, 20)
  if (!titles.length) return []

  const infoParams = new URLSearchParams({
    action: 'query',
    format: 'json',
    formatversion: '2',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url|size|extmetadata',
    iiurlwidth: '800',
  })

  await sleep(900)
  const infoRes = await fetch(`${API}?${infoParams}`, { headers: { 'User-Agent': UA } })
  if (!infoRes.ok) throw new Error(`HTTP ${infoRes.status}`)
  const infoJson = await infoRes.json()
  return infoJson?.query?.pages || []
}

async function download(url, dest) {
  const res = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const type = res.headers.get('content-type') || ''
  if (!type.startsWith('image/')) throw new Error(`not an image: ${type}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 3000) throw new Error(`too small: ${buf.length}`)
  await writeFile(dest, buf)
  return buf.length
}

function score(info) {
  const ar = info.width && info.height ? info.width / info.height : 0
  let s = 0
  if (ar >= 1.5 && ar <= 1.9) s += 3
  else if (ar >= 1.3 && ar <= 2.1) s += 1
  if (info.width >= 2000) s += 3
  else if (info.width >= 1200) s += 2
  else if (info.width >= 800) s += 1
  return s
}

async function main() {
  await mkdir(OUT, { recursive: true })
  const manifest = {}

  for (const [category, queries] of Object.entries(CATEGORIES)) {
    if (ONLY && !ONLY.has(category)) continue
    const picked = []
    const seen = new Set()

    for (const query of queries) {
      if (picked.length >= PER_CATEGORY) break
      let pages
      try {
        pages = query.startsWith('category:')
          ? await searchCategory(query.slice('category:'.length))
          : await search(query)
      } catch (err) {
        console.error(`  ${category}: "${query}" failed: ${err.message}`)
        continue
      }

      const rows = []
      for (const page of pages) {
        const info = page.imageinfo?.[0]
        if (!info?.thumburl) continue
        const meta = info.extmetadata || {}
        const licence = cleanHtml(meta.LicenseShortName?.value)
        const title = page.title.replace(/^File:/, '')
        if (EXCLUDE.test(title)) continue
        if (!ALLOWED.test(licence)) continue
        rows.push({ page, info, meta, licence, title, query })
      }

      for (const row of rows.sort((a, b) => score(b.info) - score(a.info))) {
        if (picked.length >= PER_CATEGORY) break
        if (seen.has(row.page.title)) continue
        seen.add(row.page.title)
        picked.push(row)
      }
    }

    console.log(`\n${category}: ${picked.length} candidate(s)`)
    manifest[category] = []

    for (let i = 0; i < picked.length; i++) {
      const { info, meta, licence, title, query, page } = picked[i]
      const file = `${category}-${i + 1}.jpg`
      try {
        const bytes = await download(info.thumburl, join(OUT, file))
        manifest[category].push({
          file,
          bytes,
          title,
          creator: cleanHtml(meta.Artist?.value),
          license: licence,
          licenseUrl: cleanHtml(meta.LicenseUrl?.value),
          descriptionUrl: info.descriptionurl,
          originalUrl: info.url,
          width: info.width,
          height: info.height,
          query,
          page: page.title,
        })
        console.log(`  ${file}  ${info.width}x${info.height}  ${licence}  ${title}`)
      } catch (err) {
        console.log(`  FAIL ${file}  ${err.message}`)
      }
    }
  }

  await writeFile(join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2))
  console.log(`\nmanifest: ${join(OUT, 'manifest.json')}`)
}

main()

