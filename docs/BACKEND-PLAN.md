# IGIFY Backend — Implementation Plan

**Status:** Draft 0.1 — proposal for review
**Source:** `IGIFY_Backend_Architecture.png` (owner's architecture baseline)
**Companions:** `docs/API-CONTRACT.md` (frontend boundary), `IGIFY-WEBUI-PROTOTYPE-DESIGN.md`

---

## 1. What the architecture diagram commits to

Read back from the diagram, so we agree on the same baseline before planning against it:

| Layer | Components named in the diagram |
| --- | --- |
| Frontends | Public WebUI, Registered Member WebUI, Organisation Admin, IGIFY Administrator |
| **Core** | Authentication · Sessions · Identity · Security groups · Authorisation · Organisations · Business rules · Notifications |
| **Integration layer** | Service registry · Connector manager · API adapters · Access gateway · Health monitoring · Events · Offline coordination |
| Independent services | Migle & Search · MusicBrainz & MovieBrain · TV & Radio · KADO & Community Apps |
| Data | Core identity data · Independent application data · Shared content & media · Search indexes · Integration & sync records · Audit · Backup & recovery |
| Deployment | Docker containers · Persistent volumes · Independent service lifecycle · Offline-capable provincial installation |

Two properties of this diagram drive the whole plan:

1. **The Core is a single application boundary.** One API owns identity, authorisation, organisations, business rules and notifications; services sit *behind* it and never talk to the browser directly.
2. **Services are independent and replaceable.** Adding a service must not mean redesigning the Core or the WebUI.

## 2. Decisions still open

The diagram fixes structure but not technology. These must be decided before code:

| # | Decision | Why it blocks work | Recommended default |
| --- | --- | --- | --- |
| D1 | Language/framework for the Core | Everything else follows it | See §3 — recommendation depends on your existing stack |
| D2 | Database engine | Schema, migrations, backup procedure | PostgreSQL 16 |
| D3 | Auth mechanism | Session handling, PWA behaviour, CSRF | Short-lived access token + refresh token |
| D4 | Search engine behind Migle | Whether Core proxies or Migle owns the index | Migle owns it; Core proxies |
| D5 | Media storage | Backup size, offline availability | Local persistent volume first; S3-compatible later |
| D6 | Orchestration | Deployment procedure | Docker Compose per province |
| D7 | Existing Kundiawa platform | Migration vs replacement | Reuse identity data if extractable |
| D8 | Team and maintenance capacity | How much machinery is justified | Modular monolith, not microservices |

## 3. Stack recommendation

The Core should be chosen for **maintainability by a small provincial team**, not for novelty. Three viable options:

| Option | Strengths here | Costs | Fit |
| --- | --- | --- | --- |
| **Laravel (PHP)** | Matches the ecosystem you already run (AzuraCast, FreshRSS, Wallabag are PHP); abundant local PHP skills; mature auth, queues, migrations; simple Docker image | Heavier per-request than Go; PHP-FPM + NGINX | **Best if your existing platform is PHP** |
| **Node/NestJS (TypeScript)** | Same language as the WebUI; strong typing; good Docker story; shares models with the frontend | Younger ecosystem for admin/KYC; Node runtime discipline needed | Strong if the team is JavaScript-first |
| **Django (Python)** | Excellent admin out of the box (useful for IGIFY administrators); strong auth and migrations | Python ops knowledge needed; async story weaker | Good if you want the admin for free |

**Recommendation:** choose whichever language your current maintainer already writes. A platform that a provincial team cannot maintain will decay regardless of architectural elegance. If the existing Kundiawa system is PHP, take **Laravel**; if it is JavaScript, take **NestJS**.

Whichever is chosen, the structure inside the Core is the same (§5).

## 4. Deployment topology

Start with **two containers**, not eight. The Integration Layer begins as a module inside the Core and is extracted only when it earns it.

```yaml
# Phase 1 topology — illustrative
services:
  core:                     # API + business rules + integration module
    image: igify/core:1
    restart: unless-stopped
    env_file: ./core.env
    depends_on: [db]
    expose: ["8080"]        # never published to the host; NGINX proxies /api/
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1:8080/api/v1/health"]
      interval: 30s
      timeout: 5s
      retries: 3
    volumes:
      - media:/srv/media    # uploads and curated media

  worker:                   # queued jobs: sync, imports, notifications, exports
    image: igify/core:1
    command: ["worker"]
    restart: unless-stopped
    env_file: ./core.env
    depends_on: [db]

  db:
    image: postgres:16
    restart: unless-stopped
    env_file: ./db.env
    volumes:
      - db-data:/var/lib/postgresql/data

  nginx:                    # existing container, gains a proxy location
    volumes:
      - media:/srv/media:ro
    depends_on: [core]

volumes:
  db-data:
  media:
```

Rules that follow from your deployment standard:

- **NGINX remains the only ingress.** `/api/` proxies to `core`; the WebUI stays static files.
- **Nothing important lives inside a container.** Database and media are named volumes; containers are replaceable.
- **Configuration by environment file**, never baked into images.
- **The provincial instance must start and serve with no internet.** External services are optional add-ons, not startup dependencies.
- **Independent service lifecycle:** a service container can be added, upgraded or stopped without redeploying the Core.

Later phases may add `search` (Meilisearch), `redis` (queues/cache) and one container per integration service — each only when a real need appears.

## 5. Core internals

A modular monolith with boundaries that mirror the diagram, so extraction later is mechanical:

```
core/
├── Identity/          users, credentials, KYC state, sessions
├── Authorisation/     security groups, permissions, policy checks
├── Organisations/     org records, membership, admin appointments
├── Content/           content, announcements, events, groups; status machine
├── Notifications/     per-user notifications, delivery
├── Audit/             append-only event log
├── Integration/       registry, connectors, health, events, sync coordination
├── Media/             upload, derivatives, consent metadata
└── PublicApi/         versioned HTTP surface consumed by the WebUI
```

Non-negotiable properties:

- **Authorisation is server-side on every request.** The WebUI's workspace selector is presentation only.
- **Status transitions are actions**, not field writes (`POST /content/{id}/approve`), exactly as the frontend contract specifies.
- **Every mutation emits an audit event** in the same transaction as the change, so a change cannot exist without its record.
- **Service credentials never reach the browser.** The Core proxies or aggregates.

## 6. Data model outline

Core-owned tables (indicative, not final):

| Area | Tables |
| --- | --- |
| Identity | `users`, `credentials`, `sessions`, `kyc_submissions`, `kyc_decisions` |
| Authorisation | `security_groups`, `group_memberships`, `permissions` |
| Organisations | `organisations`, `organisation_members`, `admin_appointments` |
| Content | `content`, `announcements`, `events`, `groups`, `status_transitions` |
| Notifications | `notifications`, `notification_reads` |
| Audit | `audit_events` (append-only) |
| Integration | `services`, `service_health`, `sync_cursors`, `sync_records` |
| Media | `media_assets`, `media_derivatives`, `consent_records` |

Design notes:

- **Audit append-only.** No `UPDATE` or `DELETE` grants on `audit_events` for the application role. Consider a per-row hash of the previous event to make tampering detectable.
- **Soft deletes with tombstones** on content, so an offline client learns something disappeared.
- **`updated_at` on every syncable row**, indexed, for cursor-based deltas.
- **Client-generated ids** are stored as `client_id` with a uniqueness constraint per user, which is what makes outbox replay safe.

## 7. Integration layer

The layer exists so that adding Migle, MovieBrain, TV & Radio or a community app never touches Core business rules.

**Connector contract** (each service implements):

```
identify()            → id, name, version, capabilities
health()              → ok | degraded | offline, with detail
search(query, opts)   → normalised results          (if searchable)
fetch(id)             → normalised record           (if addressable)
sync(cursor)          → changed records + new cursor (if cacheable)
```

**Registry:** services are rows in `services`, not code. An administrator enables or disables one; the WebUI already models this and the state must come from here.

**Health monitoring:** a scheduled check updates `service_health`; the Modules & Services screen reads it. Never probe a service from the browser.

**Events:** integration emits domain events (`content.published`, `service.down`) that notifications and audit consume.

**Offline coordination:** responsible for pulling curated content while a link exists and serving it from local storage afterwards. This is the mechanism behind "clean curated internet served to communities".

## 8. API surface

`docs/API-CONTRACT.md` already specifies what the current WebUI calls: session, profile, notifications, records with status actions, audit, offline sync and media.

The architecture diagram adds three gaps that contract does not yet cover:

| Gap | Endpoint shape | Notes |
| --- | --- | --- |
| Organisation profile | `GET/PATCH /organisations/{id}` | Self-service for org admins; review rules later |
| Service registry | `GET /services`, `GET /services/{id}`, `POST /services/{id}/enable|disable` | Replaces the prototype's local overrides |
| Search proxy | `GET /search?q=&type=` | Core proxies to Migle, applies access rules, returns normalised results |

`GET /audit` and `GET /audit/{id}` are already in the contract and are the read side of the audit trail the WebUI now displays.

## 9. Offline and sync protocol

This is the highest-risk area and deserves explicit design, not retrofitting.

1. Client keeps a cursor per collection.
2. `GET /content?since=<cursor>` returns changed rows **and tombstones** plus a new cursor.
3. Client writes go to its outbox with a `client_id`; the server returns the existing record on replay.
4. Conflicts: server wins on status; draft text conflicts are surfaced to the author, never merged silently.
5. Media uploads are separate, resumable, and never inlined in JSON.

Acceptance: pull the network during a draft, create and edit records, restore the network, and the server ends with exactly one copy of each record.

## 10. Non-functional requirements

| Concern | Target |
| --- | --- |
| Availability | Core serves from the provincial server while the internet is down |
| Backup | Nightly `pg_dump` + media volume snapshot; **restore rehearsed quarterly** |
| RPO / RTO | Propose 24 h / 4 h for a provincial deployment |
| Audit retention | Indefinite; exportable |
| Notification retention | 90 days active, then archive |
| Security | TLS at NGINX, admin 2FA, least-privilege DB role, secrets in env files, no secrets in images |
| Observability | Container logs to stdout, health endpoint, disk-space alert (archives fill disks) |
| Media consent | Records consent for identifiable people; traditional/cultural imagery handled deliberately |

## 11. Environments and release

`dev` (workstation) → `staging` (compose on a test host, seeded data) → `provincial` (Kundiawa).

Release rule: a WebUI build and a Core image are versioned together in one compose file per province. A province upgrades by pulling new images and running migrations; rollback is the previous image tag plus a restored dump if a migration was destructive.

## 12. Migration from the existing deployment

The platform has run for two years in Kundiawa, so this is an upgrade, not a greenfield launch:

1. Inventory what the current system stores (users, organisations, content) and where.
2. Decide reuse vs reset per entity — identity reuse is strongly preferred.
3. Write a one-way import with a dry-run report: counts, rejected rows, and reasons.
4. Run both systems in parallel for a defined pilot window; the old one stays authoritative until cutover is signed off.
5. Keep the old deployment intact and offline for one month after cutover.

## 13. Phased delivery

Indicative durations; they assume one developer and will change with your team.

| Phase | Deliverable | Exit criteria |
| --- | --- | --- |
| **0. Decisions** (1 wk) | D1–D8 answered; environment names and hosts agreed | Stack chosen in writing; repository created |
| **1. Skeleton** (1–2 wk) | Core container, Postgres, migrations, `/health`, CI, secrets layout | `docker compose up` serves `/api/v1/health`; migrations run |
| **2. Identity** (2–3 wk) | Sessions, security groups, profile, notifications, audit backbone | WebUI's profile, notification and audit screens work against the real API |
| **3. Content and approval** (3–4 wk) | Records, status machine, organisations, registration decisions, media upload | The draft → submitted → approved → published journey works end to end with real persistence |
| **4. Integration layer** (2–3 wk) | Registry, connector contract, health, first two connectors (Migle + one media service) | Modules & Services reads live health; adding a third service needs no Core change |
| **5. Offline hardening** (2 wk) | Cursors, tombstones, replay, conflict handling, bandwidth behaviour | §9 acceptance test passes with the network repeatedly cut |
| **6. Pilot** (2 wk+) | Parallel run at Kundiawa, import, training notes | Owner signs off; old platform retired on a known date |

## 14. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Offline semantics treated as an afterthought | Duplicate or lost content; loss of trust | Phase 5 gates release; contract already requires `client_id` |
| Identity migration done badly | Community members locked out | Dry-run import with a report; parallel operation |
| Single provincial server failure | Total local outage | Documented restore; spare disk; quarterly rehearsal |
| Disk growth from archives/media | Silent failure | Disk alerts; retention policy; archive pruning |
| One maintainer | Bus factor | Documented runbook; boring, conventional stack |
| Admin account compromise | Platform-wide damage | 2FA, audit, least privilege, separate admin accounts |
| Scope creep into a "portal redesign" | Never ships | This plan changes the backend only; WebUI is already built |

## 15. What I need from you

1. **D1** — what language/framework does the existing Kundiawa platform use, and who maintains it?
2. **D7** — can we read the existing user/organisation data, or does identity start fresh?
3. **D2** — is PostgreSQL acceptable, or is a database already in use?
4. **D5** — roughly how much media (photos, audio, documents) per province, and how often does it change?
5. **D8** — who will maintain this after handover: you, a staff member, or a contractor?
6. **D6** — the servers you mentioned: Docker Compose hosts, or a Swarm/Kubernetes cluster?
7. **Migle** — is it an existing service with an API, or something still to be built? The integration layer's first connector depends on the answer.

## 16. Recommended immediate step

Do **Phase 0** before writing code: answer the seven questions above, then freeze D1–D8 in a short decision record. Everything else in this plan is reversible; the stack choice is the expensive one to get wrong.

Once D1 is settled, Phase 1 is roughly a day of work — I can produce the Core skeleton, compose file, migrations and health endpoint so the provincial server has something real to run while Phase 2 proceeds.

---

**End of plan — draft, not approved.**
