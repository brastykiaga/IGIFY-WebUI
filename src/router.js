/**
 * Hash routing.
 *
 * The prototype previously changed screens by re-rendering with no address, so
 * nothing could be linked, reloaded or shared. Routes make screens addressable:
 *
 *   #/public/Learn                       workspace page
 *   #/public/Latest%20News               page name with spaces
 *   #/public/Latest%20News/news/kundiawa-market   detail record
 *
 * Parsing validates against the known workspaces and their navigation, so a
 * hand-edited or stale URL falls back rather than rendering an empty screen.
 */

export function routeHash({ env, page, detail } = {}) {
  const parts = [env, encodeURIComponent(page)]
  if (detail?.type && detail?.id) {
    parts.push(encodeURIComponent(detail.type), encodeURIComponent(detail.id))
  }
  return `#/${parts.join('/')}`
}

export function parseRoute(hash, environments) {
  const raw = String(hash || '').replace(/^#\/?/, '')
  if (!raw) return null

  const segments = raw.split('/').map((part) => decodeURIComponent(part))
  const [env, page, type, id] = segments

  if (!env || !page) return null
  const environment = environments[env]
  if (!environment) return null
  if (!environment.nav.includes(page)) return null

  if (type && id) return { env, page, detail: { type, id } }
  return { env, page, detail: null }
}
