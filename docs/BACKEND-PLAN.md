# IGIFY Backend — Consolidated Implementation Plan

**Version:** 0.2 (supersedes 0.1; 0.1 remains in git history)
**Status:** Review document. **No implementation is approved or started.**
**Owner of direction:** IGIFY Limited. This document works within that direction.
**Companions:** `IGIFY-WEBUI-PROTOTYPE-DESIGN.md`, `docs/API-CONTRACT.md`, `docs/PAGE-INVENTORY.md`

> **How to read this document.** Every architectural statement is classified:
> **AGREED** (established by the project — not for re-litigation),
> **RECOMMENDATION** (proposal requiring your approval), or
> **OPEN QUESTION** (information genuinely missing).
> Nothing here overrides an agreed decision.

---

## 1. Purpose

Turn the established IGIFY architecture into a working, maintainable platform by:

1. reviewing what exists before proposing what to build;
2. mapping the WebUI's requirements onto the agreed architecture;
3. separating what is decided from what is proposed and what is unknown;
4. defining a discovery phase that produces the evidence needed to choose technology honestly.

## 2. Review scope and inputs

### 2.1 What was reviewed

| Input | Findings used |
| --- | --- |
| `IGIFY-WEBUI-PROTOTYPE-DESIGN.md` | Four workspaces, shared shell, service catalogue, security principles, deployment principles |
| `docs/API-CONTRACT.md` | The boundary the current WebUI already calls |
| `docs/PAGE-INVENTORY.md` | 30 workspace pages, 14 detail screens, what the interface actually needs |
| `ARCHITECTURE.html` | Prior layered summary of the same architecture |
| `src/**` (12 modules) | Data-layer seam, workflow rules, routing, search, services catalogue |
| Repository inventory | Frontend only: `public/` 20 files, `src/` 12, `scripts/` 12 (image/icon tooling), `docs/` 5 |
| `package.json` | Scripts: `dev`, `build`, `preview` — no server component |

### 2.2 What is not available to me — **UNKNOWN**

These are not assumptions I am permitted to fill in:

- the existing platform's source code, language, framework and database;
- the existing service APIs, their authentication and their data models;
- what is actually deployed at Kundiawa today, and its versions;
- the existing offline content acquisition framework and what it produces;
- provincial hardware specifications and expected content volumes;
- long-term maintenance arrangements and available skills;
- provincial IT policy on secrets, backups and data retention.

**Consequence:** no stack selection, no container topology, no migration strategy and no schema can be responsibly proposed until §8 is complete.

## 3. Established architecture — AGREED

Restated only to confirm a shared baseline, not to re-open it.

| # | Agreed |
| --- | --- |
| A1 | IGIFY is an existing platform being extended, not a greenfield build. |
| A2 | A central **IGIFY Core** owns platform-wide identity, authentication, authorisation, organisations, memberships, platform configuration and comparable central responsibilities. |
| A3 | An independent **Service Integration Layer** provides service registration, connectors, adapters, access control, health monitoring, events, offline coordination and external integration. |
| A4 | Independent applications retain ownership of their application-specific business logic and data. |
| A5 | Data ownership and storage boundaries are explicit. |
| A6 | Docker for backend services; **Compose** is the initial deployment approach. |
| A7 | Persistent storage independent of disposable containers. |
| A8 | Offline-first operation is a requirement, not a feature. |
| A9 | Independent service upgrades must not require redesign of the Core or the frontend. |
| A10 | Deployment must be repeatable and manageable for provincial installations: build once, package once, deploy consistently. |
| A11 | No Kubernetes, Swarm or comparable infrastructure without a demonstrated operational justification. |
| A12 | The existing offline content acquisition framework is preserved and integrated, not redesigned. |
| A13 | The browser must not hold credentials for protected backend services; access is mediated by backend security and integration mechanisms. |
| A14 | The diagram's boxes are **logical responsibilities**; they do not each imply a separate container or microservice. |
| A15 | Architectural items are classified as agreed / recommendation / open question. |

## 4. Findings from the review

### 4.1 The repository does not contain the platform

This repository is the **WebUI prototype only**. There is no server code, schema, migration, or deployment configuration for the existing Kundiawa platform. Any statement about the existing backend's technology would therefore be invention.

### 4.2 What the WebUI already aligns with

The frontend prototype is consistent with the agreed architecture and can be treated as a validated requirements source:

- **Backend-authoritative security.** The interface states repeatedly that visibility is not authorisation; the contract requires server-side checks on every protected operation.
- **Status transitions as actions, not field writes.** `src/content/workflow.js` refuses illegal transitions in the data layer, not just in the UI.
- **Offline-first write model.** Outbox with `clientId` replay and exponential backoff already exists and is tested against a mock.
- **Integration-ready boundary.** The WebUI consumes a single API; it has no knowledge of individual services, which matches A13.
- **Service catalogue as configuration.** The Modules & Services screen expects the registry to be authoritative, not local overrides.
- **Audit as a first-class read surface.** Every mutation in the prototype writes an audit event.

These are requirements the backend must satisfy; they are not architectural proposals.

### 4.3 Corrections to plan v0.1

| v0.1 statement | Status | Correction |
| --- | --- | --- |
| "Start with two/three containers; extract the Integration Layer later" | **Withdrawn as a decision** | A14 and A9 govern. Boundary design is agreed; deployment granularity is decided per component against explicit criteria (§5.2). |
| "Laravel or NestJS; choose by existing maintainer's language" | **Withdrawn** | Premature. Technology selection follows code review and evidence (§8, D5). PHP is not assumed. |
| "PostgreSQL 16" as default | **Downgraded to RECOMMENDATION** | A candidate to evaluate against the existing database estate, not a decision. |
| "Migle is the first connector, therefore design around it" | **Corrected** | The Integration Layer must be generic (A3). Migle is one existing example among many services. |
| "Migration: parallel run, dry-run import, retire after a month" | **Withdrawn** | Migration strategy requires the inventory in §8 first (your §7). |
| "Phases 1–6 with week estimates" | **Withdrawn** | Scheduled work cannot be estimated before discovery. Replaced by a Phase 0 gate. |
| "RPO 24 h / RTO 4 h" | **RECOMMENDATION** | Proposed targets for approval, not agreed service levels. |
| "Audit append-only with hash chain" | **RECOMMENDATION** | Strongly advised, but a proposal. |
| "Media on local volume first, S3-compatible later" | **RECOMMENDATION** | Depends on provincial hardware and content volume (Q6). |
| Naming of internal modules (`Identity/`, `Content/`…) | **Illustrative** | Suggested boundaries, not a prescribed structure. |

### 4.4 Assumptions withdrawn

- that the existing platform is PHP-based;
- that existing identity data is extractable;
- that a single maintainer will own the Core;
- that one provincial server is sufficient for the expected media volume;
- that the existing services expose HTTP APIs the Integration Layer can call directly.

## 5. Boundaries and granularity

### 5.1 Boundary model — AGREED

```
Frontends  →  IGIFY Core  →  Service Integration Layer  →  Independent applications
                    ↓                     ↓                          ↓
              Core-owned data     integration/sync records   application-owned data
```

Rules that follow from A2–A5 and A13:

1. The Core is the only party the browser talks to.
2. The Integration Layer mediates every call to an independent application.
3. An application owns its data; the Core does not reach into it directly.
4. Adding or upgrading an application changes the Integration Layer's registry/connector, not Core business rules.
5. Shared artefacts (identity, organisations, audit) are Core-owned; shared media ownership is **not yet decided** (Q7).

### 5.2 Deployment granularity — RECOMMENDATION

Consolidate by default, separate by justification. A logical component becomes its own deployable unit only when at least one criterion is met:

| Criterion | Question |
| --- | --- |
| Independent upgrade | Must it be upgraded on a different cadence than the Core? |
| Security isolation | Does it hold credentials or data the Core must not? |
| Failure isolation | Can its failure be tolerated while the Core serves? |
| Resource profile | Does it need materially different CPU/memory/disk? |
| Maintenance ownership | Is it maintained by a different team or vendor? |

Where none applies, consolidation inside one deployable unit is preferred — this is what keeps A10 achievable without violating A9. **This is a proposal; the criteria are the substance, the resulting split is yours to approve.**

## 6. Mapping the WebUI's needs onto the architecture

| WebUI capability (built) | Architectural owner | Confidence |
| --- | --- | --- |
| Session, identity, security groups, authorisation | Core | AGREED (A2) |
| Profile, notifications | Core | AGREED (A2) |
| Editorial content, announcements, events, groups; approval workflow | Core (platform-wide business rules) | AGREED in principle; boundary with application content needs confirmation (Q8) |
| Registration review, KYC state | Core | AGREED (A2) |
| Organisations, membership, admin appointments | Core | AGREED (A2) |
| Audit register and event detail | Core | AGREED (A2); retention policy open |
| Service register, health, enable/disable | Integration Layer | AGREED (A3) |
| Unified search | Integration Layer → Migle | AGREED (A3); Migle interface unknown (Q9) |
| Radio/TV playback entry points | Independent services via Integration | AGREED (A4); APIs unknown |
| Music/TV metadata | Independent services via Integration | AGREED (A4); APIs unknown |
| Curated offline content | Integration Layer offline coordination + existing acquisition framework | AGREED (A3, A12); framework unknown (Q10) |
| Card photography and media assets | Not yet decided | OPEN (Q7) |

This table is the bridge between what is built and what must be provided. It is analysis, not design.

## 7. Classification register

### 7.1 Agreed — see §3 (A1–A15)

### 7.2 Recommendations requiring approval

| # | Recommendation | Why | If declined |
| --- | --- | --- | --- |
| R1 | Define boundaries first; decide deployable units per component using §5.2 criteria | Preserves independence (A9) without premature microservices | Risk of either monolith lock-in or container sprawl |
| R2 | Treat `docs/API-CONTRACT.md` as the reviewable boundary specification for the WebUI | It already describes what the frontend calls | Frontend and backend drift |
| R3 | Core database: evaluate PostgreSQL against the existing estate; relational integrity for identity/approvals/audit | Auditable, transactional | If another engine is already operated, reuse it |
| R4 | Append-only audit, written in the same transaction as the change it records | Traceability for approvals and admin actions | Audit can diverge from reality |
| R5 | Generic connector contract (`identify/health/search/fetch/sync`) with per-connector capability flags | Keeps Integration Layer service-agnostic (A3) | Connectors become bespoke per service |
| R6 | Cursor-based sync with tombstones and `clientId` idempotency | Matches the WebUI's existing outbox and the offline requirement | Duplicate or lost writes on flaky links |
| R7 | Secrets via environment files (or Docker secrets where the host supports it), never in images | A10 and basic hygiene | Credential leakage in images |
| R8 | Nightly database dump + media snapshot, with a rehearsed restore | Provincial single-site risk | Unrecoverable data loss |
| R9 | Health endpoint plus compose healthcheck per service | Required for A10 operability | Silent service failure |
| R10 | Versioned release bundle (compose + images + env template + release notes) per province | "Build once, deploy consistently" (A10) | Every install becomes bespoke |

### 7.3 Open questions

Genuinely missing information. Each states how it can be resolved.

| # | Question | Resolve by |
| --- | --- | --- |
| Q1 | What exactly runs at Kundiawa today: software, versions, containers, hosts? | Host inventory (D1) |
| Q2 | Is the existing platform's source available for review, and in what language? | Code review (D5) |
| Q3 | Which existing services expose APIs, with what auth and data ownership? | Service inventory (D2) |
| Q4 | What data exists, at what volume, sensitivity and growth rate? | Data inventory (D3) |
| Q5 | What are the provincial hardware specifications (CPU, RAM, disk, network)? | Hardware survey (D4) |
| Q6 | Expected media volume and change frequency per province? | Owner + D3 |
| Q7 | Who owns shared media: Core, a media service, or per-application stores? | Boundary workshop (D6) |
| Q8 | Which content is platform-wide (Core) versus application-owned? | Boundary workshop (D6) |
| Q9 | What is Migle's interface, deployment model and ownership? | Service inventory (D2) |
| Q10 | Where does the existing offline acquisition framework live, and what does it produce? | Service inventory (D2) |
| Q11 | Who maintains the platform after handover, with what skills? | Owner (interview) |
| Q12 | Provincial policy on secrets, backups, retention and upgrade windows? | Owner / provincial IT |

## 8. Phase 0 — Discovery and inventory

**No code. No stack choice. No migration plan.** This phase produces the evidence.

The working kit for this phase is in **`docs/INVENTORY.md`**: fillable templates
for D1–D7, read-only collector scripts for Linux and Windows Docker hosts
(`scripts/discovery/`), read-only database queries for size and row estimates,
a redaction checklist, and the mapping from each deliverable to the open
questions above.

| Deliverable | Contents | Method |
| --- | --- | --- |
| **D1 Host & container inventory** | Every host, container, image tag, port, volume, compose project at Kundiawa | Read-only commands run on the host by your team; output shared |
| **D2 Service inventory** | Per service: purpose, owner, API surface, auth, data store, upgrade model, offline behaviour | Interviews + endpoint discovery |
| **D3 Data inventory** | Entities, record counts, sizes, growth, sensitivity, retention, backup state | Database inspection by your team |
| **D4 Infrastructure survey** | Hardware, storage, network, power, backup destination, monitoring | Provincial IT |
| **D5 Code review report** | Existing frontend/backend: language, frameworks, dependencies, quality, test coverage, risks | Source access required (Q2) |
| **D6 Boundary workshop** | Confirm content ownership (Q8), shared media (Q7), and the first components that justify separation under §5.2 | Joint session, 1–2 hours |
| **D7 Constraint & skills register** | Maintenance arrangements, available languages, vendor constraints, budget | Owner interview |

### Exit criteria for Phase 0

1. D1–D4 complete enough to state what exists without guessing.
2. D5 complete, or explicitly accepted as unavailable with the consequences recorded.
3. Q7 and Q8 answered in writing.
4. A short **Decision Record** listing only the choices now unblocked (stack, database, first deployable units), each with evidence.

Only then does implementation planning resume.

## 9. Gates before implementation

| Gate | Requirement |
| --- | --- |
| G1 | Phase 0 exit criteria met |
| G2 | Stack and database chosen with evidence, not preference |
| G3 | Boundary split approved (which components are separate deployables) |
| G4 | Contract (`docs/API-CONTRACT.md`) accepted or amended by you |
| G5 | Deployment package shape agreed: compose layout, env template, backup/restore, rollback |
| G6 | Migration approach agreed **after** D1–D3, not before |

## 10. Risks of proceeding without discovery

| Risk | Consequence |
| --- | --- |
| Building a second identity system | Community accounts fragment; trust lost |
| Choosing a stack the maintainers cannot operate | Platform decays after handover |
| Creating a parallel offline content pipeline | Duplicated storage and inconsistent curation (violates A12) |
| Designing around one service (e.g. Migle) | Integration Layer ossifies; A9 defeated |
| Assuming single-server capacity | Disk exhaustion from media/archives |
| Deploying without a rehearsed restore | Unrecoverable loss in a single-site province |

## 11. What I will not do without your approval

- select a language, framework or database;
- create a Core skeleton, repository structure or migrations;
- propose a container topology as if decided;
- design a migration for Kundiawa;
- modify or replace the existing offline acquisition framework;
- treat a recommendation in this document as approved.

## 12. Decisions needed from you now

Only these four are blocking Phase 0 from starting:

1. **Access for the inventory** — who runs the read-only host/container commands, and can the output be shared here? (D1)
2. **Source availability** — can the existing platform's source be reviewed, or is it unavailable? (Q2, D5)
3. **Boundary workshop** — are you available for a 1–2 hour session to settle Q7 and Q8? (D6)
4. **Maintenance reality** — who operates and maintains this after handover, and what languages are they comfortable with? (Q11, D7)

Everything else can be discovered in Phase 0.

---

**End of plan v0.2.** Review document only. No implementation has begun.
