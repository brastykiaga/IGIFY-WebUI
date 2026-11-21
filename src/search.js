/**
 * Unified search over the demonstration catalogue and the workspace pages.
 *
 * Deliberately simple and explainable: an item matches when the query appears
 * anywhere in its text, and ranking prefers title matches over body matches.
 * When Migle is connected this module is the seam to replace — the result shape
 * (`kind`, `title`, `snippet`, `type`/`page`) is what the screen renders.
 */

import { CATALOGUE, TYPE_LABELS } from './content/catalogue.js'

/** Which workspace page a record type belongs to. */
export const TYPE_PAGE = {
  news: 'Latest News',
  learn: 'Learn',
  events: 'Community & Events',
  groups: 'Community & Events',
  organisations: 'Community & Events',
  media: 'Listen & Watch',
}

function snippetFor(item, query) {
  const fields = [item.summary, ...(item.body || [])].filter(Boolean)
  const hit = fields.find((field) => field.toLowerCase().includes(query))
  const text = hit || item.summary || ''
  const at = text.toLowerCase().indexOf(query)
  if (at < 0) return text.slice(0, 140)

  const start = Math.max(0, at - 40)
  const end = Math.min(text.length, at + 130)
  return `${start > 0 ? '…' : ''}${text.slice(start, end).trim()}${end < text.length ? '…' : ''}`
}

/**
 * @param {string} query
 * @param {object} environments workspace definitions, for page results
 * @returns {Array<object>} ranked results
 */
export function searchAll(query, environments) {
  const q = String(query || '').trim().toLowerCase()
  if (!q) return []

  const results = []

  for (const [type, items] of Object.entries(CATALOGUE)) {
    for (const item of items) {
      const title = (item.title || '').toLowerCase()
      const summary = (item.summary || '').toLowerCase()
      const body = (item.body || []).join(' ').toLowerCase()
      const meta = (item.meta || []).map((m) => m.value || '').join(' ').toLowerCase()

      if (![title, summary, body, meta].some((field) => field.includes(q))) continue

      let score = 0
      if (title.includes(q)) score += 10
      if (summary.includes(q)) score += 4
      if (body.includes(q)) score += 2
      if (item.title.toLowerCase() === q) score += 5

      results.push({
        kind: 'record',
        type,
        id: item.id,
        title: item.title,
        typeLabel: TYPE_LABELS[type] || type,
        snippet: snippetFor(item, q),
        score,
      })
    }
  }

  // Workspace pages, de-duplicated by name, public first.
  const seen = new Set()
  const order = ['public', 'member', 'org', 'admin']
  for (const env of order) {
    const environment = environments?.[env]
    if (!environment) continue
    for (const page of environment.nav) {
      const key = page.toLowerCase()
      if (seen.has(key) || !key.includes(q)) continue
      seen.add(key)
      results.push({
        kind: 'page',
        env,
        page,
        title: page,
        typeLabel: `${environment.label} page`,
        snippet: `Open the ${page} screen in the ${environment.label} workspace.`,
        score: page.toLowerCase() === q ? 12 : 6,
      })
    }
  }

  return results.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
}
