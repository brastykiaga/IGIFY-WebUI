# IGIFY WebUI Prototype v1.0

A frontend-only demonstration of the four IGIFY user environments.

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
