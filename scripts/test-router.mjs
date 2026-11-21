/**
 * Router checks: address round-trips, encoded names, and rejection of routes
 * that would otherwise render an empty screen.
 *
 *   node scripts/test-router.mjs
 */

import { parseRoute, routeHash } from '../src/router.js'

const ENVS = {
  public: { nav: ['Home', 'Latest News', 'Community & Events'] },
  admin: { nav: ['Dashboard'] },
}

let failures = 0
function check(label, condition) {
  if (condition) console.log(`ok    ${label}`)
  else {
    failures++
    console.error(`FAIL  ${label}`)
  }
}

const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b)

check(
  'plain page route parses',
  eq(parseRoute('#/public/Home', ENVS), { env: 'public', page: 'Home', detail: null, search: null })
)

check(
  'page name with spaces parses',
  eq(parseRoute('#/public/Latest%20News', ENVS), {
    env: 'public',
    page: 'Latest News',
    detail: null,
    search: null,
  })
)

check(
  'page name with an ampersand parses',
  eq(parseRoute('#/public/Community%20%26%20Events', ENVS), {
    env: 'public',
    page: 'Community & Events',
    detail: null,
    search: null,
  })
)

check(
  'detail route parses',
  eq(parseRoute('#/public/Latest%20News/news/kundiawa-market', ENVS), {
    env: 'public',
    page: 'Latest News',
    detail: { type: 'news', id: 'kundiawa-market' },
    search: null,
  })
)

check(
  'routeHash round-trips a page with spaces',
  routeHash({ env: 'public', page: 'Latest News' }) === '#/public/Latest%20News'
)

check(
  'routeHash round-trips a detail route',
  parseRoute(routeHash({ env: 'public', page: 'Latest News', detail: { type: 'news', id: 'kundiawa-market' } }), ENVS)
    ?.detail?.id === 'kundiawa-market'
)

check('unknown workspace is rejected', parseRoute('#/nope/Home', ENVS) === null)
check('unknown page is rejected', parseRoute('#/public/Nonsense', ENVS) === null)
check('page from another workspace is rejected', parseRoute('#/public/Dashboard', ENVS) === null)
check('empty hash is rejected', parseRoute('', ENVS) === null)
check('hash without a page is rejected', parseRoute('#/public', ENVS) === null)

// ── Search routes ───────────────────────────────────────────────────────
const searchRoute = parseRoute('#/public/Search?q=coffee', ENVS)
check('search route parses', searchRoute?.page === 'Search' && searchRoute?.search === 'coffee')
check(
  'search query with spaces round-trips',
  parseRoute(routeHash({ env: 'public', page: 'Search', search: 'highland coffee' }), ENVS)?.search ===
    'highland coffee'
)
check(
  'search page is accepted in a workspace whose nav lacks it',
  parseRoute('#/admin/Search?q=user', ENVS)?.page === 'Search'
)
check('empty query yields no search value', parseRoute('#/public/Search', ENVS)?.search === null)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
