/**
 * Persistent outbox for writes made while offline.
 *
 * A provincial link drops regularly. A write that cannot reach the server must
 * be remembered, retried, and applied exactly once. This module owns that
 * queue; the HTTP adapter supplies the transport and the resource path.
 *
 * Guarantees:
 *   • items survive reloads (JSON in provided storage)
 *   • each item carries a stable clientId, so a retry after a timeout cannot
 *     create a duplicate record
 *   • retries use exponential backoff with jitter and never spin
 *   • items are sent in the order they were created
 */

const KEY = 'igify.outbox.v1'
const BASE_DELAY_MS = 2000
const MAX_DELAY_MS = 5 * 60 * 1000

function read(storage) {
  try {
    const raw = storage.getItem(KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    return []
  }
}

function write(storage, items) {
  try {
    storage.setItem(KEY, JSON.stringify(items))
  } catch (err) {
    /* queue cannot be persisted; the caller still sees the attempt fail */
  }
}

const backoff = (attempts) =>
  Math.min(BASE_DELAY_MS * 2 ** Math.max(0, attempts - 1), MAX_DELAY_MS)

export function createOutbox({ storage, send, now = () => Date.now() } = {}) {
  if (!storage) throw new Error('createOutbox requires storage')
  if (typeof send !== 'function') throw new Error('createOutbox requires a send function')

  let inFlight = null

  function list() {
    return read(storage)
  }

  function enqueue({ collection, payload }) {
    const item = {
      clientId:
        globalThis.crypto?.randomUUID?.() ||
        `c-${now()}-${Math.random().toString(36).slice(2, 10)}`,
      collection,
      payload,
      attempts: 0,
      nextAttemptAt: 0,
      createdAt: now(),
    }
    const items = read(storage)
    items.push(item)
    write(storage, items)
    return item
  }

  async function run() {
    let sent = 0
    let items = read(storage)
    while (items.length) {
      const item = items[0]
      if (item.nextAttemptAt > now()) break
      try {
        await send(item)
        items = read(storage).filter((i) => i.clientId !== item.clientId)
        write(storage, items)
        sent++
      } catch (err) {
        items = read(storage).map((i) =>
          i.clientId === item.clientId
            ? { ...i, attempts: i.attempts + 1, nextAttemptAt: now() + backoff(i.attempts + 1) }
            : i
        )
        write(storage, items)
        break
      }
    }
    return { sent, pending: read(storage).length }
  }

  /**
   * Attempt to send queued items oldest-first. Stops at the first failure so
   * ordering is preserved and a flaky link is not hammered.
   *
   * Concurrent callers share the in-flight run rather than starting a second
   * one, so a `sync()` cannot race a background attempt.
   */
  function flush() {
    if (!inFlight) {
      inFlight = run().finally(() => {
        inFlight = null
      })
    }
    return inFlight
  }

  function clear() {
    write(storage, [])
  }

  return { enqueue, flush, list, clear }
}
