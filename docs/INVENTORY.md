# IGIFY Platform Inventory — Phase 0

**Purpose:** produce the evidence needed before any backend technology or
migration decision. This is a discovery kit, not a design document.

**Status:** Phase 0 of `docs/BACKEND-PLAN.md`. No implementation follows from it
directly; it answers the questions that currently block implementation.

---

## 1. Safety and handling

The collectors are **read-only**:

- they do not start, stop, restart, pull, remove or modify containers, images,
  volumes, networks or files;
- they do **not** read container environment variables — those commonly hold
  passwords and tokens;
- they do not connect to databases, and do not copy data.

**Before sharing**, read the redaction checklist in §11. Share the directory, not
the host.

## 2. Running the collector

### Linux Docker host

```bash
chmod +x collect-host-inventory.sh
./collect-host-inventory.sh igify-inventory
# optional, slower: add --with-sizes to measure volume usage
```

### Windows / Docker Desktop

```powershell
powershell -ExecutionPolicy Bypass -File .\collect-host-inventory.ps1 -Out igify-inventory
```

### What you get

| File | Contents |
| --- | --- |
| `01-host.txt` | OS, kernel, hostname, uptime |
| `02-hardware.txt` | CPU, memory, block devices, filesystems |
| `03-docker.txt` | Docker and Compose versions, selected daemon info, disk usage |
| `04-containers.txt` | Containers with image, state, restart policy, networks, mounts, listening sockets |
| `05-volumes-images.txt` | Volumes with mountpoints, networks, images with tags |
| `06-volume-sizes.txt` | Optional volume sizes (`--with-sizes`) |
| `07-checksums.txt` | SHA-256 of each file, so we can confirm we reviewed the same data |

Run it on **every** host that participates in the deployment, not just the
primary one.

## 3. D1 — Host and container inventory

Fill one row per host from `01`–`03`.

| Host | Role | OS | CPU / RAM | Disk (free/total) | Docker | Compose | Address | Location | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |

Fill one row per container from `04`.

| Container | Image:tag | Compose project | Ports | Volumes | Restart | Health | Owner | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |  |  |  |

Questions this answers: **Q1** (what runs today), **Q5** (hardware).

## 4. D2 — Service inventory

Complete one block per service — existing and planned. Use the ecosystem list as
the starting point: Migle, Kiwix, FreshRSS, Wallabag, AzuraCast, MusicBrainz,
IGIFY MusicBrain, TV/movie services, IGIFY MovieBrain, StepBible, Today in
History, Daily Quotes, Daily Bread, Archives, School Management, Church
Management, KADO, IGIMart, plus the existing offline content acquisition
framework.

```
Service name:
Purpose:
Owner / maintainer:
Deployment (container image, host, or external):
Version:
Interface (HTTP API / file drop / database / none):
  - base URL or path:
  - protocol (REST/GraphQL/other):
  - authentication method:
  - documented? (yes/no, where):
Data it owns:
  - store (engine, database/schema, files):
  - who else reads it:
Offline behaviour (works offline / needs link / degrades):
Upgrade method (image tag / rebuild / manual):
Backup method:
Known issues or constraints:
```

Summary table for quick reference:

| Service | Exists / planned | Interface | Auth | Owns data | Upgrade | Notes |
| --- | --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |  |

Questions this answers: **Q3** (APIs), **Q9** (Migle), **Q10** (offline acquisition
framework).

## 5. D3 — Data inventory

Complete with your database administrator. **Read-only queries only.** Do not
export rows containing personal data.

### PostgreSQL

```sql
-- Table sizes (no row contents)
SELECT table_schema,
       table_name,
       pg_total_relation_size(quote_ident(table_schema) || '.' || quote_ident(table_name)) AS bytes,
       (SELECT reltuples FROM pg_class c
         WHERE c.relname = t.table_name) AS approx_rows
FROM information_schema.tables t
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY bytes DESC;
```

### MySQL / MariaDB

```sql
-- Table sizes (no row contents)
SELECT table_schema, table_name,
       data_length + index_length AS bytes,
       table_rows AS approx_rows
FROM information_schema.tables
WHERE table_schema NOT IN ('mysql', 'information_schema', 'performance_schema', 'sys')
ORDER BY bytes DESC;
```

### Inventory table

| Entity / store | System | Size | Approx records | Growth / year | Sensitivity | Retention | Backed up | Owner |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Users / identity |  |  |  |  | High |  |  |  |
| Organisations |  |  |  |  | Medium |  |  |  |
| Content / media |  |  |  |  | Varies |  |  |  |
| Audit |  |  |  |  | High |  |  |  |
| Application data |  |  |  |  |  |  |  |  |

Questions this answers: **Q4** (data), **Q6** (media volume), and informs the
backup and retention recommendations.

## 6. D4 — Infrastructure survey

| Item | Detail |
| --- | --- |
| Provincial server(s): make, CPU, RAM, disks, RAID |  |
| Storage available and expansion path |  |
| Power: mains stability, UPS, generator |  |
| Network: upstream link, bandwidth, reliability |  |
| Local network: switches, wifi coverage for the community service |  |
| Backup destination (local / offsite / none) |  |
| Monitoring in place today |  |
| Remote administration method |  |
| Maintenance windows and change approval |  |
| Physical access and who has it |  |

Questions this answers: **Q5**, **Q12**, and the RPO/RTO recommendation.

## 7. D5 — Code review inputs

I cannot review code I cannot see. To make a technology recommendation on
evidence rather than preference, provide:

- [ ] Repository location and access method for the existing platform
- [ ] Primary languages and frameworks, with versions
- [ ] Dependency manifests (`composer.json`, `package.json`, `requirements.txt`, `go.mod`…)
- [ ] Database schema or migration history
- [ ] Existing tests and how they run
- [ ] Build and release process
- [ ] Known technical debt or planned rewrites
- [ ] Licence constraints
- [ ] Who understands the code today

If source cannot be shared, say so explicitly and I will record the consequence:
technology selection becomes a judgement call by your team, not an evidence-based
recommendation.

Questions this answers: **Q2**.

## 8. D6 — Boundary workshop (1–2 hours)

Agenda and the two decisions to leave with:

1. **Content ownership.** Which content is platform-wide (Core: announcements,
   editorial, events, groups) and which belongs to an application (radio
   catalogue, TV listings, Bible texts, market listings)? Record the split.
2. **Shared media ownership.** Where do photographs, audio and documents live,
   and who is authoritative for each? Options to discuss: Core-managed media
   store; a dedicated media service; per-application stores with the Integration
   Layer resolving references.
3. **First separation candidates.** Applying the five criteria in
   `docs/BACKEND-PLAN.md` §5.2 to the services in D2 — which components genuinely
   justify their own deployable unit, and which should consolidate?
4. **Identity reuse.** If D3 shows usable identity data, confirm it is reused.

Output: a one-page decision record, signed by you.

## 9. D7 — Constraints and skills

| Item | Detail |
| --- | --- |
| Who maintains the platform after handover |  |
| Languages that person is comfortable operating |  |
| Time available per week |  |
| External vendor or contractor involvement |  |
| Budget constraints for hosting or licences |  |
| Training or documentation expectations |  |
| Preferred release cadence for provincial installs |  |

Questions this answers: **Q11**.

## 10. Mapping to the open questions

| Deliverable | Answers |
| --- | --- |
| D1 Host and container inventory | Q1, Q5 |
| D2 Service inventory | Q3, Q9, Q10 |
| D3 Data inventory | Q4, Q6 |
| D4 Infrastructure survey | Q5, Q12 |
| D5 Code review | Q2 |
| D6 Boundary workshop | Q7, Q8 |
| D7 Constraints and skills | Q11 |

## 11. Redaction checklist

Before sharing the collector output:

- [ ] No passwords, tokens, API keys or licence keys
- [ ] No container environment variables (the collector does not read them)
- [ ] No personal data or member records
- [ ] No database dumps — sizes and schema only
- [ ] Public IP addresses removed if your policy requires it
- [ ] Internal hostnames or URLs removed if your policy requires it
- [ ] `.env` files never included
- [ ] Certificates and private keys never included

## 12. Phase 0 exit checklist

- [ ] Collector run on every host; output reviewed and redacted
- [ ] D1 complete for all hosts
- [ ] D2 complete for existing services; planned services listed
- [ ] D3 complete with sizes and growth estimates
- [ ] D4 complete
- [ ] D5 complete, or explicitly unavailable with consequences recorded
- [ ] D6 held; content and media ownership decided in writing
- [ ] D7 complete
- [ ] Decision record drafted listing only the choices now unblocked

When this checklist is complete, `docs/BACKEND-PLAN.md` §9 gates can be
assessed — and only then does the technology decision become an evidence-based
one.

---

**End of inventory kit.**
