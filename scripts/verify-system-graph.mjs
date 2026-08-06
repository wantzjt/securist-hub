#!/usr/bin/env node
/**
 * Validate the repository system graph without external dependencies.
 *
 * This proves graph integrity (references, paths, checks, and authority shape).
 * It does not prove live infrastructure, product security, or human evidence.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const GRAPH_PATH = join(ROOT, 'ops', 'system-graph.json')
const SYSTEM_MODEL_PATH = join(ROOT, 'docs', 'SYSTEM-MODEL.md')
const PACKAGE_PATH = join(ROOT, 'package.json')
const REQUIRED_INVARIANTS = Array.from(
  { length: 9 },
  (_, index) => `INV-${String(index + 1).padStart(3, '0')}`,
)

const errors = []
const warnings = []

function fail(message) {
  errors.push(message)
}

function warn(message) {
  warnings.push(message)
}

function readJson(path, label) {
  if (!existsSync(path)) {
    fail(`missing ${label}: ${path}`)
    return null
  }
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    fail(`${label} is not valid JSON: ${String(error)}`)
    return null
  }
}

function indexUnique(rows, label) {
  const map = new Map()
  if (!Array.isArray(rows)) {
    fail(`${label} must be an array`)
    return map
  }
  for (const row of rows) {
    const id = typeof row?.id === 'string' ? row.id.trim() : ''
    if (!id) {
      fail(`${label} entry missing id`)
      continue
    }
    if (map.has(id)) fail(`${label} contains duplicate id ${id}`)
    map.set(id, row)
  }
  return map
}

function requireRepoPath(path, context) {
  if (typeof path !== 'string' || !path.trim()) {
    fail(`${context}: path must be a non-empty string`)
    return
  }
  if (path.startsWith('/') || path.includes('..')) {
    fail(`${context}: path must be repository-relative: ${path}`)
    return
  }
  if (!existsSync(join(ROOT, path))) fail(`${context}: missing path ${path}`)
}

function walkFiles(path) {
  if (!existsSync(path)) return []
  if (!statSync(path).isDirectory()) return [path]
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const child = join(path, entry.name)
    return entry.isDirectory() ? walkFiles(child) : [child]
  })
}

function validateCoverage(graph, nodes) {
  const ownersByPath = new Map()
  for (const [nodeId, node] of nodes) {
    for (const path of node.paths || []) {
      const owners = ownersByPath.get(path) || []
      owners.push(nodeId)
      ownersByPath.set(path, owners)
    }
  }

  if (!Array.isArray(graph.coverageRoots) || graph.coverageRoots.length === 0) {
    fail('coverageRoots must contain at least one authority-sensitive root')
    return
  }

  for (const [index, root] of graph.coverageRoots.entries()) {
    requireRepoPath(root.path, `coverageRoots ${index}`)
    const absoluteRoot = join(ROOT, root.path)
    const extensions = new Set(root.extensions || [])
    if (extensions.size === 0) {
      fail(`coverageRoots ${index}: extensions required`)
      continue
    }
    const excluded = root.excludePrefixes || []
    const files = walkFiles(absoluteRoot)
      .map((file) => relative(ROOT, file).replaceAll('\\', '/'))
      .filter((file) => extensions.has(extname(file)))
      .filter((file) => !excluded.some((prefix) => file.startsWith(prefix)))

    if (files.length === 0)
      warn(`coverageRoots ${index}: no matching files under ${root.path}`)
    for (const file of files) {
      const owners = ownersByPath.get(file) || []
      if (owners.length === 0) {
        fail(`authority-sensitive file has no system-graph owner: ${file}`)
      } else if (owners.length > 1) {
        fail(
          `authority-sensitive file has multiple owners (${owners.join(', ')}): ${file}`,
        )
      }
    }
  }
}

function validateChecks(checks, packageJson) {
  for (const [id, check] of checks) {
    if (!['automated', 'human'].includes(check.mode)) {
      fail(`check ${id}: mode must be automated or human`)
      continue
    }
    if (check.mode === 'human') {
      if (!String(check.evidence || '').trim()) {
        fail(`check ${id}: human check requires evidence description`)
      }
      if (check.command)
        fail(`check ${id}: human check must not claim a command`)
      continue
    }

    const command = String(check.command || '')
    const match = command.match(/^npm run ([A-Za-z0-9:_-]+)$/)
    if (!match) {
      fail(`check ${id}: automated command must be exactly "npm run <script>"`)
      continue
    }
    if (!packageJson?.scripts?.[match[1]]) {
      fail(`check ${id}: package.json has no script ${match[1]}`)
    }
  }
}

function transitiveDependsOn(nodeId, targetId, nodes, seen = new Set()) {
  if (nodeId === targetId) return true
  if (seen.has(nodeId)) return false
  seen.add(nodeId)
  const node = nodes.get(nodeId)
  if (!node || !Array.isArray(node.dependsOn)) return false
  return node.dependsOn.some((dependency) =>
    transitiveDependsOn(dependency, targetId, nodes, seen),
  )
}

function validateGraph(graph, packageJson) {
  if (graph.schemaVersion !== 1) fail('schemaVersion must be 1')

  const checks = indexUnique(graph.checks, 'checks')
  const invariants = indexUnique(graph.invariants, 'invariants')
  const nodes = indexUnique(graph.nodes, 'nodes')
  validateChecks(checks, packageJson)

  for (const source of graph.sourceDocuments || []) {
    requireRepoPath(source, 'sourceDocuments')
  }

  const actualInvariantIds = [...invariants.keys()].sort()
  if (actualInvariantIds.join(',') !== REQUIRED_INVARIANTS.join(',')) {
    fail(
      `invariants must be exactly ${REQUIRED_INVARIANTS.join(', ')} (got ${actualInvariantIds.join(', ')})`,
    )
  }

  for (const [id, invariant] of invariants) {
    if (!String(invariant.statement || '').trim()) {
      fail(`invariant ${id}: statement required`)
    }
    if (
      !Array.isArray(invariant.enforcedBy) ||
      invariant.enforcedBy.length === 0
    ) {
      fail(`invariant ${id}: at least one enforcement check required`)
      continue
    }
    for (const checkId of invariant.enforcedBy) {
      if (!checks.has(checkId)) {
        fail(`invariant ${id}: unknown check ${checkId}`)
      }
    }
  }

  const canonicalId = graph.canonicalProductAuthority
  const canonical = nodes.get(canonicalId)
  if (!canonical) {
    fail(`canonicalProductAuthority references unknown node ${canonicalId}`)
  } else if (canonical.authority !== 'canonical-product-state') {
    fail(
      `${canonicalId}: canonical node must use canonical-product-state authority`,
    )
  }
  const canonicalNodes = [...nodes.values()].filter(
    (node) => node.authority === 'canonical-product-state',
  )
  if (canonicalNodes.length !== 1) {
    fail(
      `exactly one canonical-product-state node required (got ${canonicalNodes.length})`,
    )
  }

  for (const [id, node] of nodes) {
    for (const path of node.paths || []) requireRepoPath(path, `node ${id}`)

    if (!Array.isArray(node.dependsOn)) {
      fail(`node ${id}: dependsOn must be an array`)
    } else {
      for (const dependency of node.dependsOn) {
        if (dependency === id) fail(`node ${id}: cannot depend on itself`)
        if (!nodes.has(dependency))
          fail(`node ${id}: unknown dependency ${dependency}`)
      }
    }

    if (!Array.isArray(node.invariants) || node.invariants.length === 0) {
      fail(`node ${id}: at least one invariant required`)
    } else {
      for (const invariantId of node.invariants) {
        if (!invariants.has(invariantId)) {
          fail(`node ${id}: unknown invariant ${invariantId}`)
        }
      }
    }

    if (!Array.isArray(node.verifiedBy) || node.verifiedBy.length === 0) {
      fail(`node ${id}: at least one verification check required`)
    } else {
      for (const checkId of node.verifiedBy) {
        if (!checks.has(checkId)) fail(`node ${id}: unknown check ${checkId}`)
      }
    }

    if (
      ['projection', 'acquisition-surface', 'proposal-boundary'].includes(
        node.kind,
      ) &&
      !transitiveDependsOn(id, canonicalId, nodes)
    ) {
      fail(
        `node ${id}: ${node.kind} must transitively depend on ${canonicalId}`,
      )
    }
    if (node.kind === 'proposal-boundary') {
      if (!node.invariants?.includes('INV-007')) {
        fail(`node ${id}: proposal boundary must enforce INV-007`)
      }
      if (
        !node.verifiedBy?.some(
          (checkId) => checks.get(checkId)?.mode === 'human',
        )
      ) {
        fail(`node ${id}: proposal boundary requires a human gate`)
      }
    }
  }

  validateCoverage(graph, nodes)

  for (const invariantId of invariants.keys()) {
    if (
      ![...nodes.values()].some((node) =>
        node.invariants?.includes(invariantId),
      )
    ) {
      fail(`invariant ${invariantId}: no system node claims it`)
    }
  }

  for (const [index, edge] of (graph.edges || []).entries()) {
    if (!nodes.has(edge.from))
      fail(`edge ${index}: unknown from node ${edge.from}`)
    if (!nodes.has(edge.to)) fail(`edge ${index}: unknown to node ${edge.to}`)
    if (!String(edge.type || '').trim()) fail(`edge ${index}: type required`)
  }

  const loop = graph.valueLoop || []
  const orders = loop.map((step) => step.order).sort((a, b) => a - b)
  const expectedOrders = Array.from(
    { length: loop.length },
    (_, index) => index + 1,
  )
  if (orders.join(',') !== expectedOrders.join(',')) {
    fail('valueLoop order must be unique and contiguous starting at 1')
  }
  for (const step of loop) {
    if (!nodes.has(step.node)) {
      fail(`valueLoop ${step.order}: unknown node ${step.node}`)
    }
    if (!String(step.stage || '').trim() || !String(step.status || '').trim()) {
      fail(`valueLoop ${step.order}: stage and status required`)
    }
  }

  const postgres = nodes.get('postgres-store')
  const r1 = nodes.get('r1-production-activation')
  if (postgres?.status === 'production-active' && r1?.status !== 'complete') {
    fail(
      'postgres-store cannot be production-active before R1 activation is complete',
    )
  }
  if (r1?.status === 'complete') {
    warn(
      'R1 is marked complete: confirm human production evidence is recorded in WO-008',
    )
  }
}

function validateSystemModelInvariantIds() {
  if (!existsSync(SYSTEM_MODEL_PATH)) {
    fail('docs/SYSTEM-MODEL.md missing')
    return
  }
  const text = readFileSync(SYSTEM_MODEL_PATH, 'utf8')
  const ids = [...new Set(text.match(/INV-\d{3}/g) || [])].sort()
  if (ids.join(',') !== REQUIRED_INVARIANTS.join(',')) {
    fail(
      `docs/SYSTEM-MODEL.md invariant ids drifted (expected ${REQUIRED_INVARIANTS.join(', ')}, got ${ids.join(', ')})`,
    )
  }
}

function main() {
  console.log('verify:system-graph — authority · paths · invariants · gates\n')
  const graph = readJson(GRAPH_PATH, 'ops/system-graph.json')
  const packageJson = readJson(PACKAGE_PATH, 'package.json')
  if (graph && packageJson) validateGraph(graph, packageJson)
  validateSystemModelInvariantIds()

  for (const message of warnings) console.warn(`WARN: ${message}`)
  for (const message of errors) console.error(`FAIL: ${message}`)
  if (errors.length) {
    console.error(`\nverify:system-graph failed (${errors.length} error(s))`)
    process.exitCode = 1
    return
  }
  console.log('verify:system-graph ok')
  console.log(
    '(Graph integrity only; live infrastructure and human evidence remain separate gates.)',
  )
}

main()
