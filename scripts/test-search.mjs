/**
 * Search checks: relevance ordering, page results, and empty input.
 *
 *   node scripts/test-search.mjs
 */

import { searchAll } from '../src/search.js'

const ENVS = {
  public: { label: 'Public', nav: ['Home', 'Learn', 'Latest News', 'Community & Events'] },
  member: { label: 'Member', nav: ['Home', 'My Profile', 'Continue Learning'] },
  org: { label: 'Organisation Admin', nav: ['Overview'] },
  admin: { label: 'IGIFY Administrator', nav: ['Dashboard', 'Users & Identity'] },
}

let failures = 0
function check(label, condition) {
  if (condition) console.log(`ok    ${label}`)
  else {
    failures++
    console.error(`FAIL  ${label}`)
  }
}

const coffee = searchAll('coffee', ENVS)
check('query matches a record', coffee.some((r) => r.kind === 'record'))
check(
  'title match ranks first',
  coffee[0]?.kind === 'record' && /coffee/i.test(coffee[0].title)
)
check('result carries a snippet', Boolean(coffee[0]?.snippet))

const kundiawa = searchAll('kundiawa', ENVS)
check('PNG place name finds the Kundiawa record', kundiawa.some((r) => r.id === 'kundiawa-market'))

const learn = searchAll('learn', ENVS)
check('a page can be returned as a result', learn.some((r) => r.kind === 'page' && r.page === 'Learn'))
check(
  'duplicate page names are collapsed',
  new Set(learn.filter((r) => r.kind === 'page').map((r) => r.page.toLowerCase())).size ===
    learn.filter((r) => r.kind === 'page').length
)

check('nonsense query returns nothing', searchAll('zzzzqqq', ENVS).length === 0)
check('empty query returns nothing', searchAll('   ', ENVS).length === 0)
check('results are sorted by score', coffee.every((r, i) => i === 0 || coffee[i - 1].score >= r.score))

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exitCode = failures === 0 ? 0 : 1
