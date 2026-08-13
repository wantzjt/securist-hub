/**
 * WO-032 Team Graph contract freeze fixtures.
 * Team Graph is not live. R1/Postgres is John-only (WO-008).
 */
import { readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  TEAM_GRAPH_DURABLE,
  TEAM_GRAPH_ERROR_NOT_LIVE,
  TEAM_GRAPH_HONESTY_V1,
  TEAM_GRAPH_ILLUSTRATION_V1,
  TEAM_GRAPH_LIVE,
  TEAM_GRAPH_NOT_LIVE_MESSAGE,
  TEAM_GRAPH_PERSISTENCE,
  TEAM_GRAPH_R1_GATE,
  teamGraphNotLive,
  teamGraphStatus,
} from '../../../../packages/contracts/src/team-graph'
import {
  getTeamGraphOneArtifact,
  getTeamGraphStubStatus,
  requestTeamGraphReReview,
  TEAM_GRAPH_STUB_IGNORES_ENV,
} from '../../team-graph-stub'

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
function snap(value: unknown) {
  return JSON.stringify(value)
}
function read(rel: string) {
  return readFileSync(join(ROOT, rel), 'utf8')
}

function main() {
  console.log('Team Graph contract freeze (WO-032)\n')

  console.log('[frozen contracts]')
  assert('live flag is false', snap(TEAM_GRAPH_LIVE) === snap(false))
  assert('durable flag is false', snap(TEAM_GRAPH_DURABLE) === snap(false))
  assert(
    'persistence is stub_not_live',
    snap(TEAM_GRAPH_PERSISTENCE) === snap('stub_not_live'),
  )
  assert(
    'R1 gate is human_wo_008',
    snap(TEAM_GRAPH_R1_GATE) === snap('human_wo_008'),
  )
  assert(
    'honesty envelope matches flags',
    snap({
      live: TEAM_GRAPH_HONESTY_V1.live,
      durable: TEAM_GRAPH_HONESTY_V1.durable,
      postgresOwner: TEAM_GRAPH_HONESTY_V1.postgresOwner,
      workOrder: TEAM_GRAPH_HONESTY_V1.workOrder,
    }) ===
      snap({
        live: false,
        durable: false,
        postgresOwner: 'human',
        workOrder: 'WO-032',
      }),
  )
  assert(
    'illustration is one artifact not_reviewed',
    snap(TEAM_GRAPH_ILLUSTRATION_V1.kind) === snap('team_graph_decision') &&
      snap(TEAM_GRAPH_ILLUSTRATION_V1.status) === snap('not_reviewed') &&
      snap(TEAM_GRAPH_ILLUSTRATION_V1.live) === snap(false) &&
      snap(TEAM_GRAPH_ILLUSTRATION_V1.owner.accountableHuman) === snap(true) &&
      TEAM_GRAPH_ILLUSTRATION_V1.policy.policyVersion.length > 0 &&
      TEAM_GRAPH_ILLUSTRATION_V1.evidence.length >= 1,
  )
  assert(
    'illustration evidence is seed-labeled',
    TEAM_GRAPH_ILLUSTRATION_V1.evidence[0]?.verification === 'seed',
  )

  console.log('\n[stub API]')
  const priorDb = process.env.DATABASE_URL
  const priorStore = process.env.SECURIST_GRAPH_STORE
  process.env.DATABASE_URL = 'postgres://should-not-be-read'
  process.env.SECURIST_GRAPH_STORE = 'postgres'
  try {
    const status = getTeamGraphStubStatus()
    assert(
      'status live is false even with DATABASE_URL set',
      snap(status.live) === snap(false),
    )
    assert('status durable is false', snap(status.durable) === snap(false))
    assert(
      'status label coming_next',
      snap(status.label) === snap('coming_next'),
    )
    assert(
      'status r1Gate human_wo_008',
      snap(status.r1Gate) === snap('human_wo_008'),
    )
    assert(
      'status api re-review refuses write',
      snap(status.api.requestReReview) === snap('stub_refuses_write'),
    )
    const artifact = getTeamGraphOneArtifact('tg-example-one-artifact')
    assert(
      'GET one-artifact is not live',
      snap(artifact.ok) === snap(false) &&
        snap(artifact.error) === snap(TEAM_GRAPH_ERROR_NOT_LIVE) &&
        snap(artifact.live) === snap(false),
    )
    const refused = requestTeamGraphReReview({
      contractVersion: '1',
      kind: 'team_graph_re_review_request',
      live: false,
      durable: false,
      persistence: 'stub_not_live',
      artifactId: 'tg-example-one-artifact',
      artifactVersionId: 'tg-example-one-artifact-v1',
      trigger: 'material_version',
      reason: 'test',
      requestedBy: 'fixture',
    })
    assert(
      'POST re-review refuses write',
      snap(refused.ok) === snap(false) &&
        snap(refused.error) === snap('team_graph_not_live') &&
        snap(refused.op) === snap('request_re_review') &&
        snap(refused.message) === snap(TEAM_GRAPH_NOT_LIVE_MESSAGE),
    )
    assert(
      'stub lists durability env as ignored',
      TEAM_GRAPH_STUB_IGNORES_ENV.includes('DATABASE_URL') &&
        TEAM_GRAPH_STUB_IGNORES_ENV.includes('SECURIST_GRAPH_STORE'),
    )
    const stubSrc = read('src/lib/team-graph-stub.ts')
    assert(
      'stub source does not read DATABASE_URL',
      !/process\.env\.(DATABASE_URL|SECURIST_DATABASE_URL|SECURIST_GRAPH_STORE)/.test(
        stubSrc,
      ),
    )
    assert(
      'stub does not import decision-graph store',
      !/decision-graph\/(store|config|postgres-store)/.test(stubSrc),
    )
    const helper = teamGraphNotLive('get_status')
    assert(
      'helper error code frozen',
      snap(helper.error) === snap('team_graph_not_live'),
    )
    const packed = teamGraphStatus()
    assert(
      'packed status matches stub',
      snap(packed.live) === snap(status.live),
    )
  } finally {
    if (priorDb === undefined) delete process.env.DATABASE_URL
    else process.env.DATABASE_URL = priorDb
    if (priorStore === undefined) delete process.env.SECURIST_GRAPH_STORE
    else process.env.SECURIST_GRAPH_STORE = priorStore
  }

  console.log('\n[docs + UI honesty]')
  const team = read('src/routes/team.tsx')
  const pack = read('docs/TEAM-GRAPH-CONTRACTS.md')
  const r1 = read('docs/R1-READINESS-PACK.md')
  const resume = read('docs/SESSION-RESUME.md')
  const wo = read('ops/work-orders/WO-032-team-graph-contract-freeze.md')
  const api = read('src/lib/activity-api.ts')
  const contracts = read('packages/contracts/src/team-graph.ts')

  assert('team route exists', existsSync(join(ROOT, 'src/routes/team.tsx')))
  assert(
    'contract pack exists',
    existsSync(join(ROOT, 'docs/TEAM-GRAPH-CONTRACTS.md')),
  )
  assert(
    'team page is coming next not live',
    /Coming next/i.test(team) &&
      /not live/i.test(team) &&
      !/Team Graph is live/i.test(team),
  )
  assert(
    'team page shows owner policy evidence re-review',
    /Owner/i.test(team) &&
      /Policy/i.test(team) &&
      /Evidence/i.test(team) &&
      /Re-review/i.test(team),
  )
  assert(
    'team page wires stub status loader',
    team.includes('getTeamGraphStatus'),
  )
  assert(
    'zero LIVE Team Graph claims in pack',
    !/Team Graph is live/i.test(pack + team + contracts + wo),
  )
  assert(
    'pack says R1/Postgres is John-only WO-008',
    /John-only/i.test(pack) &&
      /WO-008/.test(pack) &&
      /not live until R1/i.test(pack),
  )
  assert(
    'R1 pack aligned and not activated',
    /WO-032/.test(r1) &&
      /not live/i.test(r1) &&
      !/R1 is active/i.test(r1) &&
      /do not\*?\*? claim multi-user durability/i.test(r1),
  )
  assert(
    'SESSION-RESUME Team Graph still NOT LIVE',
    /Team Graph/.test(resume) && /NOT LIVE/.test(resume),
  )
  assert(
    'WO-032 depends_on WO-031 owner grok',
    /depends_on:/.test(wo) &&
      /WO-031/.test(wo) &&
      /owner: grok/.test(wo) &&
      /status: complete/.test(wo),
  )
  assert(
    'activity-api stub does not call getDecisionGraphStore for Team Graph',
    /getTeamGraphStubStatus/.test(api) &&
      !/getDecisionGraphStore\(\)[\s\S]{0,80}Team Graph/.test(api),
  )
  assert(
    'no 002 migration shipped in this WO',
    !existsSync(join(ROOT, 'migrations/002_team_graph.sql')),
  )

  console.log(`\n${passed}/${passed + failed} passed`)
  if (failed > 0) process.exit(1)
}

main()
