/**
 * Minimal mock of the IGIFY API contract (subset), for exercising the HTTP
 * adapter and the offline outbox without a real backend.
 *
 * Implements only what the adapter uses: session, profile, notifications, and
 * generic record collections with clientId de-duplication.
 *
 * Run standalone:  node scripts/mock-api.mjs [port]
 * Use in tests:    import { startMockApi } from './mock-api.mjs'
 */

import { createServer } from 'node:http'

const COLLECTIONS = ['users', 'organisations', 'content', 'announcements', 'groups', 'events']

function json(res, status, body) {
  const payload = body === undefined ? '' : JSON.stringify(body)
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
  })
  res.end(payload)
}

function fail(res, status, code, message) {
  json(res, status, { error: { code, message } })
}

async function readBody(req) {
  const chunks = []
  for await (const chunk of req) chunks.push(chunk)
  const text = Buffer.concat(chunks).toString('utf8')
  if (!text) return {}
  try {
    return JSON.parse(text)
  } catch (err) {
    return {}
  }
}

export function startMockApi({ port = 0 } = {}) {
  const state = {
    user: { id: 'usr_1', displayName: 'Guest user', roles: ['member'], identity: { state: 'kyc_pending' } },
    notifications: [],
    records: Object.fromEntries(COLLECTIONS.map((c) => [c, []])),
    byClientId: new Map(),
    nextId: 1,
  }

  function notify(title, body) {
    state.notifications.unshift({
      id: `ntf_${state.nextId++}`,
      title,
      body,
      createdAt: new Date().toISOString(),
      read: false,
    })
  }

  const server = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://localhost')
    const path = url.pathname
    const method = req.method

    if (method === 'OPTIONS') return json(res, 204)

    try {
      if (path === '/api/v1/auth/session' && method === 'GET') {
        return json(res, 200, {
          user: { id: state.user.id, displayName: state.user.displayName, status: 'active' },
          identity: state.user.identity,
          roles: state.user.roles,
          organisations: [],
          workspaces: ['public', 'member', 'admin'],
          serverTime: new Date().toISOString(),
        })
      }

      if (path === '/api/v1/me' && method === 'GET') {
        return json(res, 200, {
          id: state.user.id,
          displayName: state.user.displayName,
          roles: state.user.roles,
          identity: state.user.identity,
        })
      }

      if (path === '/api/v1/me' && method === 'PATCH') {
        const body = await readBody(req)
        if (typeof body.displayName !== 'string' || !body.displayName.trim()) {
          return fail(res, 422, 'validation_failed', 'displayName must be a non-empty string')
        }
        if (body.displayName.length > 60) {
          return fail(res, 422, 'validation_failed', 'displayName must be 60 characters or fewer')
        }
        state.user.displayName = body.displayName.trim()
        return json(res, 200, {
          id: state.user.id,
          displayName: state.user.displayName,
          roles: state.user.roles,
          identity: state.user.identity,
        })
      }

      if (path === '/api/v1/me/notifications' && method === 'GET') {
        return json(res, 200, {
          items: state.notifications,
          unread: state.notifications.filter((n) => !n.read).length,
          nextCursor: null,
        })
      }

      if (path === '/api/v1/me/notifications/read-all' && method === 'POST') {
        state.notifications = state.notifications.map((n) => ({ ...n, read: true }))
        return json(res, 200, { ok: true })
      }

      if (path === '/api/v1/me/notifications' && method === 'DELETE') {
        state.notifications = []
        return json(res, 204)
      }

      const collectionMatch = path.match(/^\/api\/v1\/([a-z]+)$/)
      if (collectionMatch) {
        const collection = collectionMatch[1]
        if (!COLLECTIONS.includes(collection)) {
          return fail(res, 404, 'not_found', 'Unknown collection')
        }

        if (method === 'GET') {
          return json(res, 200, { items: state.records[collection], nextCursor: null })
        }

        if (method === 'POST') {
          const body = await readBody(req)

          // Replay protection: the same clientId returns the original record.
          if (body.clientId && state.byClientId.has(body.clientId)) {
            return json(res, 200, state.byClientId.get(body.clientId))
          }

          if (typeof body.title !== 'string' || !body.title.trim()) {
            return fail(res, 422, 'validation_failed', 'title is required')
          }

          const record = {
            id: `rec_${state.nextId++}`,
            clientId: body.clientId || null,
            title: body.title.trim(),
            detail: typeof body.detail === 'string' ? body.detail : '',
            status: typeof body.status === 'string' ? body.status : 'Draft',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            version: 1,
          }

          state.records[collection].unshift(record)
          if (body.clientId) state.byClientId.set(body.clientId, record)
          notify('Created', `${record.title} — ${record.status.toLowerCase()}.`)
          return json(res, 201, record)
        }
      }

      return fail(res, 404, 'not_found', `${method} ${path} is not implemented by the mock`)
    } catch (err) {
      return fail(res, 500, 'unavailable', err.message || 'mock server error')
    }
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      resolve({
        url: `http://127.0.0.1:${address.port}`,
        state,
        close: () => new Promise((done) => server.close(done)),
      })
    })
  })
}

// Standalone mode
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
  const port = Number(process.argv[2] || 8099)
  startMockApi({ port }).then(({ url }) => {
    console.log(`mock API listening on ${url}`)
  })
}
