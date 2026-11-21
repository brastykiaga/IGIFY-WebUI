# IGIFY WebUI — API Contract (proposal)

**Status:** Draft 0.1 — for review before any backend implementation
**Scope:** the boundary between the four WebUI workspaces and the central backend
**Audience:** IGIFY Limited, Simbu provincial deployment, future implementers

> This document describes what the frontend needs from a backend, derived from
> the flows already implemented in the prototype. It is a proposal. Items marked
> **CONFIRM** depend on decisions only the project owner can make, and on the
> stack already running the Kundiawa deployment.

---

## 1. Why this document exists

The prototype currently performs its Create, notification and profile flows
against browser `localStorage`. Those flows are real interactions with a fake
store. This contract defines the same operations against a server, so the
frontend can move from local to networked without redesigning screens.

Two rules govern the boundary:

1. **The backend enforces everything.** Hiding a control in the frontend is not
   access control. Every protected operation is authorised server-side.
2. **The interface must remain useful offline.** Writes queue locally and sync;
   reads serve from a local cache. Network failure is a normal state, not an
   error path.

## 2. Conventions

| Concern | Decision |
| --- | --- |
| Base path | `/api/v1` |
| Format | JSON, UTF-8; `application/json` |
| Time | ISO 8601 UTC (`2026-11-21T10:00:00Z`); client renders local time |
| IDs | Opaque strings (UUID or ULID). Clients must not parse them. |
| Pagination | Cursor-based: `?limit=20&cursor=...`, response `nextCursor` |
| Partial responses | `?since=<iso8601>` returns only records changed after that instant |
| Idempotency | Client-generated `clientId` on writes; server dedupes per user |
| Errors | Stable machine `code` + human `message`; never stack traces |
| Transport | HTTPS only; HSTS in production |

### Error shape

```json
{
  "error": {
    "code": "forbidden",
    "message": "This account cannot publish content.",
    "requestId": "req_01H..."
  }
}
```

Codes: `unauthenticated`, `forbidden`, `not_found`, `validation_failed`,
`conflict`, `rate_limited`, `unavailable`.

## 3. Authentication and session — **CONFIRM**

**Assumption:** the existing platform already authenticates users; this upgrade
reuses it rather than adding a second identity system.

Requirements the frontend places on auth:

- A single account gives access to the workspaces it is entitled to; **no second
  login** for Organisation Admin (design baseline §3.3).
- Session must survive offline use: the client keeps a cached identity and
  permission set, but the server re-checks on every request.
- Expiry must be graceful: an expired session while offline should not discard
  queued writes.

### Endpoints

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/login` | Establish session (or exchange credentials for a token) |
| `POST` | `/auth/logout` | End session |
| `GET` | `/auth/session` | Current identity, roles, workspace entitlements |
| `POST` | `/auth/refresh` | Rotate/refresh credentials |

```json
// GET /auth/session
{
  "user": { "id": "usr_123", "displayName": "Brasty Kiaga", "status": "active" },
  "identity": { "state": "kyc_approved" },
  "roles": ["member", "org_admin"],
  "organisations": [{ "id": "org_9", "role": "admin" }],
  "workspaces": ["public", "member", "org"],
  "serverTime": "2026-11-21T10:00:00Z"
}
```

**Recommendation:** if the deployment is browser-only PWA plus future mobile
apps, prefer short-lived bearer access tokens with refresh, over cookie sessions.
Cookies need CSRF handling and behave poorly in installed PWAs across origins.

## 4. Profile

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/me` | Own profile |
| `PATCH` | `/me` | Update permitted fields |
| `GET` | `/me/preferences` | Interface preferences |
| `PUT` | `/me/preferences` | Store preferences (theme, dark mode, sidebar) |

`PATCH /me` accepts only: `displayName`, `preferences`. Role, identity state and
verification status are **not** client-writable — they change through
administrative or KYC processes.

```json
// PATCH /me
{ "displayName": "Brasty K." }
```

Server rules: `displayName` 2–60 characters, trimmed, no control characters;
profanity and impersonation policy **CONFIRM**.

## 5. Notifications

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/me/notifications?since=&limit=` | List, newest first |
| `POST` | `/me/notifications/read` | Body `{ "ids": [...] }` |
| `POST` | `/me/notifications/read-all` | Mark every visible item read |
| `DELETE` | `/me/notifications` | Clear (dismiss) all |

```json
{
  "items": [
    {
      "id": "ntf_77",
      "title": "Content approved",
      "body": "Your announcement is now published.",
      "createdAt": "2026-11-21T09:12:00Z",
      "read": false,
      "kind": "content.approved",
      "link": { "workspace": "admin", "page": "Content & Editorial" }
    }
  ],
  "unread": 3,
  "nextCursor": null
}
```

Notes:

- `unread` is authoritative; the client badge mirrors it but recomputes locally
  when offline.
- Notifications are per-user. Broadcast announcements are content, not
  notifications.
- Retention **CONFIRM** (proposal: 90 days, then archive).

## 6. Records created by the Create shortcuts

The prototype's six create types map to distinct resources with distinct
approval rules. They must not share one generic endpoint, because permissions
and status machines differ.

| Prototype type | Resource | Status machine |
| --- | --- | --- |
| Register a user | `registrations` | `pending` → `approved` \| `rejected` |
| Register an organisation | `organisations` | `pending` → `approved` \| `rejected` → `suspended` |
| Create content | `content` | `draft` → `submitted` → `approved` \| `rejected` → `published` → `archived` |
| Publish an announcement | `announcements` | `draft` → `submitted` → `published` → `expired` |
| Create a community group | `groups` | `pending` → `active` → `archived` |
| Create an event | `events` | `draft` → `submitted` → `published` → `past` |

### Common shape

```json
{
  "id": "cnt_501",
  "clientId": "0f8e2c1a-...",
  "type": "content",
  "title": "Highlands coffee harvest",
  "detail": "Short description supplied by the author.",
  "status": "draft",
  "createdBy": "usr_123",
  "organisationId": "org_9",
  "createdAt": "2026-11-21T10:00:00Z",
  "updatedAt": "2026-11-21T10:00:00Z",
  "version": 1
}
```

### Endpoints (pattern, repeated per resource)

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/content?status=&since=` | List within caller's visibility |
| `POST` | `/content` | Create draft |
| `GET` | `/content/{id}` | Read |
| `PATCH` | `/content/{id}` | Update draft (optimistic `version`) |
| `POST` | `/content/{id}/submit` | Move to `submitted` |
| `POST` | `/content/{id}/approve` | Administrator/editor only |
| `POST` | `/content/{id}/reject` | Body `{ "reason": "..." }` |

**Every state transition is a server-side action, not a field write.** A client
must never be able to `PATCH status: "published"`.

`version` supports optimistic concurrency: a `PATCH` with a stale version returns
`409 conflict` with the current record, so the client can present a choice rather
than silently overwrite.

## 7. Permissions matrix — **CONFIRM**

| Operation | Guest | Member | KYC member | Org admin | IGIFY admin |
| --- | --- | --- | --- | --- | --- |
| Read public content | ✓ | ✓ | ✓ | ✓ | ✓ |
| Own profile / notifications | — | ✓ | ✓ | ✓ | ✓ |
| Create draft content | — | — | ✓ | ✓ (own org) | ✓ |
| Submit for approval | — | — | ✓ | ✓ (own org) | ✓ |
| Approve / reject content | — | — | — | — | ✓ |
| Register users | — | — | — | — | ✓ |
| Register organisations | — | — | — | — | ✓ |
| Create groups / events | — | — | — | ✓ (own org) | ✓ |
| Theme allocation | — | — | — | — | ✓ |
| Audit log | — | — | — | — | ✓ |

Open questions: whether KYC-approved members may author content at all, and
whether Organisation Admins may approve their own organisation's content
(proposal: no — separation of duties).

## 8. Offline behaviour

This is the part most likely to be underestimated. The deployment is
intermittent; the interface must not degrade into spinners and dead buttons.

**Reads:** the client keeps a cache of the last successful response per resource,
plus a cursor. On reconnect it requests `?since=<cursor>` and merges.

**Writes:** every create/update goes into an outbox with a `clientId`. The UI
shows it immediately with a *Pending sync* state. The outbox flushes in order on
reconnect.

**Duplicate protection:** the server stores `clientId` and returns the existing
record on replay, so a retry after a timeout cannot create two posts.

**Conflicts:** server wins on approval state; the client is told which records
changed. Draft text conflicts are surfaced to the author, not merged silently.

**Deletes:** soft delete with a tombstone so an offline client learns the record
disappeared.

**Media:** photographs are referenced by URL from a media service, uploaded
separately (see §10). Do not inline base64 in JSON.

## 9. Rate limiting and abuse

- Authenticated writes: propose 60 requests/minute per user.
- Anonymous reads: propose 120 requests/minute per IP.
- `429` returns `Retry-After`.
- Login attempts: exponential backoff per account **and** per IP.
- All administrative actions write an audit event (§11).

## 10. Media uploads

Card imagery will eventually be IGIFY's own photographs, so the backend needs an
upload path.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/media` | Request upload target (multipart or pre-signed) |
| `GET` | `/media/{id}` | Metadata + derivative URLs |

Rules: accept `image/jpeg`, `image/png`, `image/webp`; reject SVG (script
vector); maximum 10 MB; strip EXIF location unless explicitly retained; generate
`800×450`, `1600×900` and thumbnail derivatives. Store originals for archival.

**Consent:** photographs of identifiable people require consent. Traditional
dress and cultural performance images are respectful content, not decoration to
be reused casually. This matters legally and reputationally in a provincial
deployment.

## 11. Audit

Every state transition, approval, rejection, role change and administrative
read of sensitive records emits an audit event:

```json
{
  "actor": "usr_123",
  "action": "content.approved",
  "target": { "type": "content", "id": "cnt_501" },
  "at": "2026-11-21T10:05:00Z",
  "outcome": "success",
  "ip": "203.0.113.7"
}
```

Audit records are append-only. The administrator's *Audit & Activity* screen
reads them; it must not be able to edit them.

## 12. Compatibility and versioning

- `/api/v1` is frozen for the prototype. Breaking changes go to `/v2`.
- Unknown JSON fields must be ignored by clients (forward compatibility).
- The frontend declares `Accept: application/json; version=1`.

## 13. Decisions required before implementation

| # | Decision | Why it matters |
| --- | --- | --- |
| 1 | What stack runs the existing Kundiawa deployment (language, framework, database)? | Determines whether this upgrade extends or replaces it |
| 2 | Reuse existing accounts/KYC, or introduce new identity? | A second identity system would fragment the community |
| 3 | Session cookie or bearer token? | Affects PWA behaviour and CSRF handling |
| 4 | Offline scope: read-only caching, or queued writes too? | Queued writes roughly double backend work but match the deployment |
| 5 | Who may author content (KYC members? organisations only?) | Shapes the permission matrix and the member workspace |
| 6 | Retention periods for notifications and audit records | Compliance and storage sizing |
| 7 | Media storage: on the provincial server, or central? | Offline availability and bandwidth |

## 14. Suggested first implementation slice

Rather than building all resources, implement the thinnest vertical slice that
proves the model end to end:

1. `GET /auth/session` with a fixed test account.
2. `GET /me` and `PATCH /me` (display name).
3. `GET /me/notifications` and `POST /me/notifications/read-all`.
4. `POST /content` and `GET /content?status=draft` for one create type.
5. Outbox with `clientId` replay for that one type.

That slice exercises auth, permissions, offline queueing and idempotency without
committing to the full content model.

---

**End of proposal.** Nothing here is implemented yet; the prototype remains
frontend-only and local.
