/**
 * Decision Graph store seam tests.
 * Run: npx tsx src/lib/decision-graph/fixtures/run-store-tests.ts
 *
 * Covers:
 * - lifecycle fixture (existing)
 * - config validation (postgres without URL fails clearly)
 * - tenant isolation (memory + postgres adapter)
 * - outbox replay (pending → projected; dead letter)
 * - seed mode remains available for local/demo
 */
import {
  DecisionGraphConfigError,
  resolveDecisionGraphConfig,
  createMemoryStore,
  resetDecisionGraphStoreForTests,
} from '../store'
import { createPostgresStore } from '../postgres-store'
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
  if (!cond) {
    console.error(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`)
  } else {
    console.log(`  ✓ ${name}`)
  }
}

async function testLifecycleFixture() {
  console.log('\n[lifecycle fixture]')
  const r = runE2ELifecycleFixture()
  assert('e2e lifecycle ok', r.ok, r.errors.join('; '))
  assert(
    'final status review_required',
    r.finalStatus === 'review_required',
    r.finalStatus,
  )
  assert('has activity projections', r.activityIds.length >= 2)
}

function testConfigValidation() {
  console.log('\n[config validation]')

  const mem = resolveDecisionGraphConfig({} as NodeJS.ProcessEnv)
  assert('default mode is memory', mem.mode === 'memory')
  assert('default is seed mode', mem.isSeedMode === true)

  const seed = resolveDecisionGraphConfig({
    SECURIST_GRAPH_STORE: 'seed',
  } as NodeJS.ProcessEnv)
  assert('seed mode marked demo', seed.mode === 'seed' && seed.isSeedMode)

  let threw = false
  let code = ''
  try {
    resolveDecisionGraphConfig({
      SECURIST_GRAPH_STORE: 'postgres',
    } as NodeJS.ProcessEnv)
  } catch (e) {
    threw = true
    if (e instanceof DecisionGraphConfigError) code = e.code
  }
  assert('postgres without URL throws', threw)
  assert('error code missing_database_url', code === 'missing_database_url')

  const pg = resolveDecisionGraphConfig({
    SECURIST_GRAPH_STORE: 'postgres',
    DATABASE_URL: 'postgres://user:pass@localhost:5432/securist',
  } as NodeJS.ProcessEnv)
  assert('postgres with DATABASE_URL ok', pg.mode === 'postgres' && !pg.isSeedMode)
  assert('databaseUrl captured', !!pg.databaseUrl)

  const alt = resolveDecisionGraphConfig({
    SECURIST_GRAPH_STORE: 'postgres',
    SECURIST_DATABASE_URL: 'postgres://alt/db',
  } as NodeJS.ProcessEnv)
  assert('SECURIST_DATABASE_URL accepted', alt.databaseUrl === 'postgres://alt/db')
}

async function testTenantIsolationMemory() {
  console.log('\n[tenant isolation — memory]')
  const now = new Date().toISOString()
  const base = buildSeedSnapshot()
  const multi: DecisionGraphSnapshot = {
    ...base,
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
    evidence: [
      {
        id: 'ev-t1',
        tenantId: 'tenant-1',
        artifactId: 'art-t1',
        domain: 'license',
        assertion: 'MIT t1',
        source: 'test',
        observedAt: now,
        verification: 'verified',
        contentHash: 'h1',
        isSeed: false,
      },
      {
        id: 'ev-t2',
        tenantId: 'tenant-2',
        artifactId: 'art-t2',
        domain: 'license',
        assertion: 'Apache t2',
        source: 'test',
        observedAt: now,
        verification: 'verified',
        contentHash: 'h2',
        isSeed: false,
      },
    ],
    activity: [
      {
        id: 'act-t1',
        tenantId: 'tenant-1',
        source: 'decision',
        verification: 'observed',
        artifactId: 'art-t1',
        whatHappened: 't1 only',
        whyItMatters: 'iso',
        securistAction: 'none',
        visibility: 'public',
        occurredAt: now,
        isSeed: false,
      },
      {
        id: 'act-t2',
        tenantId: 'tenant-2',
        source: 'decision',
        verification: 'observed',
        artifactId: 'art-t2',
        whatHappened: 't2 only',
        whyItMatters: 'iso',
        securistAction: 'none',
        visibility: 'public',
        occurredAt: now,
        isSeed: false,
      },
    ],
    versions: [],
    sources: [],
    policies: base.policies,
    evaluations: [],
    decisions: [],
    validations: [],
    contributions: [],
    changes: [],
    operators: [],
  }

  const store = createMemoryStore(multi)
  const t1Arts = await store.listArtifacts('tenant-1')
  const t2Arts = await store.listArtifacts('tenant-2')
  assert('memory listArtifacts tenant-1 only', t1Arts.every((a) => a.tenantId === 'tenant-1') && t1Arts.length === 1)
  assert('memory listArtifacts tenant-2 only', t2Arts.every((a) => a.tenantId === 'tenant-2') && t2Arts.length === 1)

  const cross = await store.getArtifact('art-t2', 'tenant-1')
  assert('memory cross-tenant getArtifact denied', cross === undefined)

  const ev1 = await store.listEvidence('art-t1', 'tenant-1')
  const evCross = await store.listEvidence('art-t1', 'tenant-2')
  assert('memory evidence tenant-1 sees own', ev1.length === 1)
  assert('memory evidence tenant-2 cannot read t1 artifact evidence', evCross.length === 0)

  const act1 = await store.listActivity({ tenantId: 'tenant-1' })
  assert(
    'memory activity tenant-scoped',
    act1.length === 1 && act1[0].tenantId === 'tenant-1',
  )

  let rejected = false
  try {
    await store.appendEvidence({
      id: 'ev-bad',
      tenantId: '',
      artifactId: 'art-t1',
      domain: 'license',
      assertion: 'no tenant',
      source: 'test',
      observedAt: now,
      verification: 'observed',
      contentHash: 'x',
      isSeed: false,
    })
  } catch {
    rejected = true
  }
  assert('memory tenant-before-persist on evidence', rejected)
}

async function testTenantIsolationPostgres() {
  console.log('\n[tenant isolation — postgres adapter]')
  const fake = createFakeSql()
  seedTwoTenants(fake)
  const store = createPostgresStore({ client: fake })

  const aArts = await store.listArtifacts('tenant-a')
  const bArts = await store.listArtifacts('tenant-b')
  assert(
    'pg listArtifacts tenant-a only',
    aArts.length === 1 && aArts[0].id === 'art-a1',
  )
  assert(
    'pg listArtifacts tenant-b only',
    bArts.length === 1 && bArts[0].id === 'art-b1',
  )

  const cross = await store.getArtifact('art-b1', 'tenant-a')
  assert('pg cross-tenant getArtifact denied', cross === undefined)

  const own = await store.getArtifact('art-a1', 'tenant-a')
  assert('pg same-tenant getArtifact ok', own?.id === 'art-a1')

  const evA = await store.listEvidence('art-a1', 'tenant-a')
  const evCross = await store.listEvidence('art-a1', 'tenant-b')
  assert('pg evidence tenant-a', evA.length === 1 && evA[0].assertion.includes('tenant A'))
  assert('pg evidence cross-tenant empty', evCross.length === 0)

  // SQL tenant predicates present
  const tenantQueries = fake.queries.filter((q) =>
    /tenant_id/i.test(q.text),
  )
  assert('pg adapter emits tenant_id predicates', tenantQueries.length >= 3)

  // append-only evidence
  const rec: EvidenceRecord = {
    id: 'ev-a2',
    tenantId: 'tenant-a',
    artifactId: 'art-a1',
    domain: 'security',
    assertion: 'append only',
    source: 'test',
    observedAt: new Date().toISOString(),
    verification: 'observed',
    contentHash: 'append-1',
    isSeed: false,
  }
  await store.appendEvidence(rec)
  await store.appendEvidence(rec) // idempotent
  const after = await store.listEvidence('art-a1', 'tenant-a')
  assert(
    'pg evidence append-only idempotent',
    after.filter((e) => e.id === 'ev-a2').length === 1,
  )

  let rejected = false
  try {
    await store.appendActivity({
      id: 'act-x',
      tenantId: '',
      source: 'test',
      verification: 'observed',
      whatHappened: 'x',
      whyItMatters: 'x',
      securistAction: 'x',
      visibility: 'public',
      occurredAt: new Date().toISOString(),
      isSeed: false,
    })
  } catch {
    rejected = true
  }
  assert('pg tenant-before-persist on activity', rejected)
}

async function testOutboxReplay() {
  console.log('\n[outbox replay — memory]')
  resetOutboxForTests()
  const box = getOutbox()

  const e1 = await box.append({
    id: 'ob-1',
    tenantId: 'tenant-a',
    artifactId: 'art-a1',
    eventType: 'decision.approved',
    actorType: 'human',
    payloadFingerprint: 'fp1',
  })
  const e2 = await box.append({
    id: 'ob-2',
    tenantId: 'tenant-b',
    eventType: 'evidence.appended',
    actorType: 'scout',
    payloadFingerprint: 'fp2',
  })
  assert('outbox starts unprojected', e1.projected === false && e2.projected === false)

  let pending = await box.pendingProjections()
  assert('pending has both', pending.length === 2)

  await box.markProjected(e1.id)
  pending = await box.pendingProjections()
  assert(
    'after project only e2 pending',
    pending.length === 1 && pending[0].id === 'ob-2',
  )

  const tenantA = await box.pendingProjections('tenant-a')
  assert('tenant-a pending empty after project', tenantA.length === 0)

  await box.sendToDeadLetter(e2, 'projection_failed')
  pending = await box.pendingProjections()
  assert('dead-lettered not pending', pending.length === 0)
  const dl = await box.listDeadLetter()
  assert('dead letter contains e2', dl.some((d) => d.id === 'ob-2' && d.errorCode === 'projection_failed'))

  // Replay path: re-append equivalent after recovery is a new event id
  const e3 = await box.append({
    id: 'ob-2-replay',
    tenantId: 'tenant-b',
    eventType: 'evidence.appended',
    actorType: 'system',
    payloadFingerprint: 'fp2',
  })
  pending = await box.pendingProjections()
  assert('replay event is pending', pending.some((p) => p.id === e3.id))
  await box.markProjected(e3.id)
  pending = await box.pendingProjections()
  assert('replay then project clears pending', pending.length === 0)

  console.log('\n[outbox replay — postgres adapter]')
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
  let pgPending = await pgBox.pendingProjections()
  assert('pg pending has event', pgPending.some((p) => p.id === p1.id))

  await pgBox.markProjected(p1.id)
  pgPending = await pgBox.pendingProjections()
  assert('pg projected clears pending', !pgPending.some((p) => p.id === p1.id))

  const p2 = await pgBox.append({
    id: 'pg-ob-2',
    tenantId: 'tenant-a',
    eventType: 'decision.review_required',
    actorType: 'policy',
    payloadFingerprint: 'pgfp2',
  })
  await pgBox.sendToDeadLetter(p2, 'schema')
  pgPending = await pgBox.pendingProjections('tenant-a')
  assert('pg dead letter not pending', !pgPending.some((p) => p.id === p2.id))
  const pgDl = await pgBox.listDeadLetter()
  assert('pg dead letter listed', pgDl.some((d) => d.id === 'pg-ob-2'))

  resetOutboxForTests()
}

async function testSeedModeExplicit() {
  console.log('\n[seed mode]')
  const store = resetDecisionGraphStoreForTests()
  const snap = await store.getSnapshot()
  assert(
    'seed snapshot artifacts labeled isSeed',
    snap.artifacts.length > 0 && snap.artifacts.every((a) => a.isSeed),
  )
  assert(
    'seed evidence labeled',
    snap.evidence.every((e) => e.isSeed || e.verification === 'seed'),
  )
  const mem = createMemoryOutbox()
  assert('memory outbox available for demo', typeof mem.append === 'function')
}

async function main() {
  console.log('Decision Graph store seam tests')
  await testLifecycleFixture()
  testConfigValidation()
  await testTenantIsolationMemory()
  await testTenantIsolationPostgres()
  await testOutboxReplay()
  await testSeedModeExplicit()

  const failed = checks.filter((c) => !c.ok)
  console.log(
    `\n${checks.length - failed.length}/${checks.length} passed` +
      (failed.length ? ` · ${failed.length} failed` : ''),
  )
  if (failed.length) {
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
