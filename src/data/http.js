/**
 * HTTP data adapter.
 *
 * Implements the same interface as `createLocalStore()` in `local.js`, but
 * against the endpoints in docs/API-CONTRACT.md. Methods return Promises, so
 * the interface must await them (see the migration note in index.js).
 *
 * Writes are optimistic: they are queued in the outbox and appear immediately
 * with `pending: true`, then flushed to the server. Reads come from the server
 * cache held by the service worker and the browser's HTTP cache.
 *
 * Not yet wired into the UI: `src/data/index.js` still exports the local store
 * until the screens are migrated to await. This adapter is covered by
 * scripts/test-http-store.mjs against scripts/mock-api.mjs.
 */

import { createOutbox } from './outbox.js'

const PREFS_KEY = 'igify.prefs.v1'
const DEFAULT_PREFS = {
  env: 'public',
  page: 'Home',
  theme: 'classic',
  dark: false,
  sidebar: false,
  collapsed: false,
}

const COLLECTIONS = ['users', 'organisations', 'content', 'announcements', 'groups', 'events']

function pickPrefs(source) {
  const out = {}
  for (const key of Object.keys(DEFAULT_PREFS)) {
    if (source && key in source) out[key] = source[key]
  }
  return out
}

function toRecord(row) {
  return {
    id: row.id,
    title: row.title,
    detail: row.detail || '',
    status: row.status,
    at: row.createdAt ? Date.parse(row.createdAt) : Date.now(),
    version: row.version || 1,
    pending: false,
  }
}

function toNotification(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    at: row.createdAt ? Date.parse(row.createdAt) : Date.now(),
    read: Boolean(row.read),
  }
}

export function createHttpStore(baseUrl, options = {}) {
  const fetchImpl = options.fetchImpl || globalThis.fetch
  const storage = options.storage || globalThis.localStorage
  const getToken = options.getToken || (() => null)

  if (!baseUrl) throw new Error('createHttpStore requires a base URL')

  const root = `${String(baseUrl).replace(/\/+$/, '')}/api/v1`

  async function request(path, { method = 'GET', body } = {}) {
    const token = getToken()
    const headers = { Accept: 'application/json' }
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetchImpl(`${root}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })

    if (res.status === 204) return null

    const text = await res.text()
    let data = null
    try {
      data = text ? JSON.parse(text) : null
    } catch (err) {
      data = null
    }

    if (!res.ok) {
      const error = new Error(data?.error?.message || `HTTP ${res.status}`)
      error.code = data?.error?.code || 'http_error'
      error.status = res.status
      throw error
    }
    return data
  }

  const outbox = createOutbox({
    storage,
    now: options.now,
    send: async (item) => {
      // The server dedupes on clientId, so replaying after a timeout is safe.
      await request(`/${item.collection}`, {
        method: 'POST',
        body: { ...item.payload, clientId: item.clientId },
      })
    },
  })

  function getPreferences() {
    try {
      const raw = storage.getItem(PREFS_KEY)
      return { ...DEFAULT_PREFS, ...pickPrefs(raw ? JSON.parse(raw) : null) }
    } catch (err) {
      return { ...DEFAULT_PREFS }
    }
  }

  return {
    kind: 'http',

    // ── Session and profile ──────────────────────────────────
    async getSession() {
      return request('/auth/session')
    },

    async getProfile() {
      const me = await request('/me')
      return {
        name: me.displayName || 'Guest user',
        role: (me.roles && me.roles[0]) || 'Registered member',
        kyc: me.identity?.state || 'KYC pending',
      }
    },

    async updateProfile({ name } = {}) {
      if (typeof name !== 'string' || !name.trim()) return this.getProfile()
      const me = await request('/me', { method: 'PATCH', body: { displayName: name.trim() } })
      return {
        name: me.displayName,
        role: (me.roles && me.roles[0]) || 'Registered member',
        kyc: me.identity?.state || 'KYC pending',
      }
    },

    // ── Notifications ────────────────────────────────────────
    async listNotifications() {
      const data = await request('/me/notifications')
      return (data?.items || []).map(toNotification)
    },

    /**
     * Notifications are generated server-side by the action that caused them.
     * This exists for interface parity; it refreshes rather than writes.
     */
    async addNotification() {
      return this.listNotifications()
    },

    async markAllRead() {
      await request('/me/notifications/read-all', { method: 'POST' })
      return this.listNotifications()
    },

    async clearNotifications() {
      await request('/me/notifications', { method: 'DELETE' })
      return []
    },

    // ── Records ──────────────────────────────────────────────
    async listRecords(collection) {
      const data = await request(`/${collection}`)
      return (data?.items || []).map(toRecord)
    },

    async getRecord(collection, id) {
      return toRecord(await request(`/${collection}/${id}`))
    },

    async updateRecord(collection, id, patch = {}) {
      const row = await request(`/${collection}/${id}`, { method: 'PATCH', body: patch })
      return toRecord(row)
    },

    /** Transitions are actions, never field writes (see the API contract). */
    async transitionRecord(collection, id, { to, note = '' } = {}) {
      const action = { submitted: 'submit', approved: 'approve', rejected: 'reject', published: 'publish' }[to]
      if (!action) throw new Error(`Unsupported transition: ${to}`)
      const row = await request(`/${collection}/${id}/${action}`, { method: 'POST', body: { note } })
      return toRecord(row)
    },

    async listAudit() {
      const data = await request('/audit')
      return Array.isArray(data?.items) ? data.items : []
    },

    async getAudit(id) {
      return request(`/audit/${id}`)
    },

    async allRecords() {
      const entries = await Promise.all(
        COLLECTIONS.map(async (collection) => [collection, await this.listRecords(collection)])
      )
      return Object.fromEntries(entries)
    },

    async createRecord(collection, { title, detail = '', status = 'Draft' } = {}) {
      const item = outbox.enqueue({ collection, payload: { title, detail, status } })

      // Try immediately; if the link is down the item simply stays queued.
      outbox.flush().catch(() => {})

      return {
        id: `local-${item.clientId}`,
        title,
        detail,
        status,
        at: Date.now(),
        version: 1,
        pending: true,
      }
    },

    // ── Offline housekeeping ─────────────────────────────────
    async sync() {
      const result = await outbox.flush()
      return result
    },

    outbox,

    // ── Interface preferences ────────────────────────────────
    getPreferences,

    setPreferences(patch = {}) {
      const next = { ...getPreferences(), ...pickPrefs(patch) }
      try {
        storage.setItem(PREFS_KEY, JSON.stringify(pickPrefs(next)))
      } catch (err) {
        /* preferences are cosmetic; failing to persist them is not fatal */
      }
      return { ...next }
    },
  }
}
