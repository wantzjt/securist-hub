/**
 * Product-first launch surface fixtures (WO-017).
 * Static copy + honesty guards — no Graph/store/persistence claims.
 */
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  BUYER_OUTCOME,
  HERO,
  LADDER,
  OPEN_BUILD_REPO_URL,
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
  console.log('Product surface fixtures (WO-017)\n')

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
    'hero subtitle production + reopen',
    HERO.subtitle.includes('enter production') &&
      HERO.subtitle.includes('Reopen'),
  )
  assert(
    'buyer outcome outliving approvals',
    BUYER_OUTCOME.includes('outliving') &&
      BUYER_OUTCOME.includes('version'),
  )
  assert(
    'ladder statuses live/local/next',
    LADDER.map((s) => s.status).join(',') === 'live,local,next',
  )
  assert(
    'sample brief not an approval',
    SAMPLE_BRIEF_PREVIEW.disclaimer.toLowerCase().includes('not a production approval'),
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
    'open build does not surface personal email handles as product',
    !OPEN_BUILD_REPO_URL.includes('@'),
  )

  console.log('\n[route honesty — static scan]')
  const home = read('src/routes/index.tsx')
  const assess = read('src/routes/assess.tsx')
  const services = read('src/routes/services.tsx')
  const preview = read('src/components/DecisionBriefPreview.tsx')
  const chrome = read('src/components/SiteChrome.tsx')

  assert(
    'home imports product-surface constants',
    home.includes('product-surface') && home.includes('DecisionBriefPreview'),
  )
  assert(
    'home does not claim public npx',
    !/npx\s+@securist/i.test(home),
  )
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
    'services is Adoption Assurance / Re-review',
    /Adoption Assurance/i.test(services) && /Re-review/i.test(services),
  )
  assert(
    'services rejects founder-led retainer framing',
    !/founder-led consulting/i.test(services) &&
      services.includes('not a founder-led retainer'),
  )
  assert(
    'nav Product group includes Assess',
    chrome.includes("label: 'Assess'") && chrome.includes("group: 'Product'"),
  )
  assert(
    'nav Research still groups Activity/Models/Scout',
    chrome.includes("group: 'Research'") &&
      chrome.includes("label: 'Activity'") &&
      chrome.includes("label: 'Scout'"),
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
