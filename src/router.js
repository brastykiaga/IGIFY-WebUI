/**
 * Hash routing.
 *
 * Screens are addressable so they can be linked, reloaded and shared:
 *
 *   #/public/Learn                                 workspace page
 *   #/public/Latest%20News                         page name with spaces
 *   #/public/Latest%20News/news/kundiawa-market    detail record
 *   #/public/Search?q=coffee                       search results
 *
 * Parsing validates against the known workspaces and their navigation, so a
 * hand-edited or stale URL falls back rather than rendering an empty screen.
 * `Search` is accepted in every workspace even though it is not a sidebar item.
 */

const EXTRA_PAGES = new Set(['Search'])

export function routeHash({ env, page, detail, search } = {}) {
  const parts = [env, encodeURIComponent(page)]
  if (detail?.type && detail?.id) {
    parts.push(encodeURIComponent(detail.type), encodeURIComponent(detail.id))
  }
  let hash = `#/${parts.join('/')}`
  if (search) hash += `?q=${encodeURIComponent(search)}`
  return hash
}

export function parseRoute(hash, environments) {
  const raw = String(hash || '').replace(/^#\/?/, '')
  if (!raw) return null

  const [pathPart, queryPart = ''] = raw.split('?')
  const segments = pathPart.split('/').map((part) => decodeURIComponent(part))
  const [env, page, type, id] = segments

  if (!env || !page) return null
  const environment = environments[env]
  if (!environment) return null
  if (!environment.nav.includes(page) && !EXTRA_PAGES.has(page)) return null

  const query = new URLSearchParams(queryPart).get('q') || null

  if (type && id) return { env, page, detail: { type, id }, search: query }
  return { env, page, detail: null, search: query }
}
