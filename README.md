# IGIFY WebUI Prototype v1.1

A frontend-only demonstration of the four IGIFY user environments — offline-first,
mobile-first, lightweight and fast.

## What's new in v1.1

- **Navigation fixed:** every sidebar destination renders its own page content
  (Public, Member, Organisation Admin, Administrator).
- **Offline-first:** a service worker caches the app shell; the interface keeps
  working without internet after the first visit.
- **Mobile-first:** authored for small screens first, with layout changes at
  700 px and 1024 px.
- **Visible theme controls:** five charcoal light themes plus Dark Mode
  (Alt+T / Alt+D remain as accelerators).
- **Organisation Admin theme:** one fixed cool-charcoal theme, independent of the
  light theme allocation and Dark Mode.
- **Photographic content cards:** fourteen Papua New Guinea photographs from
  Wikimedia Commons, assigned per card so a page does not repeat one image across
  a grid; credited in-app under *Photo credits*. Cards with no suitable
  photograph use a designed icon tile instead — a labelled tile for broadcast
  formats, a compact icon band for administrative cards. No card is left bare.
  Replace the photographs with IGIFY's own when available (`docs/SAMPLE-IMAGES.md`).
- **Inline SVG icons:** the interface uses a drawn 24 px icon set instead of
  font-dependent Unicode symbols, so icons render identically on every device.
- **Member public news:** public news and announcements remain visible in the
  member workspace.
- **Collapsible sidebar:** an icon rail on desktop with hover/focus labels; an
  overlay drawer with backdrop on small screens. The choice is remembered.
- **Complete detail set:** books, notifications archive, organisation suspension
  and the service register all have working screens. All fourteen detail screens
  identified in `docs/PAGE-INVENTORY.md` are built.
- **Registration review and audit trail:** registrations and groups are decided
  once (approved or rejected) by an administrator, and every creation, edit and
  status change writes an audit event that is browsable in *Audit & Activity*.
- **Draft and approval workflow:** created records open in a record screen with
  status, history and role-appropriate actions (edit and submit as author;
  approve, reject or publish as reviewer). Status transitions are enforced in the
  data layer, not only by hiding buttons.
- **Search results:** the header field now returns ranked results across content and
  workspace pages, at a shareable address (`#/public/Search?q=coffee`). Local
  index only — not yet connected to Migle.
- **Routing and detail screens:** every screen has a shareable hash URL, and one
  reusable detail layout serves news, learning, event, group, organisation and
  media records. Browser back/forward works.
- **Working local flows:** account/profile editing, a notifications inbox with an
  unread badge, and Create shortcuts (user, organisation, content, announcement,
  group, event) that save drafts and list them on the owning screen.
- **Accessibility:** focus-visible states, ARIA labels, keyboard navigation,
  Escape closes dialogs and the drawer.
- **PWA:** manifest, service worker and generated icons (192, 512, maskable,
  Apple touch), copied verbatim from `public/`.
- **Lightweight:** system font stack, roughly 51 KB of JavaScript (~13 KB
  gzipped) and 14 KB of CSS (~3.6 KB gzipped).

> The profile, notification and create flows store data on this device only.
> They do not authenticate anyone, enforce permissions, or connect to a backend,
> and must not be read as production access control.

## Requirements

- Node.js 20.19+ or 22.12+ (Node.js 22 LTS recommended)
- npm

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`). The dev server
binds to `0.0.0.0`, so a machine on the same network can reach
`http://<host-ip>:5173`; restrict that port to a trusted test network.

## Production build

```bash
npm run build
```

Vite writes a static site to `dist/`. Serve its contents from the existing NGINX
container — Vite is a build tool, not the production web server.

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

Use the correct `root` for your deployment. If the app is hosted under a
sub-path, set Vite's `base` option before building.

## Data layer and backend readiness

Screens never touch storage directly. Persistence sits behind
`src/data/index.js`:

- `local.js` — the adapter currently in use (localStorage), including a one-time
  migration of data written by older prototype versions.
- `http.js` — an adapter implementing the same methods against
  `docs/API-CONTRACT.md`, with optimistic writes through the outbox.
  **Implemented and tested, not yet wired into the UI**; wiring requires the call
  sites to await.
- `outbox.js` — queued writes with ordering, exponential backoff and replay
  after reconnect, de-duplicated by `clientId`.

The API contract, permission matrix, offline behaviour and Docker deployment
shape are specified in `docs/API-CONTRACT.md`.

## Development tools

```bash
node scripts/mock-api.mjs 8099         # in-memory mock of the API contract
node scripts/test-http-store.mjs       # adapter + outbox checks against the mock
node scripts/test-router.mjs           # route parsing and rejection checks
node scripts/test-search.mjs           # search relevance and edge cases
node scripts/test-workflow.mjs         # editorial status transitions and roles
node scripts/test-store.mjs            # record lifecycle and store guards
node scripts/fetch-png-photos.mjs      # search Commons for card photography
python scripts/build-contact-sheet.py  # labelled review sheet of candidates
python scripts/adopt-photos.py         # crop and resize chosen photos
python scripts/generate-icons.py       # regenerate PWA icons
```

## Prototype limitations

This is a frontend demonstration. Login, KYC verification, approval workflows,
publishing, search indexing, radio/video playback and service integrations use
illustrative sample data and do not connect to production services. Frontend
visibility is not an access-control boundary; the backend must enforce all
authentication and permissions.

Card photographs are third-party images under CC BY, CC BY-SA or public domain;
their attribution obligations are recorded in `docs/photo-credits.json` and shown
in the app. Replacing them with IGIFY's own photography removes those
obligations.

## Environments included

- Public
- Registered Member
- Organisation Admin
- IGIFY Administrator

## Theme

Five light charcoal/grey themes and a separate user-controlled Dark Mode are
included as a visual prototype. Organisation Admin uses its own fixed theme.

## Documentation

- `IGIFY-WEBUI-PROTOTYPE-DESIGN.md` — consolidated design baseline and status.
- `docs/PAGE-INVENTORY.md` — page-by-page inventory, counts and missing detail screens.
- `docs/API-CONTRACT.md` — proposed backend boundary, offline model, Docker shape.
- `docs/SAMPLE-IMAGES.md` — photography provenance and replacement steps.
- `ARCHITECTURE.html` — layered platform diagram.

## Repository workflow

Do not commit API keys, passwords, private certificates, `.env` files or other
secrets.

**Source files are UTF-8.** Avoid round-tripping them through PowerShell
`Get-Content`/`Set-Content`: on Windows PowerShell 5.1 `Get-Content` decodes
UTF-8 as ANSI, so writing it back double-encodes every non-ASCII character
(interface icons such as `⌂` render as `âŒ‚`). Use the editor tools, or specify
`-Encoding UTF8` on both read and write, and never leave a byte-order mark.
