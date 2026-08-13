/**
 * WO-033 north-star re-review loop.
 * Fail-closed unless postgres. Team Graph product remains not live.
 */
import { createFakeSql } from './fake-sql'
import { requestReReviewOnMaterialChange } from '../re-review-loop'
import {
  PRODUCT_TRUTH_REREVIEW_CHECKLIST_V1,
  RE_REVIEW_ERROR_NOT_POSTGRES,
  RE_REVIEW_PRODUCT_SURFACE,
} from '../../../../packages/contracts/src/re-review-loop'
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { MaterialChangeInputV1 } from '../../../../packages/contracts/src/re-review-loop'

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
function assert(name: string, cond: boolean, detail = 'failed') {
  if (cond) ok(name)
  else fail(name, detail)
}
function read(rel: string) {
  return readFileSync(join(ROOT, rel), 'utf8')
}
function snap(value: unknown) {
  return JSON.stringify(value)
}

const PG_ENV: NodeJS.ProcessEnv = {
  SECURIST_GRAPH_STORE: 'postgres',
  DATABASE_URL: 'postgres://wo033-test.invalid/securist',
  SECURIST_DEFAULT_TENANT_ID: 'public-demo',
}

const MEM_ENV: NodeJS.ProcessEnv = {
  SECURIST_GRAPH_STORE: 'memory',
}

function materialInput(): MaterialChangeInputV1 {
  return {
    contractVersion: '1',
    kind: 'material_change',
    tenantId: 'public-demo',
    artifactId: 'art-rr-repo',
    artifactVersionId: 'ver-rr-2',
    trigger: 'material_version',
    whatChanged: 'New digest for fixture-repo 1.1.0 observed.',
    whyItMatters: 'Prior approval bound to 1.0.0 must not inherit silently.',
    beforeFingerprint: 'sha256:aaa',
    afterFingerprint: 'sha256:bbb',
    requestedBy: 'fixture',
    occurredAt: '2026-08-13T04:00:00.000Z',
  }
}

function seedLoop(fake: ReturnType<typeof createFakeSql>) {
  const now = '2026-08-13T03:00:00.000Z'
  fake.tables.tenants.push({
    id: 'public-demo',
    name: 'public-demo',
    created_at: now,
  })
  fake.tables.artifacts.push({
    id: 'art-rr-repo',
    tenant_id: 'public-demo',
    kind: 'repo',
    name: 'fixture-repo',
    purpose: 'WO-033 one-artifact re-review fixture',
    recommended_boundary: 'dev',
    domains: ['supply_chain'],
    canonical_url: 'https://github.com/example/fixture-repo',
    provider: 'github',
    status: 'approved',
    review_owner: 'human-owner-ada',
    next_review_at: null,
    is_seed: false,
    created_at: now,
    updated_at: now,
  })
  fake.tables.policies.push({
    id: 'pol-admission',
    version: '1',
    name: 'Production admission policy',
    description: 'Fixture policy',
    is_seed: false,
  })
  fake.tables.evidence_records.push({
    id: 'ev-rr-prov',
    tenant_id: 'public-demo',
    artifact_id: 'art-rr-repo',
    version_id: 'ver-rr-1',
    domain: 'provenance',
    assertion: 'Digest sha256:aaa',
    source: 'fixture',
    observed_at: now,
    verification: 'verified',
    content_hash: 'aaa',
    framework_hint: null,
    is_seed: false,
  })
  fake.tables.decisions.push({
    id: 'dec-rr-1',
    tenant_id: 'public-demo',
    artifact_id: 'art-rr-repo',
    artifact_version_id: 'ver-rr-1',
    status: 'approved',
    summary: 'Approved for development on 1.0.0',
    risk_plain: 'Residual fixture risk',
    action_plain: 'Watch digest',
    evaluation_id: null,
    evidence_ids: ['ev-rr-prov'],
    policy_id: 'pol-admission',
    policy_version: '1',
    scope: {
      tenantId: 'public-demo',
      environment: 'development',
      intendedUse: 'fixture',
      dataClassification: 'public',
      deploymentBoundary: 'local_only',
    },
    decided_at: now,
    decided_by: 'human-owner-ada',
    expires_at: null,
    is_seed: false,
  })
}

async function main() {
  console.log('North-star re-review loop (WO-033)\n')

  console.log('[fail closed]')
  const mem = await requestReReviewOnMaterialChange(materialInput(), {
    env: MEM_ENV,
  })
  assert(
    'memory store fails closed',
    mem.ok === false && mem.error === RE_REVIEW_ERROR_NOT_POSTGRES,
    JSON.stringify(mem),
  )
  assert('memory result live is false', snap(mem.live) === snap(false))
  assert(
    'memory product surface not_live',
    snap(mem.productSurface) === snap(RE_REVIEW_PRODUCT_SURFACE),
  )

  const noClient = await requestReReviewOnMaterialChange(materialInput(), {
    env: PG_ENV,
  })
  assert(
    'postgres without client fails closed',
    noClient.ok === false && noClient.error === 'missing_postgres_client',
    JSON.stringify(noClient),
  )

  console.log('\n[postgres loop]')
  const fake = createFakeSql()
  seedLoop(fake)
  const result = await requestReReviewOnMaterialChange(materialInput(), {
    env: PG_ENV,
    client: fake,
  })
  assert('postgres loop ok', result.ok === true, JSON.stringify(result))
  if (result.ok) {
    assert('result live is false', snap(result.live) === snap(false))
    assert('storeMode postgres', snap(result.storeMode) === snap('postgres'))
    assert(
      'product surface not_live',
      snap(result.productSurface) === snap('not_live'),
    )
    assert(
      'permission reopened',
      snap(result.permissionReopened) === snap(true),
    )
    assert(
      'new status review_required',
      snap(result.audit.newStatus) === snap('review_required'),
    )
    assert('prior status approved', result.audit.priorStatus === 'approved')
    assert(
      'audit whatChanged present',
      result.audit.whatChanged.includes('digest') ||
        result.audit.whatChanged.includes('1.1.0'),
    )
    assert(
      'audit policy id and version',
      result.audit.policyId === 'pol-admission' &&
        result.audit.policyVersion === '1',
    )
    assert(
      'audit whoMustReApprove is named human',
      result.audit.whoMustReApprove.ownerId === 'human-owner-ada' &&
        snap(result.audit.whoMustReApprove.accountableHuman) === snap(true),
    )
    assert(
      'evidence ids recorded',
      result.audit.evidenceIds.includes('ev-rr-prov'),
    )
    assert('request live false', snap(result.request.live) === snap(false))
    assert(
      'request work order WO-033',
      snap(result.request.workOrder) === snap('WO-033'),
    )
  }

  const art = fake.tables.artifacts.find((r) => r.id === 'art-rr-repo')
  assert(
    'artifact status reopened',
    String(art?.status) === 'review_required',
    String(art?.status),
  )
  const dec = fake.tables.decisions.find((r) => r.id === 'dec-rr-1')
  assert(
    'decision status reopened',
    String(dec?.status) === 'review_required',
    String(dec?.status),
  )
  assert(
    'change_event re_review_trigger',
    fake.tables.change_events.some((r) => r.re_review_trigger === true),
  )
  assert(
    'activity projected',
    fake.tables.activity_events.some((r) =>
      String(r.what_happened).includes('1.1.0'),
    ),
  )

  const missing = await requestReReviewOnMaterialChange(
    { ...materialInput(), artifactId: 'no-such' },
    { env: PG_ENV, client: fake },
  )
  assert(
    'missing artifact fails closed',
    missing.ok === false && missing.error === 'artifact_not_found',
  )

  console.log('\n[honesty]')
  const team = read('src/routes/team.tsx')
  const resume = read('docs/SESSION-RESUME.md')
  const pack = read('docs/TEAM-GRAPH-CONTRACTS.md')
  const wo = read('ops/work-orders/WO-033-re-review-material-change.md')
  const loopDoc = existsSync(join(ROOT, 'docs/RE-REVIEW-LOOP.md'))
    ? read('docs/RE-REVIEW-LOOP.md')
    : ''
  assert(
    'team page still coming next not live',
    /Coming next/i.test(team) &&
      /not live/i.test(team) &&
      !/Team Graph is live/i.test(team),
  )
  assert(
    'SESSION-RESUME Team Graph product NOT LIVE',
    /Team Graph/.test(resume) && /NOT LIVE/.test(resume),
  )
  assert('WO-033 file exists', /id: WO-033/.test(wo))
  assert('WO-033 in_review', /status: in_review/.test(wo))
  assert('loop doc exists', loopDoc.includes('WO-033'))
  assert(
    'loop doc fail-closed postgres',
    /fail-closed|graph_store_not_postgres|SECURIST_GRAPH_STORE=postgres/i.test(
      loopDoc,
    ),
  )
  assert(
    'zero Team Graph is live claims',
    !/Team Graph is live/i.test(team + pack + wo + loopDoc),
  )
  assert(
    'checklist has team coming next',
    PRODUCT_TRUTH_REREVIEW_CHECKLIST_V1.some((c) => /Coming next/.test(c)),
  )
  assert(
    'contracts export not_live surface',
    snap(RE_REVIEW_PRODUCT_SURFACE) === snap('not_live'),
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
