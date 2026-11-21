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
| Detail screens implemented | **0** |
| Detail screens needed to make L2 blocks work | **14** (listed in §6) |
| Controls that currently lead nowhere | **139** (126 card buttons + 6 section links + 7 panel buttons) |

**Read this as:** the plan's *breadth* is largely delivered, but its *depth* is
not. Every page is a single scrolling sheet of cards; no card, "See all" link or
panel action reaches a second screen. The plan itself never defined those second
screens, which is why they cannot be cross-checked against it — they have to be
agreed, then built.

## 3. Public WebUI — 7 pages

| L1 page | Areas described | Blocks rendered | Opens a detail screen? |
| --- | --- | --- | --- |
| Home | 7 | 13 | No |
| Discover | 9 | 9 | No |
| Learn | 7 | 6 | No |
| Community & Events | 8 | 7 | No |
| Latest News | 5 | 3 | No |
| Listen & Watch | 6 | 6 | No |
| About IGIFY | 4 | 3 | No |

Notes:

- Home's "Explore IGIFY" button is the only public control with a real
  destination (Discover).
- News cards can be reached from the member workspace ("Public news →").
- Every other card and section link shows a placeholder message.

## 4. Registered Member — 7 pages

| L1 page | Areas described | Blocks rendered | Opens a detail screen? |
| --- | --- | --- | --- |
| Home / My Space | 7 | 3 | No |
| My Profile | 3 | 0 (form fields) | Profile dialog only |
| Continue Learning | 3 | 3 | No |
| Saved Resources | 2 | 3 | No |
| Messages | 2 | 3 | No |
| My Groups | 2 | 3 | No |
| Community & Events | 2 | 5 | No |

Notes:

- My Profile is a real form in a dialog; the page itself lists three fields.
- "Continue Learning", "Saved Resources", "Messages" and "My Groups" each promise
  a list ("View all →") that does not exist.

## 5. Organisation Admin — 7 pages

| L1 page | Areas described | Blocks rendered | Opens a detail screen? |
| --- | --- | --- | --- |
| Overview | 4 | 3 | No |
| Organisation Profile | 2 | 2 | No (Edit profile is a placeholder) |
| Members | 3 | 3 | No (Manage roles is a placeholder) |
| Content | 2 | 2 | No |
| Events | 2 | 2 | No |
| Resources | 1 | 2 | No |
| Reports | 1 | 2 | No (View reports is a placeholder) |

Created drafts appear in *Content* and *Events* lists, but a draft cannot be
opened, edited or submitted — the list is read-only.

## 6. IGIFY Administrator — 9 pages

| L1 page | Areas described | Blocks rendered | Opens a detail screen? |
| --- | --- | --- | --- |
| Dashboard | 6 | 0 (stats + rows) | No (View queue is a placeholder) |
| Users & Identity | 5 | 5 | No |
| Organisations | 5 | 5 | No |
| Content & Editorial | 5 | 5 | No |
| Community & Safety | 5 | 5 | No |
| Modules & Services | 5 | 5 | No (Manage services is a placeholder) |
| Appearance & Interface | 5 | 3 | Theme controls work |
| Platform & System | 8 | 8 | No (Configure platform is a placeholder) |
| Audit & Activity | 6 | 5 | No (View audit log is a placeholder) |

The Appearance screen is the only Administrator page with functioning controls
(light theme allocation, Dark Mode, Organisation Admin preview).

## 7. Detail screens (L3) that must exist — 14

None of these are specified in the design document, and none exist. They are
derived from the L2 blocks the document does specify.

| # | Detail screen | Opened from | Needed for |
| --- | --- | --- | --- |
| 1 | News / announcement article | News and announcement cards | Reading a story |
| 2 | Learning resource / lesson | Learn, Learning spotlight, Learning opportunities | Viewing material, member progress |
| 3 | Book / reading item | Reading and books, Saved resources | Reading, saving |
| 4 | Media item and player | Listen & Watch (radio, TV, video) | Playback entry |
| 5 | Event detail | Upcoming, learning and faith events | Venue, time, registration |
| 6 | Public group detail | Public group information, My Groups | Joining, posting |
| 7 | Organisation public profile | Organisation updates, notices | The organisation's own page |
| 8 | Search results | Search IGIFY field | Any search result at all |
| 9 | Notification archive | "View all" in the inbox | Older notifications |
| 10 | Draft / content record with approval | Content & Editorial, Organisation Content | Open, edit, submit, approve |
| 11 | User record | Users & Identity | Registration review, KYC decision |
| 12 | Organisation record | Organisations | Approval, suspension |
| 13 | Audit event | Audit & Activity | Inspecting a single event |
| 14 | Service / module record | Modules & Services | Enable, configure, health |

Two further screens are implied but arguably belong to L1:

- **Access denied / not available** state for workspaces the account may not enter.
- **Offline queue** view showing pending writes (needed once the outbox is wired).

## 8. Controls that currently lead nowhere

| Control type | Count | Behaviour today |
| --- | --- | --- |
| Card action buttons ("Explore →", "Open section →") | 126 | Placeholder toast |
| Section links ("See all", "View all", "View history") | 6 | Placeholder toast |
| Panel action buttons (Edit profile, Manage roles, View reports, View queue, Manage services, Configure platform, View audit log) | 7 | Placeholder toast |
| **Total** | **139** | — |

Working controls, for contrast: profile dialog, notifications dialog, Create
dialog (6 types), theme allocation, Dark Mode, Organisation Admin preview,
Photo credits, sidebar collapse, workspace switching, page navigation.

## 9. What the plan does not yet specify

These decisions are needed before the missing screens can be built consistently:

1. **Route model.** There is no URL routing today; L3 screens need addresses
   (for example `#/public/news/{id}`) so they can be linked and reloaded.
2. **Search results screen.** "Unified Search IGIFY" is described, but no screen
   or result layout is defined.
3. **Draft/approval screen.** The status machine is defined in the API contract,
   but not the reviewer's screen.
4. **Notification archive.** The inbox is described; browsing history is not.
5. **Empty, unavailable and offline states** for each detail screen.
6. **Which L3 screens are public vs member-only** (for example, can a guest open
   an organisation profile?).

## 10. Recommended build order

1. **Routing and a record detail pattern** — one screen shell that L3 pages
   reuse, so 14 screens cost far less than 14 bespoke builds.
2. **Public detail screens** (news, learning, media, event, group, organisation)
   — highest visitor value, and they exercise the pattern.
3. **Search results** — turns the header field from decoration into function.
4. **Member lists** (Saved, Continue Learning, Messages, Groups) — these are
   mostly filtered lists over records that will already exist.
5. **Administrator record and approval screens** — highest risk, so built last
   with the permission rules from the API contract already settled.
6. **Empty / offline / denied states** throughout, rather than retrofitted.

## 11. Summary answer

- **Workspace pages:** 30 planned, 30 exist. Nothing missing at this level.
- **Detail screens:** 0 exist; **14 needed**, none specified in the plan.
- **Controls needing a destination:** **139**.
- The prototype is a complete *map* of IGIFY with no *rooms* behind the doors.

---

End of inventory.
