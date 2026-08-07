/**
 * securist CLI — free private Local Operator (monorepo / built dist)
 */
import { assessLocalRepository, formatBriefSummary } from './assess'
import { formatDoctorReport, runDoctor } from './doctor'
import { runMcpStdio } from './mcp-stdio'
import type { LocalAssessScopeV1 } from '../../contracts/src/local-assess'

function printHelp() {
  console.log(`securist — free private Local Operator (WO-012)

Usage:
  securist doctor
  securist assess [path] [options]
  securist mcp

Options for assess:
  --intended-use <text>   Required scope statement (no secrets)
  --environment <env>     research|development|staging|production
  --boundary <b>          local_only|controlled_cloud|external_service
  --json                  Print full LocalDecisionBriefV1 JSON

Notes:
  · Local state under ~/.securist/operator (or $SECURIST_HOME/operator), mode 0700/0600
  · Assess requires a release-signed runtime identity + public trust root (no private keys in package)
  · synthesis_unavailable until a real signed TARX model pack exists
  · Monorepo: npm run operator:build && npm run securist -- …
  · Package is private; not published. No network at runtime.
`)
}

function parseArgs(argv: string[]) {
  const args = [...argv]
  const cmd = args.shift() || 'help'
  const flags: Record<string, string | boolean> = {}
  const positionals: string[] = []
  while (args.length) {
    const a = args.shift()!
    if (a === '--json') flags.json = true
    else if (a.startsWith('--')) {
      const key = a.slice(2)
      const val = args[0] && !args[0].startsWith('--') ? args.shift()! : 'true'
      flags[key] = val
    } else positionals.push(a)
  }
  return { cmd, flags, positionals }
}

function main() {
  const { cmd, flags, positionals } = parseArgs(process.argv.slice(2))

  if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
    printHelp()
    return
  }

  if (cmd === 'sign-identity') {
    console.error(
      'sign-identity is not a product command. Human release signing uses scripts/sign-operator-identity.mjs with SECURIST_OPERATOR_SIGNING_KEY outside git.',
    )
    process.exit(2)
  }

  if (cmd === 'doctor') {
    const report = runDoctor()
    console.log(formatDoctorReport(report))
    process.exit(report.runtimeOk ? 0 : 1)
  }

  if (cmd === 'assess') {
    const target = positionals[0] || '.'
    const intendedUse =
      typeof flags['intended-use'] === 'string'
        ? flags['intended-use']
        : 'Local engineering / security adoption review'
    const environment = (
      typeof flags.environment === 'string' ? flags.environment : 'development'
    ) as LocalAssessScopeV1['environment']
    const deploymentBoundary = (
      typeof flags.boundary === 'string'
        ? flags.boundary
        : typeof flags['deployment-boundary'] === 'string'
          ? flags['deployment-boundary']
          : 'local_only'
    ) as LocalAssessScopeV1['deploymentBoundary']

    const result = assessLocalRepository({
      targetPath: target,
      intendedUse,
      environment,
      deploymentBoundary,
    })
    if (!result.ok) {
      console.error(`assess failed (${result.code}): ${result.error}`)
      process.exit(1)
    }
    if (flags.json) {
      console.log(result.brief.draftJson)
    } else {
      console.log(formatBriefSummary(result.brief))
      console.log('')
      console.log(
        `  Fingerprint: ${result.brief.repository.manifestFingerprint?.slice(0, 12)}…`,
      )
      console.log(`  Gaps: ${result.brief.evidenceGaps.join(', ')}`)
    }
    return
  }

  if (cmd === 'mcp') {
    runMcpStdio()
    return
  }

  console.error(`Unknown command: ${cmd}`)
  printHelp()
  process.exit(1)
}

main()
