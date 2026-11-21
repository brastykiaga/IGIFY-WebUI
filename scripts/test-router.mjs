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
  eq(parseRoute('#/public/Home', ENVS), { env: 'public', page: 'Home', detail: null })
)

check(
  'page name with spaces parses',
  eq(parseRoute('#/public/Latest%20News', ENVS), { env: 'public', page: 'Latest News', detail: null })
)

check(
  'page name with an ampersand parses',
  eq(parseRoute('#/public/Community%20%26%20Events', ENVS), {
    env: 'public',
    page: 'Community & Events',
    detail: null,
  })
)

check(
  'detail route parses',
  eq(parseRoute('#/public/Latest%20News/news/kundiawa-market', ENVS), {
    env: 'public',
    page: 'Latest News',
    detail: { type: 'news', id: 'kundiawa-market' },
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

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
