/**
 * Editorial status machine.
 *
 * Kept separate from the UI so the same rules can be enforced on a server.
 * The important property is that status is never a free-form field: a client
 * asks for a transition and the machine decides whether it is legal.
 */

export const STATUS_LABELS = {
  draft: 'Draft',
  pending: 'Pending review',
  submitted: 'Submitted for review',
  approved: 'Approved',
  rejected: 'Rejected',
  published: 'Published',
  archived: 'Archived',
  suspended: 'Suspended',
}

export const STATUS_ORDER = ['draft', 'submitted', 'approved', 'published']

/** Legal transitions. Anything absent from this table is refused. */
export const ALLOWED = {
  draft: ['submitted'],
  rejected: ['submitted', 'draft'],
  submitted: ['approved', 'rejected'],
  approved: ['published', 'suspended'],
  published: ['archived'],
  archived: [],
  suspended: [],
  // Registrations (users, organisations, groups): decided once, not published.
  pending: ['approved', 'rejected'],
}

export function canTransition(from, to) {
  return (ALLOWED[from] || []).includes(to)
}

/** Only unfinished drafts may have their text edited. */
export function isEditable(status) {
  return status === 'draft' || status === 'rejected'
}

/** Actions a workspace may offer for a record in a given status. */
export function actionsFor(status, workspace, collection = 'content') {
  const isReviewer = workspace === 'admin'
  if (status === 'pending') {
    // Registration review: a decision, not a publishing pipeline.
    return isReviewer ? ['approved', 'rejected'] : []
  }
  if (status === 'suspended' || status === 'archived') return []
  if (status === 'draft' || status === 'rejected') {
    return isReviewer ? ['submitted', 'draft'] : ['submitted']
  }
  if (status === 'submitted') {
    return isReviewer ? ['approved', 'rejected'] : []
  }
  if (status === 'approved') {
    // An approved organisation can be suspended; content is published.
    if (collection === 'organisations') return isReviewer ? ['suspended'] : []
    return isReviewer ? ['published'] : []
  }
  return []
}

export const ACTION_LABELS = {
  submitted: 'Submit for approval',
  approved: 'Approve',
  rejected: 'Reject',
  published: 'Publish',
  suspended: 'Suspend',
  draft: 'Return to draft',
}
