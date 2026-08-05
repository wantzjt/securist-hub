/**
 * Decision Graph store seam tests (WO-002).
 * Run: npm run test:graph
 */
import {
  DecisionGraphConfigError,
  resolveDecisionGraphConfig,
  createMemoryStore,
  resetDecisionGraphStoreForTests,
} from '../store'
import { createPostgresStore, TenantScopeError } from '../postgres-store'
import {
  createMemoryOutbox,
  getOutbox,
  resetOutboxForTests,
  setOutbox,
} from '../outbox'
import { createPostgresOutbox } from '../postgres-outbox'
import { runE2ELifecycleFixture } from './e2e-lifecycle'
import { createFakeSql, seedTwoTenants } from './fake-sql'
import { buildSeedSnapshot } from '../seed'
import type { DecisionGraphSnapshot, EvidenceRecord } from '../types'

type Check = { name: string; ok: boolean; detail?: string }
const checks: Check[] = []

function assert(name: string, cond: boolean, detail?: string) {
  checks.push({ name, ok: cond, detail: cond ? undefined : detail || 'failed' })
  if (!cond) console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  else console.log(`  ✓ ${name}`)
}

async function testLifecycleFixture() {
  console.log('\n[lifecycle fixture]')
  const r = runE2ELifecycleFixture()
  assert('e2e lifecycle ok', r.ok, r.errors.join('; '))
  assert(
    'final status review_required',
    r.finalStatus === 'review_required',
    String(r.finalStatus),
  )
  assert('has activity projections', r.activityIds.length >= 2)
}

function testConfigValidation() {
  console.log('\n[config validation / bootstrap]')
  const emptyEnv: NodeJS.ProcessEnv = {}
  const mem = resolveDecisionGraphConfig(emptyEnv)
  assert('default mode is memory', mem.mode === 'memory')
  assert('default is seed mode', mem.isSeedMode === true)

  let threw = false
  let code = ''
  try {
    const pgEnv: NodeJS.ProcessEnv = { SECURIST_GRAPH_STORE: 'postgres' }
    resolveDecisionGraphConfig(pgEnv)
  } catch (e) {
    threw = true
    if (e instanceof DecisionGraphConfigError) code = e.code
  }
  assert('postgres without URL throws', threw)
  assert('error code missing_database_url', code === 'missing_database_url')

  threw = false
  code = ''
  try {
    const noTenantEnv: NodeJS.ProcessEnv = {
      SECURIST_GRAPH_STORE: 'postgres',
      DATABASE_URL: 'postgres://user:pass@localhost:5432/securist',
    }
    resolveDecisionGraphConfig(noTenantEnv)
  } catch (e) {
    threw = true
    if (e instanceof DecisionGraphConfigError) code = e.code
  }
  assert('postgres without default tenant throws', threw)
  assert(
    'error code missing_default_tenant_id',
    code === 'missing_default_tenant_id',
  )

  const pgOkEnv: NodeJS.ProcessEnv = {
    SECURIST_GRAPH_STORE: 'postgres',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/securist',
    SECURIST_DEFAULT_TENANT_ID: 'public-demo',
  }
  const pg = resolveDecisionGraphConfig(pgOkEnv)
  assert(
    'postgres fully configured ok',
    pg.mode === 'postgres' && !pg.isSeedMode,
  )
  assert('defaultTenantId captured', pg.defaultTenantId === 'public-demo')
}

async function testTenantIsolationMemory() {
  console.log('\n[tenant isolation — memory]')
  const now = new Date().toISOString()
  const multi: DecisionGraphSnapshot = {
    ...buildSeedSnapshot(),
    artifacts: [
      {
        id: 'art-t1',
        tenantId: 'tenant-1',
        kind: 'repo',
        name: 't1',
        purpose: 't1',
        recommendedBoundary: 'dev',
        domains: ['appsec'],
        canonicalUrl: 'https://example.com/t1',
        provider: 'github',
        status: 'watching',
        reviewOwner: 'o1',
        isSeed: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art-t2',
        tenantId: 'tenant-2',
        kind: 'repo',
        name: 't2',
        purpose: 't2',
        recommendedBoundary: 'dev',
        domains: ['appsec'],
        canonicalUrl: 'https://example.com/t2',
        provider: 'github',
        status: 'watching',
        reviewOwner: 'o2',
        isSeed: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
    evidence: [],
    activity: [],
    versions: [],
    sources: [],
    evaluations: [],
    decisions: [],
    validations: [],
    contributions: [],
    changes: [],
    operators: [],
  }

  resetOutboxForTests()
  const store = createMemoryStore(multi)
  assert(
    'memory listArtifacts tenant-1 only',
    (await store.listArtifacts('tenant-1')).length === 1,
  )
  assert(
    'memory cross-tenant getArtifact denied',
    (await store.getArtifact('art-t2', 'tenant-1')) === undefined,
  )

  let rejected = false
  try {
    await store.appendEvidence({
      id: 'ev-x',
      tenantId: '',
      artifactId: 'art-t1',
      domain: 'license',
      assertion: 'x',
      source: 't',
      observedAt: now,
      verification: 'observed',
      contentHash: 'x',
      isSeed: false,
    })
  } catch {
    rejected = true
  }
  assert('memory tenant-before-persist', rejected)

  let crossWrite = false
  try {
    await store.appendEvidence({
      id: 'ev-cross',
      tenantId: 'tenant-2',
      artifactId: 'art-t1',
      domain: 'license',
      assertion: 'cross',
      source: 't',
      observedAt: now,
      verification: 'observed',
      contentHash: 'c',
      isSeed: false,
    })
  } catch {
    crossWrite = true
  }
  assert('memory cross-tenant evidence write denied', crossWrite)
}

async function testTenantIsolationPostgres() {
  console.log('\n[tenant isolation — postgres adapter]')
  const fake = createFakeSql()
  seedTwoTenants(fake)
  const store = createPostgresStore({
    client: fake,
    defaultTenantId: 'tenant-a',
  })

  const aArts = await store.listArtifacts('tenant-a')
  const bArts = await store.listArtifacts('tenant-b')
  assert('pg listArtifacts tenant-a only', aArts.length === 1 && aArts[0].id === 'art-a1')
  assert('pg listArtifacts tenant-b only', bArts.length === 1 && bArts[0].id === 'art-b1')
  assert(
    'pg cross-tenant getArtifact denied',
    (await store.getArtifact('art-b1', 'tenant-a')) === undefined,
  )
  assert(
    'pg same-tenant getArtifact ok',
    (await store.getArtifact('art-a1', 'tenant-a'))?.id === 'art-a1',
  )

  const evCross = await store.listEvidence('art-a1', 'tenant-b')
  assert('pg evidence cross-tenant empty', evCross.length === 0)

  let cross = false
  try {
    await store.appendEvidence({
      id: 'ev-bad',
      tenantId: 'tenant-b',
      artifactId: 'art-a1',
      domain: 'security',
      assertion: 'nope',
      source: 't',
      observedAt: new Date().toISOString(),
      verification: 'observed',
      contentHash: 'x',
      isSeed: false,
    })
  } catch (e) {
    cross = e instanceof TenantScopeError || /tenant-scope/i.test(String(e))
  }
  assert('pg cross-tenant write throws TenantScopeError', cross)
}

async function testTransactionalOutbox() {
  console.log('\n[transactional outbox — postgres]')
  const fake = createFakeSql()
  seedTwoTenants(fake)
  const store = createPostgresStore({ client: fake, defaultTenantId: 'tenant-a' })

  const rec: EvidenceRecord = {
    id: 'ev-tx-1',
    tenantId: 'tenant-a',
    artifactId: 'art-a1',
    domain: 'security',
    assertion: 'tx append',
    source: 'test',
    observedAt: new Date().toISOString(),
    verification: 'observed',
    contentHash: 'tx-hash-1',
    isSeed: false,
  }
  await store.appendEvidence(rec)

  const evidence = await store.listEvidence('art-a1', 'tenant-a')
  assert(
    'evidence row present after tx',
    evidence.some((e) => e.id === 'ev-tx-1'),
  )
  assert(
    'outbox row present after tx',
    fake.tables.outbox_events.some(
      (r) => r.id === 'ob-ev-ev-tx-1' && r.event_type === 'evidence.appended',
    ),
  )

  // Forced failure rolls back both evidence and outbox
  const beforeEv = fake.tables.evidence_records.length
  const beforeOb = fake.tables.outbox_events.length
  fake.failNextTransaction = true
  let failed = false
  try {
    await store.appendEvidence({
      ...rec,
      id: 'ev-tx-fail',
      contentHash: 'fail',
    })
  } catch {
    failed = true
  }
  assert('forced tx failure throws', failed)
  assert(
    'evidence unchanged after rollback',
    fake.tables.evidence_records.length === beforeEv,
  )
  assert(
    'outbox unchanged after rollback',
    fake.tables.outbox_events.length === beforeOb,
  )

  // Memory path: append + outbox coherent
  console.log('\n[transactional outbox — memory coherence]')
  resetOutboxForTests()
  const mem = createMemoryStore(buildSeedSnapshot())
  const seedArt = (await mem.listArtifacts())[0]
  await mem.appendEvidence({
    id: 'ev-mem-1',
    tenantId: seedArt.tenantId,
    artifactId: seedArt.id,
    domain: 'license',
    assertion: 'mem',
    source: 't',
    observedAt: new Date().toISOString(),
    verification: 'observed',
    contentHash: 'm1',
    isSeed: false,
  })
  const pending = await getOutbox().pendingProjections()
  assert(
    'memory outbox has evidence.appended',
    pending.some((p) => p.id === 'ob-ev-ev-mem-1'),
  )
}

async function testOutboxReplay() {
  console.log('\n[outbox replay]')
  resetOutboxForTests()
  const box = getOutbox()
  const e1 = await box.append({
    id: 'ob-1',
    tenantId: 'tenant-a',
    eventType: 'decision.approved',
    actorType: 'human',
    payloadFingerprint: 'fp1',
  })
  await box.markProjected(e1.id)
  assert(
    'pending empty after project',
    (await box.pendingProjections()).length === 0,
  )

  const fake = createFakeSql()
  const pgBox = createPostgresOutbox(fake)
  setOutbox(pgBox)
  const p1 = await pgBox.append({
    id: 'pg-ob-1',
    tenantId: 'tenant-a',
    eventType: 'change.material',
    actorType: 'system',
    payloadFingerprint: 'pgfp1',
  })
  await pgBox.markProjected(p1.id)
  assert(
    'pg projected clears pending',
    !(await pgBox.pendingProjections()).some((p) => p.id === p1.id),
  )
  resetOutboxForTests()
}

async function testSeedMode() {
  console.log('\n[seed mode]')
  const store = resetDecisionGraphStoreForTests()
  const snap = await store.getSnapshot()
  assert(
    'seed artifacts labeled isSeed',
    snap.artifacts.length > 0 && snap.artifacts.every((a) => a.isSeed),
  )
  assert('memory outbox available', typeof createMemoryOutbox().append === 'function')
}

async function main() {
  console.log('Decision Graph store seam tests (WO-002)')
  await testLifecycleFixture()
  testConfigValidation()
  await testTenantIsolationMemory()
  await testTenantIsolationPostgres()
  await testTransactionalOutbox()
  await testOutboxReplay()
  await testSeedMode()

  const failed = checks.filter((c) => !c.ok)
  console.log(
    `\n${checks.length - failed.length}/${checks.length} passed` +
      (failed.length ? ` · ${failed.length} failed` : ''),
  )
  if (failed.length) process.exitCode = 1
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
