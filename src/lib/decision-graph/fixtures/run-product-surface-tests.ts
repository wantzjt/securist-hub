/**
 * Product surface fixtures (WO-017 / WO-019).
 * Static copy + IA honesty guards — no Graph/store/persistence claims.
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BUYER_OUTCOME,
  HERO,
  LADDER,
  OPEN_BUILD_REPO_URL,
  OPERATOR_COMMANDS,
  PRODUCT_NAV,
  PRODUCT_SENTENCE,
  RESEARCH_LINKS,
  SAMPLE_BRIEF_PREVIEW,
} from '../../product-surface'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

let passed = 0
let failed = 0

function ok(name: string) {
  passed++
  console.log(`  ✓ ${name}`)
}

function fail(name: string, detail: string) {
  failed++
  console.error(`  ✗ ${name}: ${detail}`)
}

function assert(name: string, condition: boolean, detail = 'assertion failed') {
  if (condition) ok(name)
  else fail(name, detail)
}

function read(rel: string) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

function main() {
  console.log('Product surface fixtures (WO-017 / WO-019)\n')

  console.log('[locked product language]')
  assert(
    'product sentence present',
    PRODUCT_SENTENCE.includes('may bring into production') &&
      PRODUCT_SENTENCE.includes('reopens'),
  )
  assert(
    'hero title locked',
    HERO.title.includes('Permission for code and models'),
  )
  assert(
    'ladder statuses live/local/next',
    LADDER.map((s) => s.status).join(',') === 'live,local,next',
  )
  assert(
    'ladder private points at /operator',
    LADDER.find((s) => s.id === 'private')?.href === '/operator',
  )
  assert(
    'ladder team points at /team',
    LADDER.find((s) => s.id === 'team')?.href === '/team',
  )
  assert(
    'product nav is Assess · Operator · Team',
    PRODUCT_NAV.map((n) => n.to).join(',') === '/assess,/operator,/team',
  )
  assert(
    'sample brief not an approval',
    SAMPLE_BRIEF_PREVIEW.disclaimer
      .toLowerCase()
      .includes('not a production approval'),
  )
  assert(
    'research demoted list is research-only paths',
    RESEARCH_LINKS.every((r) =>
      ['/activity', '/models', '/tools', '/daemon', '/links'].includes(r.to),
    ),
  )
  assert(
    'open build repo is hub monorepo path',
    OPEN_BUILD_REPO_URL.includes('securist-hub'),
  )
  assert(
    'operator commands deny public npx as available',
    /not available|private|forthcoming/i.test(OPERATOR_COMMANDS.note) &&
      !/^npx @securist/m.test(OPERATOR_COMMANDS.note),
  )
  assert(
    'buyer outcome outliving approvals',
    BUYER_OUTCOME.includes('outliving') && BUYER_OUTCOME.includes('version'),
  )

  console.log('\n[route honesty — static scan]')
  const home = read('src/routes/index.tsx')
  const assess = read('src/routes/assess.tsx')
  const services = read('src/routes/services.tsx')
  const operator = read('src/routes/operator.tsx')
  const team = read('src/routes/team.tsx')
  const preview = read('src/components/DecisionBriefPreview.tsx')
  const chrome = read('src/components/SiteChrome.tsx')
  const brand = read('src/lib/brand.ts')
  const securityMd = read('SECURITY.md')
  const supportMd = read('SUPPORT.md')

  assert('operator route file exists', existsSync(join(ROOT, 'src/routes/operator.tsx')))
  assert('team route file exists', existsSync(join(ROOT, 'src/routes/team.tsx')))
  assert(
    'home imports product-surface constants',
    home.includes('product-surface') && home.includes('DecisionBriefPreview'),
  )
  assert('home ladder links /operator', home.includes('to="/operator"'))
  assert('home ladder links /team', home.includes('to="/team"'))
  assert('home does not claim public npx', !/npx\s+@securist/i.test(home))
  assert(
    'home does not claim Team Graph live',
    !/Team Graph is live|Team Graph workspace is live/i.test(home),
  )
  assert(
    'preview never says approved for production',
    !/approved for production/i.test(preview),
  )
  assert(
    'assess remains no-account messaging',
    /No account|no email|No email/i.test(assess),
  )
  assert(
    'assess next step links Local Operator page',
    assess.includes('to="/operator"'),
  )
  assert(
    'operator page is monorepo + not Electron',
    operator.includes('monorepo') &&
      /not an Electron|not.*Electron/i.test(operator),
  )
  assert(
    'operator page forbids public npx availability claim',
    /Not available|not available/i.test(operator) &&
      operator.includes('npx @securist/operator'),
  )
  assert(
    'operator page does not instruct live npx install',
    !/npx @securist\/operator\s*$/m.test(operator),
  )
  assert(
    'team page is coming next not live',
    /Coming next|not live/i.test(team) && !/Team Graph is live/i.test(team),
  )
  assert(
    'services is Adoption Assurance / Re-review',
    /Adoption Assurance/i.test(services) && /Re-review/i.test(services),
  )
  assert(
    'chrome product nav uses PRODUCT_NAV',
    chrome.includes('PRODUCT_NAV') && chrome.includes('Research'),
  )
  assert(
    'chrome collapses Research in details',
    chrome.includes('<details') && chrome.includes('RESEARCH_LINKS'),
  )
  assert(
    'chrome does not put Activity in primary product strip',
    !chrome.includes("label: 'Activity'") || chrome.includes('RESEARCH_LINKS'),
  )
  assert(
    'brand contact is protonmail',
    brand.includes('securist_info_sec@protonmail.com') &&
      brand.includes('PUBLIC_CONTACT_EMAIL'),
  )
  assert(
    'SECURITY.md uses protonmail contact',
    securityMd.includes('securist_info_sec@protonmail.com'),
  )
  assert(
    'SUPPORT.md uses protonmail contact',
    supportMd.includes('securist_info_sec@protonmail.com'),
  )
  assert(
    'no Datadog product mention in operator/team/home',
    !/datadog/i.test(operator + team + home + chrome),
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
