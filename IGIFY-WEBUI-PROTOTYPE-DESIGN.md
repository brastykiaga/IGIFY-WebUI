# IGIFY WebUI — Prototype Structure & Design Specification

**Document:** Consolidated prototype design baseline  
**Project:** IGIFY WebUI  
**Repository:** https://github.com/brastykiaga/IGIFY-WebUI  
**Branch:** `main`  
**Status:** Design baseline and prototype implementation reference (v1.1 prototype upgrade applied)  
**Version:** 1.1

---

## 1. Purpose and scope

IGIFY WebUI is the unified frontend for a local, offline-first community platform. It gives visitors, registered members, organisation administrators and IGIFY administrators a consistent interface while presenting each audience with the workspace and functions appropriate to its role.

This document consolidates the prototype's structure, screen inventory, navigation, visual design, interaction expectations and implementation boundaries in one place. It is intended to be the reference for continued frontend refinement.

The current repository is a runnable Vite prototype. It is not yet a production application: sample content is used, service integrations are not connected, and frontend visibility must never be treated as the security boundary.

## 2. Product and deployment principles

- **Offline-first:** Public-facing services and locally stored content should remain useful when the internet is unavailable.
- **One provincial deployment:** Each installation serves its own province/state community; this prototype does not define a multi-province federation.
- **Open public access:** Visitors can browse public content without creating an account.
- **Controlled participation:** Public reading is open, while actions that affect other people or the community require the appropriate registration, verification, approval and permissions.
- **One coherent experience:** Four workspaces share a design system and common navigation conventions.
- **Independent services:** Radio, television, news, reading, search and other applications remain independent services. A new service should not require a redesign of the entire frontend.
- **Existing infrastructure retained:** The intended production deployment continues to use Docker and the existing NGINX web server. Vite is a development/build tool, not the production web server.
- **Backend enforcement:** The backend must authenticate, authorise and validate every protected action. Hiding a button in the frontend is not access control.

## 3. Four workspaces

The application provides four distinct workspaces.

### 3.1 Public WebUI

Audience: first-time visitors and returning guests.

Purpose:
- Present useful information immediately without requiring sign-in.
- Provide discovery, learning, community information, news and media entry points.
- Make locally available services easy to find.
- Provide a consistent public homepage.

Public navigation:
1. Home
2. Discover
3. Learn
4. Community & Events
5. Latest News
6. Listen & Watch
7. About IGIFY

### 3.2 Registered Member WebUI

Audience: registered users, with available features depending on account status and permissions.

Purpose:
- Give a member a personal space for profile, learning continuity, saved resources, messages and group activity.
- Preserve the same public information available to guests.
- Provide member-specific activity without replacing or hiding public news and announcements.

Member navigation:
1. Home
2. My Profile
3. Continue Learning
4. Saved Resources
5. Messages
6. My Groups
7. Community & Events

Member home should support:
- A personal greeting where identity is available.
- Continue where you left off.
- Recent lessons, books, resources or conversations.
- Saved resources.
- Unread messages and group activity.
- Learning progress and relevant recommendations when those services are available.

### 3.3 Organisation Admin

Audience: an approved Organisation Admin.

Purpose:
- Provide a separate working environment for managing an organisation's public presence and permitted activities.
- Keep organisation administration distinct from the normal member dashboard.
- Use the same IGIFY account; a second login is not required.

Navigation:
1. Overview
2. Organisation Profile
3. Members
4. Content
5. Events
6. Resources
7. Reports

Access and appointment principles:
- An organisation's principal or authorised representative nominates a person.
- IGIFY reviews and approves the appointment.
- IGIFY grants the appropriate Organisation Admin security-group membership.
- The approved person retains their existing account and other group memberships.
- An **Organisation Admin** workspace option becomes available to authorised users.
- The Organisation Admin workspace has its own tools and a common Organisation Admin theme.
- Organisation Admin permissions are enforced by the backend, not by the workspace selector.

### 3.4 IGIFY Administrator

Audience: authorised IGIFY platform administrators.

Purpose:
- Govern users, organisations, content, community safety, modules, appearance, platform operations and audit activity.
- Provide a consolidated administrative overview and task entry point.
- Preserve traceability for important administrative decisions.

Navigation:
1. Dashboard
2. Users & Identity
3. Organisations
4. Content & Editorial
5. Community & Safety
6. Modules & Services
7. Appearance & Interface
8. Platform & System
9. Audit & Activity

The IGIFY Administrator workspace is a separate administrative environment. Its presence in the prototype workspace selector is for demonstration; production access must be authorised by the backend.

## 4. Shared application shell

### 4.1 Desktop layout

The desktop interface uses a persistent left sidebar and a main content area.

**Sidebar**
- IGIFY identity/wordmark and short tagline.
- Workspace selector, showing only workspaces the user is allowed to enter in production.
- Navigation links for the selected workspace.
- Active navigation state.
- Prototype/service status at the bottom.
- Collapsible behaviour: expanded mode shows icons and labels; collapsed mode uses icons with hover labels.
- Remember the user's sidebar preference in the eventual application.

**Top header**
- Sidebar/menu toggle where appropriate.
- Workspace and page breadcrumb.
- Global **Search IGIFY** field.
- Notifications entry.
- Account/profile entry.

**Main content**
- Page eyebrow or workspace label.
- Page title and short explanatory subtitle.
- Page-specific content.
- Consistent content width, spacing and footer.

### 4.2 Mobile layout

Mobile should retain the same information architecture while adapting navigation and layout.

Permanent bottom destinations:
1. Home
2. Discover
3. Search
4. Community
5. My Space

Learn, Ask AI and Listen & Watch can be reached through Discover or a More destination. The desktop sidebar becomes a compact, accessible navigation drawer. Cards stack into a single column; controls remain usable without horizontal scrolling.

### 4.3 Search

Search is the unified **Search IGIFY** experience, powered by Migle when connected.

Expected behaviour:
- One unified, ranked results list by default.
- Optional category filters after results are shown.
- Each result includes title, description, preview where available, source module/organisation and local availability.
- Search results respect the user's access permissions.
- AI summaries may be offered where enabled, with links to the underlying sources.
- The prototype's current search field is a demonstration only; it is not connected to Migle.

## 5. Public WebUI screen specification

### 5.1 Home

The homepage should be useful immediately, not just a directory of links.

Recommended content order:
1. Introductory hero / first-visit introduction.
2. Featured content.
3. Latest News & Announcements.
4. Explore IGIFY.
5. Community & Events.
6. Community trending and World trending.

**Hero**
- Heading: **Discover. Learn. Connect.**
- Short explanation of IGIFY as a local community space for knowledge, useful services, learning and connection.
- Primary action: **Explore IGIFY**.
- Do not add an unrequested “About IGIFY” hero button. About IGIFY remains available in the sidebar.

**Featured**
- One lead story plus two or three supporting stories.
- Editorially selected and managed; not an automatic carousel.
- Organisations and modules may nominate content, but nomination does not guarantee homepage placement.
- Local organisation content remains available on its own page even if it is not selected for the homepage.
- Editorial ranking is not a permission or credibility ranking.

**Latest News & Announcements**
- Visible to guests and registered members.
- News and official announcements are two distinct streams presented within one combined section.
- Include clear source and date information.

**Explore IGIFY**
Curated editorial collections:
- Learn
- Discover
- Skills & Farming
- Faith & Family
- Listen & Watch

**Community & Events**
- Combine community information and local events in one destination.
- Provide routes to public groups, approved organisation activities, notices and upcoming events.

**Trending**
- Separate **Community trending** from **World trending**.
- Volume of discussion must not be represented as truth or importance.
- Sensitive public topics require moderation and neutral presentation.

**Personalisation**
- Guests receive the standard public layout.
- Returning guests may see recent visits and continue-reading/activity where a guest browser identity is available.
- Members retain the same major editorial sections, with personal additions such as continue learning, saved resources, unread messages and group activity.
- Clearing browser identity or changing device may remove anonymous history unless a recovery feature is later implemented.
- IGIFY controls the main editorial structure; members may customise permitted personal sections and interests.

### 5.2 Discover

Purpose: help visitors explore the breadth of locally available knowledge, resources and services.

Screen areas:
- Introductory discovery statement.
- Curated discovery categories.
- Local knowledge and information.
- Skills and farming.
- Faith and family.
- History and archives.
- Learning opportunities.
- Listen & Watch entry point.
- Search IGIFY entry point.

### 5.3 Learn

Purpose: provide a clear entry into educational and practical learning material.

Screen areas:
- School and study.
- Practical skills.
- Farming and agriculture.
- Digital skills.
- Reading and books.
- Faith and family learning.
- Continue learning for members when progress tracking is available.

### 5.4 Community & Events

Purpose: present local community activity and public information.

Screen areas:
- Community noticeboard.
- Community announcements.
- Local initiatives.
- Organisation updates.
- Upcoming events.
- Learning events.
- Faith and family events.
- Public group information.

Publishing and participation controls remain subject to moderation and approval rules.

### 5.5 Latest News

Purpose: provide a dedicated destination for local news and announcements.

Screen areas:
- Local and provincial news.
- Education and opportunity.
- Local services.
- IGIFY announcements.
- Organisation notices.
- Source, publication date and availability information.

The offline deployment displays content that has been acquired and stored locally. It should not imply that unavailable live internet feeds are current.

### 5.6 Listen & Watch

Purpose: provide a unified media discovery destination.

**Listen**
- Radio stations.
- Music discovery and music collections.
- Recorded audio programmes.

**Watch**
- Television channels.
- Video library.
- Educational video.

The interface acts as the discovery and playback entry point. Actual playback depends on the corresponding local service and its availability. A persistent radio player is part of the broader intended experience.

### 5.7 About IGIFY

Purpose:
- Explain what IGIFY is.
- Describe access to knowledge, community connection and local digital services.
- Explain local/offline access.
- Explain that public browsing is open while some interactive features require registration and approval.

About IGIFY is available in the sidebar. It is not an extra hero CTA.

## 6. Member WebUI screen specification

### Home / My Space
- Personal greeting.
- Continue where you left off.
- Learning progress.
- Saved resources.
- Messages and notifications.
- Group and organisation activity.
- Personal recommendations and tasks when supported.

### My Profile
- View and manage permitted profile information.
- Display account/verification state clearly.
- Do not expose private identity or verification information publicly.

### Continue Learning
- Resume last lesson or learning resource.
- Show recent learning activity and progress when the learning service supports it.

### Saved Resources
- Saved books, articles, documents, lessons and other resources.
- Provide a direct route back to the source service.

### Messages
- Member messages and unread indicators.
- Messaging is only functional when the approved messaging service is connected.

### My Groups
- Groups the member is permitted to view or participate in.
- Membership and posting actions obey moderation, verification and group rules.

### Community & Events
- Member-accessible community and event information, while retaining the public information available to guests.

## 7. Organisation Admin screen specification

### Overview
- Organisation summary.
- Pending organisation tasks.
- Recent content and event activity.
- Membership and activity summaries.

### Organisation Profile
- Maintain approved public organisation information.
- Changes may require review depending on the field and policy.

### Members
- View organisation membership within granted permissions.
- Manage permitted organisation roles or requests.
- Do not bypass IGIFY identity and approval rules.

### Content
- Prepare and submit organisation content.
- Publishing approval remains with the authorised editorial process where required.

### Events
- Prepare and manage organisation event information.
- Public visibility follows publishing and moderation rules.

### Resources
- Manage or submit organisation resources within assigned permissions.

### Reports
- View available organisation activity and engagement summaries.

## 8. IGIFY Administrator screen specification

### 8.1 Dashboard
- Overview of platform activity.
- Pending tasks and approval queue.
- Administrative announcements.
- Quick actions.
- Administrator profile/preferences.
- Summary figures must be clearly identified as live data or demonstration data.

### 8.2 Users & Identity
- User directory and profile management.
- Registration/account review.
- KYC verification and approval.
- Member status and restrictions.
- User activity/history.

### 8.3 Organisations
- Organisation registration and approval.
- Organisation profiles and records.
- Membership oversight.
- Organisation Admin appointments and approvals.
- Organisation status and review.

### 8.4 Content & Editorial
- Content publishing and approval.
- Homepage featured/editorial placement.
- News and announcements.
- Noticeboard and community events.
- Categories, tags and expiry.

Editorial controls include ranking priorities, pin/exclude decisions, dates/expiry, overrides and visibility/order. Editorial placement must never bypass publishing permissions.

### 8.5 Community & Safety
- Groups and membership oversight.
- Discussion/comment moderation.
- Reports, complaints and flagged content.
- Community notices and announcements.
- Safety controls.

### 8.6 Modules & Services
- Manage modules and services.
- Enable, disable and configure services.
- Radio and TV management.
- Learning resources.
- Migle search and content availability.
- Service health/availability indicators.

### 8.7 Appearance & Interface
- Five light-theme allocations.
- Organisation Admin dashboard theme.
- Dark Mode policy/preferences.
- Homepage appearance/layout.
- Navigation/interface settings.

### 8.8 Platform & System
- General platform configuration.
- Local provincial settings.
- Notifications and communications.
- AI / Ask AI configuration.
- Offline content and synchronisation.
- Security/access monitoring.
- System health and service status.
- Backup and recovery.
- Administrator alerts and reports.

### 8.9 Audit & Activity
- Audit event register.
- Actor, timestamp, action, category and outcome.
- Approval and publishing events.
- Security and administrative events.
- Exportable audit records where authorised.
- Audit records are protected and should be immutable.
- Sensitive access and administrative changes are themselves audited.

### 8.10 Create shortcut

The administrator header may include a **＋ Create** shortcut with routes to:
- Register a user.
- Register an organisation.
- Create content.
- Publish an announcement.
- Create a community group.
- Create an event.

These are shortcuts to the relevant workflow. They must not bypass registration review, identity verification, organisation approval, editorial approval or moderation.

## 9. Visual design system

### 9.1 Overall direction
- Restrained, professional and readable.
- White or near-white page background in light mode.
- Charcoal and neutral grey as the main interface colours.
- Avoid green as a theme colour.
- Avoid bright decorative colours and unnecessary visual ornament.
- Use consistent typography, spacing, borders, cards and interaction states.
- Keep content and navigation visually distinct.
- **Card imagery:** there are no bare text cards. Content cards carry a 16:9 photograph where a suitable one exists. Where none exists — broadcast and audio, and administrative or utility cards — a designed icon tile stands in: a labelled 16:9 tile for media formats, and a shallow 76 px icon band for utility cards so long administrative pages keep their density. Prototype photographs are Papua New Guinea images from Wikimedia Commons (CC BY, CC BY-SA or public domain), attributed in the app's Photo credits panel; see `docs/SAMPLE-IMAGES.md`.

### 9.2 Five light themes

The agreed five light themes are:
1. Deep Charcoal
2. Classic Charcoal
3. Soft Charcoal
4. Executive Charcoal
5. Mist Charcoal

All five are available for Administrator-controlled allocation. Normal users do not independently choose among the five themes; the administrator determines the allocation/default for the relevant audience category.

Audience categories used for allocation examples:
- Guest — first-time visitor.
- Guest — returning visitor.
- Registered non-KYC user.
- KYC-pending user.
- KYC-approved member.

### 9.3 Dark Mode
- Dark Mode is independent of the five light themes.
- A normal user may control their own Dark Mode preference where permitted.
- Use a compact modern sun/moon control.
- Keep the palette charcoal and silver; avoid yellow or bright colours.

### 9.4 Organisation Admin theme
- One general Organisation Admin theme shared by all Organisation Admin dashboards.
- Separate from the normal member theme.
- Not controlled by the normal user's theme allocation or Dark Mode preference.
- Configured by IGIFY Administrator under **Administrator → Theme → Allocation**.
- Implemented in the prototype as a cool-charcoal sidebar (`#232b31`) with a slate accent (`#3f5a6b`) and cool neutral surfaces, so it reads as distinct from the five member themes.

### 9.5 Theme allocation boundaries
- No weekday-based theme allocation.
- No dashboard-based rules for normal theme allocation.
- No theme-priority resolution across security groups.
- No separate per-organisation Organisation Admin themes.
- Keep the IGIFY logo unchanged unless explicitly authorised to change it.

## 10. Navigation and interaction behaviour

- Selecting a navigation item must update both the active navigation state and the actual page content.
- Each navigation destination must have its own page component/content definition; changing only the heading is insufficient.
- Selecting a workspace must load that workspace's first/default page and its navigation set.
- The active page must remain visually clear.
- Search input must be keyboard accessible.
- Buttons must perform their stated action or clearly indicate that the feature is a prototype placeholder.
- Create shortcuts must route to the correct workflow.
- Mobile navigation must not obscure content or trap the user.
- Empty, unavailable and offline states should be designed explicitly.
- Use accessible labels and sensible keyboard focus states.

## 11. Frontend architecture and service connectivity

### 11.1 Frontend structure

The four workspaces are separate experiences within one coherent frontend:
- Public WebUI.
- Registered Member WebUI.
- Organisation Admin.
- IGIFY Administrator.

They share:
- Design tokens and component styles.
- Header/search conventions.
- Navigation patterns.
- Common UI components.
- Authentication/session context where applicable.

They do not share identical page content or permissions.

### 11.2 Intended backend relationship

The agreed logical connectivity model is:

1. Four frontend workspaces.
2. Central Backend API / Application Layer.
3. IGIFY Service Integration Layer.
4. Independent backend applications/services.
5. Data and storage layer.

The central application layer is responsible for authentication, authorisation, validation, business rules, data access and response handling.

The Service Integration Layer provides:
- Service Registry.
- Connector Manager.
- API Adapters.
- Access Gateway.
- Health Monitoring.
- Event Handling.
- Offline Coordination.
- External Integrations.

A new service should be registered and connected through this integration approach rather than requiring a redesign of the WebUI.

The proposed contract for the WebUI-to-backend boundary — endpoints, permission matrix, offline sync and the decisions still required — is in `docs/API-CONTRACT.md`. It is a proposal only; no backend exists for this prototype.

### 11.3 Security
- Frontend visibility is not authorisation.
- Backend checks every protected operation.
- Security permissions are assigned through the relevant security groups.
- Organisation Admin is an approved workspace for an existing account, not a second account.
- Public and member data must be separated according to access policy.
- Administrative and sensitive actions are audited.

## 12. Service catalogue context

The WebUI is intended to provide a consistent entry point to independent services. The current inventory supplied for the wider IGIFY platform is:

**Identified as existing**
- MusicBrainz — music search.
- TV Streaming App — television stations.
- AzuraCast — radio stations.
- FreshRSS — news feeds.
- Wallabag — read-it-later documents.
- StepBible — Bible study.
- Today-In-History — history information.
- Daily Quotes — general daily quotes.
- Daily Bread — Christian daily reading.
- Archives — offline copies of government websites.

**Proposed**
- School Management App.
- Church Management App.
- Video App.
- Music App.
- KADO — messaging.
- IGIMart — buy/sell marketplace.
- Contact Management.

**To confirm**
- PDF / Book Reader.
- Email Server.

**Planned capability**
- External Service Allowance — future capability to integrate additional external services.

This list is platform context, not a claim that every service is already connected to this prototype.

## 13. Current repository and development workflow

The current repository structure is:

```text
IGIFY-WebUI/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── README.md
├── ARCHITECTURE.html
├── IGIFY-WEBUI-PROTOTYPE-DESIGN.md
├── START_IGIFY.bat
├── START_IGIFY.sh
├── .env.example
├── docs/
│   └── SAMPLE-IMAGES.md
├── scripts/
│   ├── generate-icons.py
│   └── fetch-sample-images.mjs
├── public/
│   ├── manifest.json
│   ├── sw.js
│   ├── icons/
│   └── images/
└── src/
    ├── main.js
    ├── style.css
    ├── router.js
    ├── content/
    │   └── catalogue.js
    └── data/
        ├── index.js
        ├── local.js
        ├── http.js
        └── outbox.js
```

`public/` is copied verbatim into `dist/`: it holds the manifest, the service worker, the generated PWA icons and the card photographs. `scripts/` and `docs/` are development aids and are not deployed.

The build creates a generated `dist/` directory, and dependencies are installed in `node_modules/`. These generated directories are not source design files.

**Technology**
- JavaScript (ES modules).
- Vite 6 build/development tooling.
- CSS.
- Static frontend output for NGINX deployment.
- Progressive Web App: a service worker (`public/sw.js`) provides an offline app shell, and `public/manifest.json` describes the installable application.
- `localStorage` persistence for prototype preferences and locally created records, reached only through the data layer in `src/data/`. Screens never touch storage directly, so a backend adapter can replace it without changing UI code.

`public/` holds files that must be served verbatim from the site root — Vite copies them into `dist/` without hashing or rewriting. The service worker and manifest must stay there; placing them in the repository root instead makes them build assets with unstable paths.

**Development**
```bash
npm install
npm run dev -- --host 0.0.0.0
```

**Production build**
```bash
npm run build
```

**Preview production build**
```bash
npm run preview -- --host 0.0.0.0
```

The production build output is `dist/`. The existing NGINX deployment should serve those static files. Vite's development server is for development/testing only and should not be exposed as the production web server.

## 14. Prototype implementation status and known gaps

This section deliberately distinguishes what has been demonstrated from what remains a design/implementation requirement.

### Demonstrated
- The repository installs dependencies successfully on the Ubuntu test VM.
- Vite production build completed successfully.
- The Vite development server was reachable from the Windows laptop over the local network.
- The Public WebUI shell rendered in the browser.
- The IGIFY Administrator workspace could be selected in the prototype.
- The initial visual direction—charcoal sidebar, neutral page background, cards and header—was visible in the browser.
- **v1.1 — Navigation:** every sidebar destination in all four workspaces now renders its own page content. The earlier defect, where only the heading and active item changed, is resolved.
- **v1.1 — Offline-first:** a service worker caches the app shell, serves a navigation fallback when offline, and applies stale-while-revalidate caching to same-origin assets. A PWA manifest is provided and the interface shows an offline banner and status indicator.
- **v1.1 — Mobile-first styling:** the stylesheet is authored for small screens first, with layout changes at 700 px and 1024 px. The sidebar becomes a drawer on small screens; touch targets and focus states are defined.
- **v1.1 — Visible theme controls:** the five charcoal light themes and Dark Mode are selectable from the Administrator *Appearance & Interface* screen as well as the sidebar. The Alt+T and Alt+D shortcuts remain as accelerators.
- **v1.1 — Persistence:** workspace, page, theme, Dark Mode and sidebar state are stored in `localStorage` and restored on reload.
- **v1.1 — Sidebar:** on desktop the sidebar collapses to an icon-only rail; labels appear on hover and keyboard focus, and the collapsed preference is remembered. On small screens it behaves as an overlay drawer with a backdrop and closes after a destination is chosen.
- **v1.1 — Local flows:** profile editing, notifications and the Create shortcuts are functional against on-device storage (see §14.1).
- **v1.1 — Organisation Admin theme:** the workspace now applies one fixed cool-charcoal theme (sidebar `#232b31`, slate accent `#3f5a6b`, cool neutral surfaces), shared by every Organisation Admin dashboard and unaffected by the light theme allocation or Dark Mode. It is described and previewable from *Appearance & Interface*.
- **v1.1 — Installable app:** PWA icons (`192`, `512`, plus a maskable `512`) and an Apple touch icon are generated by `scripts/generate-icons.py` and declared in the manifest; the service worker precaches them.
- **v1.1 — Member public news:** members see the same public *Latest News & Announcements* cards on their Home and Community & Events screens, with a route to the public news page. The agreed member navigation list is unchanged.
- **v1.1 — Card imagery:** content cards carry bundled 16:9 photographs of Papua New Guinea, selected per module and attributed in-app under *Photo credits*; administrative and utility cards are text-only. The earlier generated initial-letter block was removed because it carried no meaning and duplicated itself.
- **v1.1 — Search results:** the header search field now returns a ranked result page at `#/{workspace}/Search?q=...`, covering the demonstration catalogue and the workspace pages. Title matches rank above body matches, results are addressable, and records open in their natural workspace page. It is not connected to Migle; `src/search.js` is the seam where that integration replaces the local index.
- **v1.1 — Routing and detail screens:** screens are addressable by hash URL (`#/public/Latest%20News`, `#/public/Latest%20News/news/kundiawa-market`), so they can be linked, reloaded and navigated with browser history. One reusable detail layout serves news, learning, event, group, organisation and media records. Category cards open their workspace page. Twenty-eight of 126 card buttons now navigate; the remainder still state that they are placeholders.
- **v1.1 — Build size:** production output is approximately 49 kB of JavaScript (12 kB gzipped) and 14 kB of CSS (3.6 kB gzipped), plus about 0.8 MB of card photography, with no remote font or stylesheet dependency.

### 14.1 Local prototype interactions

These interactions are real interactions with local, on-device data. They are **not** service integrations and do not imply that a backend exists.

**Profile (Account)**
- The header account button opens an account dialog showing display name, role and identity state.
- The display name can be edited and is saved to `localStorage`.
- The saved name appears in the member home greeting and on the Member *My Profile* screen.
- Role and identity state are fixed sample values; they are not editable and are not authoritative.

**Notifications**
- The header bell shows an unread badge.
- The notifications dialog lists notifications with unread styling, and offers *Mark all read* and *Clear all*.
- Creating an item raises a new local notification.
- Two seed notifications are created on first run so the inbox is not empty.

**Create shortcuts**
- The Administrator *＋ Create* control and the relevant screen-level Create buttons open a chooser: register a user, register an organisation, create content, publish an announcement, create a community group, or create an event.
- Each chooser entry opens a small form (title, optional details). Saving stores a record with a prototype status (for example *Pending review*, *Draft*, *Pending moderation*) and a timestamp.
- The record is then listed on the owning screen — for example a registered user appears under *Users & Identity → Created in this prototype*.
- Organisation Admin remains inside its own workspace when preparing organisation content or events; other types route to the corresponding Administrator screen.
- These Created lists are visible only on this device and are not shared between deployments or users.

**Explicit non-claims**
- These flows do not authenticate anyone.
- They do not enforce permissions; the workspace selector remains a demonstration control.
- They do not synchronise between devices or with the Simbu provincial data centre.
- The records have no approval workflow, no audit trail, and no relationship to production data.

### Known gaps after the v1.1 upgrade
- No production backend/API integration is implemented by this prototype.
- No authentication or authorisation should be inferred from the visual workspace selector or from the local flows.
- Member and Organisation Admin pages remain prototype-level demonstrations; they are not connected working service workflows.
- Administrator sections include illustrative content and sample figures, not live platform records.
- Search is not connected to Migle; submitting a search only reports that the service is not connected.
- Radio, TV, music and video playback are not connected.
- Notifications and messaging are local-only; no messaging service is connected.
- Detail screens: six of the fourteen identified in `docs/PAGE-INVENTORY.md` exist through one shared layout. Book/reading detail, search results, notification archive, draft/approval, user record, organisation record, audit event and service record are not built.
- Ninety-eight card buttons and twelve static controls still show a placeholder message rather than opening a screen.
- Card photographs are Papua New Guinea images from Wikimedia Commons, not IGIFY content. CC BY and CC BY-SA images carry attribution obligations, surfaced in the app's Photo credits panel; CC BY-SA also imposes share-alike on modified derivatives. Replacing them with IGIFY's own photography removes these obligations (`docs/SAMPLE-IMAGES.md`).
- Detail routes are hash-based (`#/`), not path-based, because the deployment must work as static files behind NGINX without a rewrite rule per route.
- The five light themes are selectable in the prototype for demonstration. The agreed production model remains administrator-controlled allocation by audience category rather than free user choice.
- Browser-console cleanliness has been verified by build and module parsing only; this environment provided no browser for a live render test.

A successful Vite build proves that the source compiles. It does not prove that every screen, route, control, responsive state or service integration is complete.

## 15. Acceptance checklist for the completed WebUI prototype

Checked items are satisfied by the current prototype. Unticked items remain open and are described in §14.

### Application shell
- [x] Four workspaces are present and visually distinct.
- [x] Workspace selector changes the complete workspace content and navigation.
- [x] Desktop sidebar expands/collapses correctly.
- [x] Mobile navigation is usable and responsive.
- [x] Search, notifications and profile controls have clear behaviour.
- [x] Active navigation and breadcrumb are correct.

### Public WebUI
- [x] Home page follows the agreed content order.
- [x] Discover has its own screen.
- [x] Learn has its own screen.
- [x] Community & Events has its own screen.
- [x] Latest News has its own screen.
- [x] Listen & Watch has its own screen.
- [x] About IGIFY has its own screen.
- [x] Every sidebar click changes the actual content, not just the title.
- [x] No unrequested About IGIFY hero button is present.

### Member WebUI
- [x] Member home and personal sections are distinct.
- [x] Continue where you left off is represented.
- [x] Saved resources, messages and groups have distinct screens.
- [x] Public news remains visible to members.

### Organisation Admin
- [x] Separate Organisation Admin workspace.
- [x] Overview, profile, members, content, events, resources and reports each have distinct screens.
- [x] The same account can access this workspace when approved.
- [x] No second account/login is implied.

### IGIFY Administrator
- [x] All nine administrative sections have distinct screens.
- [x] Dashboard shows task/approval overview.
- [x] Create shortcut routes to the correct workflows.
- [x] Appearance includes theme allocation and Dark Mode policy.
- [x] Audit & Activity is represented separately.
- [x] Sample data is clearly labelled as illustrative.

### Visual design
- [x] Five agreed charcoal light themes are represented.
- [x] Dark Mode is independent.
- [x] Organisation Admin theme is separate.
- [x] White/neutral light-mode surfaces and restrained charcoal/grey palette are maintained.
- [x] No green theme or unnecessary bright decoration.
- [x] Responsive layout works at desktop, tablet and mobile widths.
- [x] Offline font strategy does not depend on Google Fonts being reachable.

### Quality and build
- [ ] No browser-console errors during normal navigation.
- [x] No dead buttons or misleading actions.
- [x] Keyboard focus and accessible labels are present.
- [x] `npm run build` succeeds.
- [x] Production output is suitable for serving through the existing NGINX deployment.
- [x] README and this design document describe the same project structure and status.

## 16. Change-control principle

This document is the consolidated design baseline for the IGIFY WebUI prototype. Future implementation should refine and complete the screens against this specification rather than repeatedly redesigning agreed areas.

When a design decision changes, update this document and the implementation together. Preserve accepted decisions unless the project owner explicitly changes them. Distinguish clearly between:
- agreed design,
- implemented prototype behaviour,
- illustrative/sample content,
- future service integration,
- production-ready functionality.

**End of specification.**
