/**
 * Store checks for the record lifecycle: creation, editing, transitions and the
 * guards that make an illegal state impossible even if the UI misbehaves.
 *
 *   node scripts/test-store.mjs
 */

import { pathToFileURL } from 'node:url'
import { join } from 'node:path'

const storeUrl = pathToFileURL(join(process.cwd(), 'src', 'data', 'local.js')).href

function makeStorage() {
  const map = new Map()
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    clear: () => map.clear(),
  }
}

globalThis.localStorage = makeStorage()
const { createLocalStore } = await import(storeUrl)
const store = createLocalStore()

let failures = 0
function check(label, condition) {
  if (condition) console.log(`ok    ${label}`)
  else {
    failures++
    console.error(`FAIL  ${label}`)
  }
}

function expectThrow(label, fn, code) {
  try {
    fn()
    check(label, false)
  } catch (err) {
    check(label, !code || err.code === code)
  }
}

// ── Creation ────────────────────────────────────────────────────────────
const record = store.createRecord('content', { title: 'Highlands coffee', status: 'draft' })
check('record starts in draft', record.status === 'draft')
check('record starts at version 1', record.version === 1)
check('creation is recorded in history', record.history?.length === 1 && record.history[0].to === 'draft')

// ── Editing ─────────────────────────────────────────────────────────────
const edited = store.updateRecord('content', record.id, { title: 'Highland coffee update' })
check('draft can be edited', edited.title === 'Highland coffee update')
check('editing bumps the version', edited.version === 2)

// ── Transitions ─────────────────────────────────────────────────────────
const submitted = store.transitionRecord('content', record.id, { to: 'submitted', actor: 'Brasty' })
check('draft can be submitted', submitted.status === 'submitted')
check('transition appends history', submitted.history.length === 2)
check('transition records the actor', submitted.history.at(-1).actor === 'Brasty')

expectThrow(
  'submitted cannot be published directly',
  () => store.transitionRecord('content', record.id, { to: 'published' }),
  'invalid_transition'
)

expectThrow(
  'submitted records cannot be edited',
  () => store.updateRecord('content', record.id, { title: 'Sneaky edit' }),
  'not_editable'
)

const approved = store.transitionRecord('content', record.id, { to: 'approved', actor: 'Reviewer' })
check('submitted can be approved', approved.status === 'approved')

const published = store.transitionRecord('content', record.id, { to: 'published', actor: 'Reviewer' })
check('approved can be published', published.status === 'published')

expectThrow(
  'published records cannot be edited',
  () => store.updateRecord('content', record.id, { title: 'Too late' }),
  'not_editable'
)

expectThrow(
  'published records cannot be rejected',
  () => store.transitionRecord('content', record.id, { to: 'rejected' }),
  'invalid_transition'
)

check('record survives a reload of the store', createLocalStore().getRecord('content', record.id)?.status === 'published')

// ── Audit trail ─────────────────────────────────────────────────────────
const audit = store.listAudit()
check('audit records the creation', audit.some((e) => e.action === 'content.created'))
check('audit records each transition', audit.filter((e) => e.target?.id === record.id && e.action.startsWith('content.')).length >= 4)
check('audit records the actor', audit.some((e) => e.actor === 'Reviewer'))
check('audit events are addressable', Boolean(store.getAudit(audit[0].id)))
check('unknown audit id returns null', store.getAudit('missing') === null)

// ── Registration decision ───────────────────────────────────────────────
const reg = store.createRecord('users', { title: 'New member', status: 'pending' })
check('registration starts pending', reg.status === 'pending')
const decided = store.transitionRecord('users', reg.id, { to: 'approved', actor: 'Reviewer' })
check('pending registration can be approved', decided.status === 'approved')
expectThrow(
  'decided registration cannot be reversed',
  () => store.transitionRecord('users', reg.id, { to: 'rejected' }),
  'invalid_transition'
)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
