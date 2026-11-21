/**
 * Editorial workflow checks: legal transitions, role actions, editability.
 *
 *   node scripts/test-workflow.mjs
 */

import { actionsFor, canTransition, isEditable, STATUS_LABELS } from '../src/content/workflow.js'

let failures = 0
function check(label, condition) {
  if (condition) console.log(`ok    ${label}`)
  else {
    failures++
    console.error(`FAIL  ${label}`)
  }
}

// ── Legal and illegal transitions ───────────────────────────────────────
check('draft can be submitted', canTransition('draft', 'submitted'))
check('draft cannot jump to published', !canTransition('draft', 'published'))
check('draft cannot jump to approved', !canTransition('draft', 'approved'))
check('submitted can be approved', canTransition('submitted', 'approved'))
check('submitted can be rejected', canTransition('submitted', 'rejected'))
check('submitted cannot be published directly', !canTransition('submitted', 'published'))
check('approved can be published', canTransition('approved', 'published'))
check('approved cannot be rejected', !canTransition('approved', 'rejected'))
check('published is terminal except archiving', canTransition('published', 'archived'))
check('published cannot return to draft', !canTransition('published', 'draft'))
check('rejected can be resubmitted', canTransition('rejected', 'submitted'))
check('unknown status refuses everything', !canTransition('nonsense', 'published'))

// ── Role actions ────────────────────────────────────────────────────────
const authorDraft = actionsFor('draft', 'org')
check('author can submit a draft', authorDraft.includes('submitted'))
check('author cannot approve their own draft', !authorDraft.includes('approved'))

const reviewerSubmitted = actionsFor('submitted', 'admin')
check('reviewer can approve a submission', reviewerSubmitted.includes('approved'))
check('reviewer can reject a submission', reviewerSubmitted.includes('rejected'))

check('author sees no action on a submitted record', actionsFor('submitted', 'org').length === 0)
check('reviewer sees publish on an approved record', actionsFor('approved', 'admin').includes('published'))
check('author sees no action on an approved record', actionsFor('approved', 'org').length === 0)
check('published records offer nothing further', actionsFor('published', 'admin').length === 0)

// ── Organisation suspension ─────────────────────────────────────────────
check('approved can be suspended', canTransition('approved', 'suspended'))
check('suspended is terminal', !canTransition('suspended', 'approved'))
check(
  'an approved organisation offers suspension, not publishing',
  actionsFor('approved', 'admin', 'organisations').includes('suspended') &&
    !actionsFor('approved', 'admin', 'organisations').includes('published')
)
check(
  'approved content still offers publishing',
  actionsFor('approved', 'admin', 'content').includes('published')
)
check('authors cannot suspend an organisation', actionsFor('approved', 'org', 'organisations').length === 0)

// ── Registration review ─────────────────────────────────────────────────
check('pending can be approved', canTransition('pending', 'approved'))
check('pending can be rejected', canTransition('pending', 'rejected'))
check('pending cannot be published', !canTransition('pending', 'published'))
check('approved registration is terminal', !canTransition('approved', 'rejected'))
const reviewerPending = actionsFor('pending', 'admin')
check('reviewer sees approve and reject for a pending record', reviewerPending.includes('approved') && reviewerPending.includes('rejected'))
check('author sees no decision on a pending record', actionsFor('pending', 'org').length === 0)

// ── Editing ─────────────────────────────────────────────────────────────
check('drafts are editable', isEditable('draft'))
check('rejected records are editable', isEditable('rejected'))
check('submitted records are not editable', !isEditable('submitted'))
check('published records are not editable', !isEditable('published'))

check('every status has a label', Object.keys(STATUS_LABELS).length >= 7)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
