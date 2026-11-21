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

    createRecord(collection, { title, detail = '', status = 'Draft' } = {}) {
      const record = {
        id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        title: String(title || ''),
        detail: String(detail || ''),
        status: String(status || 'Draft'),
        at: Date.now(),
        version: 1,
      }
      ensureCollection(collection).unshift(record)
      persist()
      return { ...record }
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
