/**
 * The store the interface talks to.
 *
 * Everything that persists data goes through this module, so the UI never
 * imports localStorage directly. That is the seam where a backend replaces the
 * local adapter.
 *
 * Selection is by build-time configuration:
 *
 *   VITE_API_BASE_URL=https://igify.local/api npm run build
 *
 * With no variable set the local adapter is used, which is what the prototype
 * demo runs on. With it set, the HTTP adapter from docs/API-CONTRACT.md is used
 * and writes go through the offline outbox.
 *
 * Both adapters implement the same interface. The local one is synchronous and
 * the HTTP one returns Promises, so every call site awaits: awaiting a plain
 * value costs nothing, and it keeps the two interchangeable.
 */

import { createHttpStore } from './http.js'
import { createLocalStore } from './local.js'

const baseUrl = import.meta.env.VITE_API_BASE_URL

export const store = baseUrl ? createHttpStore(baseUrl) : createLocalStore()
