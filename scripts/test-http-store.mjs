/**
 * Integration checks for the HTTP adapter and the offline outbox, run against
 * the mock API. No real backend required.
 *
 *   node scripts/test-http-store.mjs
 */

import { startMockApi } from './mock-api.mjs'
import { createHttpStore } from '../src/data/http.js'

let failures = 0
function check(label, condition) {
  if (condition) {
    console.log(`ok    ${label}`)
  } else {
    failures++
    console.error(`FAIL  ${label}`)
  }
}

function makeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  }
}

const api = await startMockApi()
const storage = makeStorage()

try {
  // ── Profile ────────────────────────────────────────────────────────────
  const store = createHttpStore(api.url, { storage })

  const session = await store.getSession()
  check('session returns a user and workspaces', Boolean(session.user?.id) && Array.isArray(session.workspaces))

  const profile = await store.getProfile()
  check('profile maps displayName to name', profile.name === 'Guest user')

  const renamed = await store.updateProfile({ name: '  Brasty Kiaga  ' })
  check('profile update trims and persists', renamed.name === 'Brasty Kiaga')

  const blank = await store.updateProfile({ name: '   ' })
  check('blank display name is rejected by the server', blank.name === 'Brasty Kiaga')

  // ── Records and notifications ──────────────────────────────────────────
  const optimistic = await store.createRecord('content', {
    title: 'Highlands coffee',
    detail: 'Harvest notes',
    status: 'Draft',
  })
  check('createRecord returns an optimistic pending record', optimistic.pending === true && Boolean(optimistic.id))

  const syncResult = await store.sync()
  check('outbox flushes the queued write', syncResult.sent >= 1 && syncResult.pending === 0)

  const content = await store.listRecords('content')
  check('record reaches the server', content.length === 1 && content[0].title === 'Highlands coffee')
  check('stored record is no longer pending', content[0].pending === false)

  const notifications = await store.listNotifications()
  check('creating a record raised a server notification', notifications.length >= 1)
  check('notification is mapped to the UI shape', typeof notifications[0].at === 'number')

  const read = await store.markAllRead()
  check('markAllRead leaves nothing unread', read.every((n) => n.read))

  const cleared = await store.clearNotifications()
  check('clearNotifications empties the inbox', cleared.length === 0)

  // ── Idempotency: replay of the same clientId ───────────────────────────
  const clientId = 'fixed-client-id-123'
  const post = (body) =>
    fetch(`${api.url}/api/v1/content`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }).then((r) => r.json())

  const first = await post({ clientId, title: 'Replayed draft' })
  const second = await post({ clientId, title: 'Replayed draft' })
  check('same clientId returns the same record, not a duplicate', first.id === second.id)

  const all = await store.listRecords('content')
  check('replay did not create a second record', all.filter((r) => r.title === 'Replayed draft').length === 1)

  // ── Offline queue survives and drains on reconnect ─────────────────────
  const offlineStorage = makeStorage()
  const offlineFetch = () => Promise.reject(new Error('offline'))
  const offlineStore = createHttpStore(api.url, {
    storage: offlineStorage,
    fetchImpl: offlineFetch,
  })

  await offlineStore.createRecord('events', { title: 'Provincial show', status: 'Draft' })
  const queued = offlineStore.outbox.list()
  check('write is queued while offline', queued.length === 1 && queued[0].collection === 'events')

  const failedSync = await offlineStore.sync()
  check('failed flush keeps the item and records an attempt', failedSync.pending === 1)
  const retried = offlineStore.outbox.list()[0]
  check('failed attempt schedules a backoff', retried.attempts === 1 && retried.nextAttemptAt > Date.now())

  const immediate = await offlineStore.sync()
  check('backoff prevents an immediate retry', immediate.sent === 0)

  // "Reconnect": same storage, working transport. Advance the clock past the
  // scheduled backoff so the retry is allowed.
  const reconnectStore = createHttpStore(api.url, {
    storage: offlineStorage,
    now: () => Date.now() + 10_000,
  })
  const drained = await reconnectStore.sync()
  check('reconnect drains the queued write after backoff', drained.sent === 1 && drained.pending === 0)

  const events = await reconnectStore.listRecords('events')
  check('queued event reached the server exactly once', events.length === 1 && events[0].title === 'Provincial show')

  console.log(
    failures === 0
      ? '\nALL CHECKS PASSED'
      : `\n${failures} CHECK(S) FAILED`
  )
} finally {
  await api.close()
}

process.exitCode = failures === 0 ? 0 : 1
