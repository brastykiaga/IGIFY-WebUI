/**
 * Local data adapter.
 *
 * This is the only module that touches localStorage. Screens call the store
 * interface instead, so the persistence mechanism can be replaced without
 * editing UI code. A future HTTP adapter must implement the same methods
 * against the endpoints in docs/API-CONTRACT.md.
 *
 * Methods are synchronous because localStorage is. An HTTP adapter will return
 * Promises, so call sites are written to be await-ready: they refresh from the
 * store after every mutation rather than assuming the in-memory shape.
 */

const PREFS_KEY = 'igify-webui-v1'
const DATA_KEY = 'igify-webui-data-v1'
const MAX_NOTIFICATIONS = 20

import { canTransition, isEditable } from '../content/workflow.js'
const DEFAULT_PREFS = {
  env: 'public',
  page: 'Home',
  theme: 'classic',
  dark: false,
  sidebar: false,
  collapsed: false,
}

const DEFAULT_RECORDS = {
  users: [],
  organisations: [],
  content: [],
  announcements: [],
  groups: [],
  events: [],
}

const DEFAULT_PROFILE = { name: 'Guest user', role: 'Registered member', kyc: 'KYC pending' }

const clone = (value) => JSON.parse(JSON.stringify(value))

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    return null
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (err) {
    /* storage full or unavailable — the interface keeps working in memory */
  }
}

function pickPrefs(source) {
  const out = {}
  for (const key of Object.keys(DEFAULT_PREFS)) {
    if (source && key in source) out[key] = source[key]
  }
  return out
}

/**
 * Before the data layer existed, profile, notifications and created records
 * lived inside the preferences object. Move them once so devices that already
 * used the prototype keep their data.
 */
function migrateLegacyState() {
  const prefs = readJson(PREFS_KEY)
  if (!prefs) return
  const hasDomain = prefs.profile || prefs.notifications || prefs.items
  if (!hasDomain) return

  const existing = readJson(DATA_KEY) || {}
  const data = {
    // Legacy domain data means this device has already used the prototype, so
    // it is not a fresh install and must not be reseeded.
    seeded: true,
    profile: { ...clone(DEFAULT_PROFILE), ...(existing.profile || {}) },
    notifications: Array.isArray(existing.notifications) ? existing.notifications : [],
    records: { ...clone(DEFAULT_RECORDS), ...(existing.records || {}) },
    audit: Array.isArray(existing.audit) ? existing.audit : [],
  }

  if (prefs.profile) data.profile = { ...data.profile, ...prefs.profile }
  if (Array.isArray(prefs.notifications) && prefs.notifications.length && !data.notifications.length) {
    data.notifications = prefs.notifications
  }
  if (prefs.items) {
    for (const [collection, items] of Object.entries(prefs.items)) {
      if (Array.isArray(items) && items.length && !data.records[collection]?.length) {
        data.records[collection] = items
      }
    }
  }

  writeJson(DATA_KEY, data)

  delete prefs.profile
  delete prefs.notifications
  delete prefs.items
  writeJson(PREFS_KEY, pickPrefs(prefs))
}

function seedNotifications(data) {
  data.notifications = [
    {
      id: 'seed-welcome',
      title: 'Welcome to IGIFY',
      body: 'Notifications are stored on this device in the prototype.',
      at: Date.now(),
      read: false,
    },
    {
      id: 'seed-offline',
      title: 'Offline-first enabled',
      body: 'The app shell is cached and works without an internet connection.',
      at: Date.now(),
      read: false,
    },
  ]
}

export function createLocalStore() {
  migrateLegacyState()

  const stored = readJson(DATA_KEY) || {}
  const data = {
    seeded: Boolean(stored.seeded),
    profile: { ...clone(DEFAULT_PROFILE), ...(stored.profile || {}) },
    notifications: Array.isArray(stored.notifications) ? stored.notifications : [],
    records: { ...clone(DEFAULT_RECORDS), ...(stored.records || {}) },
    audit: Array.isArray(stored.audit) ? stored.audit : [],
  }

  // Seed once, and never overwrite notifications that already exist (a stored
  // inbox may predate the seeded flag).
  if (!data.seeded && data.notifications.length === 0) {
    seedNotifications(data)
    data.seeded = true
  }

  const persist = () => writeJson(DATA_KEY, data)

  // Persist the migration/seed result on first construction.
  persist()

  const MAX_AUDIT = 200

  function appendAudit({ actor = 'Unknown', action, target, note = '' }) {
    data.audit.unshift({
      id: `aud-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: Date.now(),
      actor: String(actor),
      action: String(action),
      target,
      outcome: 'success',
      note: String(note || ''),
    })
    if (data.audit.length > MAX_AUDIT) data.audit.length = MAX_AUDIT
  }

  function ensureCollection(collection) {
    if (!Array.isArray(data.records[collection])) data.records[collection] = []
    return data.records[collection]
  }

  return {
    kind: 'local',

    // ── Profile ──────────────────────────────────────────────
    getProfile() {
      return { ...data.profile }
    },

    updateProfile({ name } = {}) {
      if (typeof name === 'string' && name.trim()) {
        data.profile = { ...data.profile, name: name.trim() }
        persist()
      }
      return { ...data.profile }
    },

    // ── Notifications ────────────────────────────────────────
    listNotifications() {
      return data.notifications.map((n) => ({ ...n }))
    },

    addNotification({ title, body } = {}) {
      data.notifications.unshift({
        id: `ntf-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: String(title || ''),
        body: String(body || ''),
        at: Date.now(),
        read: false,
      })
      if (data.notifications.length > MAX_NOTIFICATIONS) {
        data.notifications.length = MAX_NOTIFICATIONS
      }
      persist()
      return this.listNotifications()
    },

    markAllRead() {
      data.notifications = data.notifications.map((n) => ({ ...n, read: true }))
      persist()
      return this.listNotifications()
    },

    clearNotifications() {
      data.notifications = []
      persist()
      return []
    },

    // ── Records created by the Create shortcuts ──────────────
    listRecords(collection) {
      return ensureCollection(collection).map((r) => ({ ...r }))
    },

    allRecords() {
      const out = {}
      for (const collection of Object.keys(data.records)) {
        out[collection] = ensureCollection(collection).map((r) => ({ ...r }))
      }
      return out
    },

    createRecord(collection, { title, detail = '', status = 'draft', actor = 'You' } = {}) {
      const now = Date.now()
      const record = {
        id: `rec-${now}-${Math.random().toString(36).slice(2, 7)}`,
        title: String(title || ''),
        detail: String(detail || ''),
        status: String(status || 'draft'),
        at: now,
        updatedAt: now,
        version: 1,
        history: [{ at: now, from: null, to: String(status || 'draft'), actor: 'You', note: 'Created' }],
      }
      ensureCollection(collection).unshift(record)
      appendAudit({
        actor,
        action: `${collection}.created`,
        target: { collection, id: record.id, title: record.title },
      })
      persist()
      return { ...record }
    },

    getRecord(collection, id) {
      const found = ensureCollection(collection).find((r) => r.id === id)
      return found ? { ...found } : null
    },

    /** Edit the text of an unfinished draft. Status is never editable here. */
    updateRecord(collection, id, { title, detail } = {}) {
      const list = ensureCollection(collection)
      const index = list.findIndex((r) => r.id === id)
      if (index < 0) return null

      const record = list[index]
      if (!isEditable(record.status)) {
        const error = new Error(`A record in ${record.status} cannot be edited`)
        error.code = 'not_editable'
        throw error
      }

      const next = {
        ...record,
        title: title === undefined ? record.title : String(title),
        detail: detail === undefined ? record.detail : String(detail),
        updatedAt: Date.now(),
        version: (record.version || 1) + 1,
      }
      list[index] = next
      appendAudit({
        actor: 'You',
        action: `${collection}.edited`,
        target: { collection, id: next.id, title: next.title },
      })
      persist()
      return { ...next }
    },

    /**
     * Apply a status transition, refusing anything the workflow does not allow.
     * The caller supplies the intended status; this method decides.
     */
    transitionRecord(collection, id, { to, actor = 'You', note = '' } = {}) {
      const list = ensureCollection(collection)
      const index = list.findIndex((r) => r.id === id)
      if (index < 0) return null

      const record = list[index]
      const from = record.status
      if (!canTransition(from, to)) {
        const error = new Error(`Cannot move a record from ${from} to ${to}`)
        error.code = 'invalid_transition'
        throw error
      }

      const now = Date.now()
      const next = {
        ...record,
        status: to,
        updatedAt: now,
        version: (record.version || 1) + 1,
        history: [
          ...(record.history || []),
          { at: now, from, to, actor: String(actor), note: String(note) },
        ],
      }
      list[index] = next
      appendAudit({
        actor,
        action: `${collection}.${to}`,
        target: { collection, id: next.id, title: next.title },
        note,
      })
      persist()
      return { ...next }
    },

    // ── Audit log ────────────────────────────────────────────
    listAudit() {
      return (data.audit || []).map((event) => ({ ...event }))
    },

    getAudit(id) {
      const found = (data.audit || []).find((event) => event.id === id)
      return found ? { ...found } : null
    },

    // ── Interface preferences ────────────────────────────────
    getPreferences() {
      return { ...DEFAULT_PREFS, ...pickPrefs(readJson(PREFS_KEY)) }
    },

    setPreferences(patch = {}) {
      const next = { ...this.getPreferences(), ...pickPrefs(patch) }
      writeJson(PREFS_KEY, pickPrefs(next))
      return { ...next }
    },
  }
}
