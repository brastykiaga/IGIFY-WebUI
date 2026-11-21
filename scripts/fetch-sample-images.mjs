/**
 * Download sample card photographs for the prototype.
 *
 * These are generic placeholder photographs, not IGIFY content. They exist so
 * the card layout can be evaluated with real imagery. Replace them with IGIFY's
 * own provincial photographs before any public or production use.
 *
 * Source: Lorem Picsum (https://picsum.photos), which serves photographs under
 * the Unsplash licence (free for commercial and non-commercial use, no
 * attribution required). Images are downloaded into the repository so the app
 * stays offline-first rather than hotlinking a third party.
 *
 * Usage: node scripts/fetch-sample-images.mjs [outputDir]
 */

import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const OUT = process.argv[2] || 'public/images'
const WIDTH = 800
const HEIGHT = 450

const IMAGES = {
  news: 'igify-news',
  learn: 'igify-learn',
  discover: 'igify-discover',
  community: 'igify-community',
  faith: 'igify-faith',
  farming: 'igify-farming',
  media: 'igify-media',
}

async function download(url, attempts = 3) {
  for (let i = 1; i <= attempts; i++) {
    try {
      const res = await fetch(url, { redirect: 'follow' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 5000) throw new Error(`suspiciously small (${buf.length} bytes)`)
      // JPEG magic number check
      if (buf[0] !== 0xff || buf[1] !== 0xd8) throw new Error('not a JPEG')
      return buf
    } catch (err) {
      if (i === attempts) throw err
      await new Promise((r) => setTimeout(r, 1500 * i))
    }
  }
}

async function main() {
  await mkdir(OUT, { recursive: true })
  let failures = 0

  for (const [name, seed] of Object.entries(IMAGES)) {
    const url = `https://picsum.photos/seed/${seed}/${WIDTH}/${HEIGHT}`
    const dest = join(OUT, `card-${name}.jpg`)
    try {
      const buf = await download(url)
      await writeFile(dest, buf)
      console.log(`ok   ${dest} (${buf.length} bytes)`)
    } catch (err) {
      failures++
      console.error(`FAIL ${dest}: ${err.message}`)
    }
  }

  if (failures) {
    console.error(`\n${failures} image(s) failed. Network may be unavailable.`)
    process.exitCode = 1
  }
}

main()
