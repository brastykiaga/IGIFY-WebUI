/**
 * The store the interface talks to.
 *
 * Everything that persists data goes through this module, so the UI never
 * imports localStorage directly. That is the seam where a backend replaces the
 * local adapter.
 *
 * ── Swapping to a real backend ────────────────────────────────────────────────
 * 1. Implement `createHttpStore()` in `src/data/http.js` exposing the same
 *    methods as `createLocalStore()` in `local.js`, but returning Promises.
 * 2. Select it here, for example:
 *
 *      const useRemote = Boolean(import.meta.env.VITE_API_BASE_URL)
 *      export const store = useRemote ? createHttpStore(import.meta.env.VITE_API_BASE_URL)
 *                                     : createLocalStore()
 *
 * 3. Make the call sites await (they already refresh from the store after each
 *    mutation, so the change is contained).
 *
 * Endpoints and payload shapes are specified in docs/API-CONTRACT.md.
 */

import { createLocalStore } from './local.js'

export const store = createLocalStore()
