# IGIFY WebUI — Page Inventory and Gap Analysis

**Version:** 1.1 prototype
**Purpose:** compare the screens described in the design baseline with what the
prototype actually contains, and count what is still missing.
**Method:** the design document's screen sections were counted area by area; the
prototype was counted from `src/main.js` (page maps, `card()` calls and
`data-action` values).

---

## 1. How the interface is layered

| Level | Meaning | Example |
| --- | --- | --- |
| **L1** | Workspace page reached from the sidebar | *Public → Discover* |
| **L2** | Content area or block inside a page | *Discover → Learning opportunities* |
| **L3** | Detail screen opened from an L2 block | *Learning opportunity → course page* |

The prototype has good L1 coverage and renders L2 blocks, but **nothing opens an
L3 screen**. That is the gap being measured here.

## 2. Headline numbers

| Measure | Count |
| --- | --- |
| Workspace pages described (L1) | 30 |
| Workspace pages implemented | **30** (100%) |
| Content areas described (L2) | ≈132 |
| Content blocks rendered | ≈126 |
| Detail screens described (L3) | **0** — the baseline never specifies them |
| Detail screens implemented | **1 reusable pattern**, 6 record types, 9 sample records |
| Search results screen | **Built** — searches records and workspace pages |
| Detail screens needed to make L2 blocks work | **14** (listed in §6) |
| Card buttons wired to a destination | **28 of 126** (22%) |
| Controls that currently lead nowhere | **110** (98 card buttons + 5 section links + 7 panel buttons) |

**Read this as:** the plan's *breadth* is largely delivered and the *depth* pattern
now exists, but most of the interface still has nothing behind it. A routing
model and one detail layout are in place; 28 cards use them, 98 do not.

Recently closed since the first inventory:

- **Routing exists.** Screens are addressable (`#/public/Latest%20News`,
  `#/public/Latest%20News/news/kundiawa-market`), so links can be shared,
  reloaded and navigated with the browser's back button.
- **One detail pattern** serves news, learning, events, groups, organisations and
  media records.
- **Category cards** now open their workspace page (Learn, Discover, Community &
  Events, Listen & Watch, Skills & Farming, Faith & Family).

## 3. Public WebUI — 7 pages

| L1 page | Areas described | Blocks rendered | Linked / total |
| --- | --- | --- | --- |
| Home | 7 | 13 | 9 / 13 |
| Discover | 9 | 9 | 6 / 9 |
| Learn | 7 | 6 | 2 / 6 |
| Community & Events | 8 | 7 | 3 / 7 |
| Latest News | 5 | 3 + shared news | 0 / 3 (+2 shared) |
| Listen & Watch | 6 | 6 | 2 / 6 |
| About IGIFY | 4 | 3 | 0 / 3 |

Notes:

- Home's "Explore IGIFY" button is the only public control with a real
  destination (Discover).
- News cards can be reached from the member workspace ("Public news →").
- Every other card and section link shows a placeholder message.

## 4. Registered Member — 7 pages

| L1 page | Areas described | Blocks rendered | Linked / total |
| --- | --- | --- | --- |
| Home / My Space | 7 | 3 + shared news | 0 / 3 (+2 shared) |
| My Profile | 3 | 0 (form fields) | Profile dialog only |
| Continue Learning | 3 | 3 | 0 / 3 |
| Saved Resources | 2 | 3 | 0 / 3 |
| Messages | 2 | 3 | 0 / 3 |
| My Groups | 2 | 3 | 0 / 3 |
| Community & Events | 2 | 5 | 4 / 5 (+2 shared) |

Notes:

- My Profile is a real form in a dialog; the page itself lists three fields.
- "Continue Learning", "Saved Resources", "Messages" and "My Groups" each promise
  a list ("View all →") that does not exist.

## 5. Organisation Admin — 7 pages

| L1 page | Areas described | Blocks rendered | Linked / total |
| --- | --- | --- | --- |
| Overview | 4 | 3 | 0 / 3 |
| Organisation Profile | 2 | 2 | 0 / 2 (Edit profile still a placeholder) |
| Members | 3 | 3 | 0 / 3 (Manage roles still a placeholder) |
| Content | 2 | 2 | 0 / 2 |
| Events | 2 | 2 | 0 / 2 |
| Resources | 1 | 2 | 0 / 2 |
| Reports | 1 | 2 | 0 / 2 (View reports still a placeholder) |

Created drafts appear in *Content* and *Events* lists, but a draft cannot be
opened, edited or submitted — the list is read-only.

## 6. IGIFY Administrator — 9 pages

| L1 page | Areas described | Blocks rendered | Linked / total |
| --- | --- | --- | --- |
| Dashboard | 6 | 0 (stats + rows) | 0 (View queue still a placeholder) |
| Users & Identity | 5 | 5 | 0 / 5 |
| Organisations | 5 | 5 | 0 / 5 |
| Content & Editorial | 5 | 5 | 0 / 5 |
| Community & Safety | 5 | 5 | 0 / 5 |
| Modules & Services | 5 | 5 | 0 / 5 (Manage services still a placeholder) |
| Appearance & Interface | 5 | 3 | Theme controls work |
| Platform & System | 8 | 8 | 0 / 8 (Configure platform still a placeholder) |
| Audit & Activity | 6 | 5 | 0 / 5 (View audit log still a placeholder) |

The Appearance screen is the only Administrator page with functioning controls
(light theme allocation, Dark Mode, Organisation Admin preview).

## 7. Detail screens (L3) that must exist — 14

None of these are specified in the design document, and none exist. They are
derived from the L2 blocks the document does specify.

| # | Detail screen | Opened from | Status |
| --- | --- | --- | --- |
| 1 | News / announcement article | News and announcement cards | **Built** (pattern + 2 records) |
| 2 | Learning resource / lesson | Learn, Learning spotlight, Learning opportunities | **Built** (pattern + 2 records) |
| 3 | Book / reading item | Reading and books, Saved resources | Not built |
| 4 | Media item and player | Listen & Watch (radio, TV, video) | **Built** (pattern + 1 record, no player) |
| 5 | Event detail | Upcoming, learning and faith events | **Built** (pattern + 1 record) |
| 6 | Public group detail | Public group information, My Groups | **Built** (pattern + 1 record) |
| 7 | Organisation public profile | Organisation updates, notices | **Built** (pattern + 1 record) |
| 8 | Search results | Search IGIFY field | **Built** (local content; not connected to Migle) |
| 9 | Notification archive | "View all" in the inbox | Not built |
| 10 | Draft / content record with approval | Content & Editorial, Organisation Content | **Built** — edit, submit, approve, reject, publish |
| 11 | User record | Users & Identity | Not built |
| 12 | Organisation record | Organisations | Not built |
| 13 | Audit event | Audit & Activity | Not built |
| 14 | Service / module record | Modules & Services | Not built |

Eight of the fourteen now have a working screen: six record types through one
shared layout, plus search results and the draft/approval record. The remaining
six need decisions (record fields, retention, notification history) rather than
just markup.

Two further screens are implied but arguably belong to L1:

- **Access denied / not available** state for workspaces the account may not enter.
- **Offline queue** view showing pending writes (needed once the outbox is wired).

## 8. Controls that currently lead nowhere

| Control type | Count | Behaviour today |
| --- | --- | --- |
| Card action buttons | 126 | 28 navigate, **98 show a placeholder toast** |
| Section links ("View all", "View history") | 5 | Placeholder toast |
| Panel action buttons (Edit profile, Manage roles, View reports, View queue, Manage services, Configure platform, View audit log) | 7 | Placeholder toast |
| **Total still leading nowhere** | **110** | — |

Working controls: page navigation, workspace switching, workspace-relative card
links to pages (12), detail links (16), back navigation, browser back/forward,
profile dialog, notifications dialog, Create dialog (6 types), theme allocation,
Dark Mode, Organisation Admin preview, Photo credits, sidebar collapse.

## 9. What the plan does not yet specify

These decisions are needed before the missing screens can be built consistently:

1. **Route model.** ~~There is no URL routing today.~~ **Resolved:** hash routing
   is implemented (`src/router.js`), validated against the known workspaces and
   pages, and covered by `scripts/test-router.mjs`. Detail routes carry a record
   type and id.
2. **Search results screen.** ~~No screen or result layout is defined.~~
   **Resolved:** `#/{workspace}/Search?q=...` renders ranked results from the
   demonstration catalogue and the workspace pages. Connecting Migle remains
   open.
3. **Draft/approval screen.** The status machine is defined in the API contract,
   but not the reviewer's screen — still open.
4. **Notification archive.** The inbox is described; browsing history is not —
   still open.
5. **Empty, unavailable and offline states** for each detail screen — partially
   handled: an unknown record falls back to the page instead of a blank screen,
   but there is no explicit "not found" state.
6. **Which L3 screens are public vs member-only** (for example, can a guest open
   an organisation profile?) — still open; the prototype currently allows it.

## 10. Recommended build order

1. ~~**Routing and a record detail pattern**~~ — **done**: hash routing plus one
   shared detail layout, proven on news, learning, events, groups, organisations
   and media.
2. **Complete the public detail set** — the book/reading item still has no
   screen, and the media page needs an actual player.
3. **Search results** — turns the header field from decoration into function.
4. **Member lists** (Saved, Continue Learning, Messages, Groups) — mostly
   filtered lists over records that will already exist.
5. **Administrator record and approval screens** — highest risk, so built last
   with the permission rules from the API contract already settled.
6. **Empty / offline / denied states** throughout, rather than retrofitted.

## 11. Summary answer

- **Workspace pages:** 30 planned, 30 exist. Nothing missing at this level.
- **Detail screens:** 8 of the 14 needed now work (six through one shared record
  pattern, plus search and the approval record); **6 remain**, none of which the
  plan specifies.
- **Card buttons wired:** 28 of 126 (22%).
- **Controls needing a destination:** **110**.
- The prototype now has a *corridor* through it — routing, back navigation and a
  detail screen — but 98 cards still open nothing.

---

End of inventory.
