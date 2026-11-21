# IGIFY WebUI Prototype v1.1

A frontend-only demonstration of the four IGIFY user environments — offline-first, mobile-first, lightweight and fast.

## What's new in v1.1
- **Navigation fixed:** Every sidebar destination now renders its own dedicated page content (Public, Member, Organisation Admin, Administrator)
- **Offline-first:** Service worker caches the app shell; works without internet after first visit
- **Mobile-first responsive:** Designed for small screens first, scales up to desktop
- **Visible theme controls:** 5 charcoal light themes + Dark Mode (keyboard shortcuts Alt+T / Alt+D still work)
- **localStorage persistence:** Remembers theme, dark mode, sidebar state, and workspace across visits
- **Offline/online status banner:** Shows when the device is offline
- **Collapsible sidebar:** on desktop it collapses to an icon rail with hover/focus labels; on small screens it is an overlay drawer with a backdrop that closes after navigation. The choice is remembered per device.
- **Working local flows:** Account/profile editing, a notifications inbox with unread badge, and Create shortcuts (user, organisation, content, announcement, group, event) that save drafts and list them on the owning screen
- **Lightweight:** System font stack (no remote Google Fonts), ~43 KB JavaScript (~10 KB gzipped)
- **Accessibility:** Focus-visible states, ARIA labels, keyboard navigation, Escape closes dialogs and the sidebar
- **PWA:** `public/manifest.json` and `public/sw.js`, copied verbatim into `dist/` by Vite

> The profile, notification and create flows store data on the device only. They do not authenticate anyone, enforce permissions, or connect to a backend, and should not be read as production access control.

## Requirements
- Node.js 20.19+ or 22.12+ (Node.js 22 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the URL printed by Vite (normally `http://localhost:5173`).

The Vite server binds to `0.0.0.0`, so a VM test server can be reached from another machine using:
`http://<ubuntu-vm-ip>:5173`
Make sure the VM firewall/security group permits TCP 5173 from your trusted test network only.

## Production build
```bash
npm run build
```
Vite creates a static production site in `dist/`. Copy the contents of `dist/` to the NGINX document root or mount it as the static web root in your existing NGINX Docker deployment.

Example NGINX location:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Use the correct `root` for your deployment. If hosting under a sub-path, configure Vite's `base` option accordingly before building.

## GitHub
```bash
git init
git add .
git commit -m "Initial IGIFY WebUI prototype"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```
Do not commit API keys, passwords, private certificates, `.env` files or other secrets.

## Prototype limitations
This is a frontend demonstration. Login, KYC verification, approval workflows, publishing, search indexing, radio/video playback, notifications, service integrations and database operations use illustrative sample data and do not connect to production services. Frontend visibility is not an access-control boundary; the backend must enforce all authentication and permissions during implementation.

## Environments included
- Public
- Registered Member
- Organisation Admin
- IGIFY Administrator

## Theme
Five light charcoal/grey theme choices and a separate user-controlled Dark Mode are included as a visual prototype. Organisation Admin uses its own workspace theme.

## Design baseline
See `IGIFY-WEBUI-PROTOTYPE-DESIGN.md` for the consolidated prototype design specification.

## Requirements
- Node.js 20.19+ or 22.12+ (Node.js 22 LTS recommended)
- npm

## Run locally
```bash
npm install
npm run dev
```
Open the URL printed by Vite (normally `http://localhost:5173`).

The Vite server binds to `0.0.0.0`, so a VM test server can be reached from another machine using:
`http://<ubuntu-vm-ip>:5173`
Make sure the VM firewall/security group permits TCP 5173 from your trusted test network only.

## Production build
```bash
npm run build
```
Vite creates a static production site in `dist/`. Copy the contents of `dist/` to the NGINX document root or mount it as the static web root in your existing NGINX Docker deployment.

Example NGINX location:
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```
Use the correct `root` for your deployment. If hosting under a sub-path, configure Vite's `base` option accordingly before building.

## GitHub
```bash
git init
git add .
git commit -m "Initial IGIFY WebUI prototype"
git branch -M main
git remote add origin <YOUR_GITHUB_REPOSITORY_URL>
git push -u origin main
```
Do not commit API keys, passwords, private certificates, `.env` files or other secrets.

## Prototype limitations
This is a frontend demonstration. Login, KYC verification, approval workflows, publishing, search indexing, radio/video playback, notifications, service integrations and database operations use illustrative sample data and do not connect to production services. Frontend visibility is not an access-control boundary; the backend must enforce all authentication and permissions during implementation.

## Environments included
- Public
- Registered Member
- Organisation Admin
- IGIFY Administrator

## Theme
Five light charcoal/grey theme choices and a separate user-controlled Dark Mode are included as a visual prototype. Organisation Admin uses its own workspace theme.
