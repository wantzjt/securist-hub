#!/usr/bin/env node
/**
 * WO-018 — one human command to produce a signed Local Operator release candidate.
 *
 * Requires offline private key:
 *   SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem npm run operator:rc
 *
 * Never publishes to npm. Never claims public npx.
 * Output under .operator-rc/ (gitignored).
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
  rmSync,
} from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OPERATOR = join(ROOT, 'packages/operator')
const OUT = join(ROOT, '.operator-rc')

function die(msg, code = 1) {
  console.error(msg)
  process.exit(code)
}

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: ROOT,
    encoding: 'utf8',
    env: process.env,
    stdio: opts.stdio || 'pipe',
    ...opts,
  })
  if (r.status !== 0) {
    die(
      `${cmd} ${args.join(' ')} failed:\n${r.stderr || r.stdout || r.error}`,
    )
  }
  return r
}

function sha256File(p) {
  return createHash('sha256').update(readFileSync(p)).digest('hex')
}

async function tarGzDir(srcDir, outFile) {
  // Prefer system tar for portable directory archives
  const r = spawnSync(
    'tar',
    ['-czf', outFile, '-C', dirname(srcDir), basenameSafe(srcDir)],
    { encoding: 'utf8' },
  )
  if (r.status !== 0) {
    die(`tar pack failed: ${r.stderr || r.stdout}`)
  }
}

function basenameSafe(p) {
  return p.split(/[/\\]/).filter(Boolean).pop()
}

async function main() {
  const key = process.env.SECURIST_OPERATOR_SIGNING_KEY
  if (!key || !existsSync(key)) {
    die(
      [
        'operator:rc requires SECURIST_OPERATOR_SIGNING_KEY=/path/to/private.pem',
        'The private key must live outside the repository.',
        'Non-secret checks only: npm run operator:rc:preflight',
      ].join('\n'),
    )
  }

  console.log('operator:rc — signed release candidate\n')

  // 1. Preflight (no secrets used)
  run(process.execPath, ['scripts/operator-rc-preflight.mjs'], {
    stdio: 'inherit',
  })

  // 2. Sign identity (human key)
  run(process.execPath, ['scripts/sign-operator-identity.mjs'], {
    stdio: 'inherit',
  })

  const identityPath = join(OPERATOR, 'runtime-identity.json')
  if (!existsSync(identityPath)) {
    die('runtime-identity.json missing after sign')
  }

  const pkg = JSON.parse(readFileSync(join(OPERATOR, 'package.json'), 'utf8'))
  const version = pkg.version || '0.0.0'
  const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)
  const dirName = `securist-operator-${version}-rc`
  const stage = join(OUT, dirName)
  rmSync(stage, { recursive: true, force: true })
  mkdirSync(stage, { recursive: true })

  // 3. Stage release files only
  const copyList = [
    'package.json',
    'package-artifacts.mjs',
    'bin/securist.mjs',
    'dist/cli.js',
    'keys/trust-root.pem',
    'keys/README.md',
    'runtime-identity.json',
  ]
  for (const rel of copyList) {
    const src = join(OPERATOR, rel)
    if (!existsSync(src)) die(`missing staged file: ${rel}`)
    const dest = join(stage, rel)
    mkdirSync(dirname(dest), { recursive: true })
    copyFileSync(src, dest)
  }

  // 4. VERIFY procedure inside the artifact
  const verifyMd = `# Securist Operator release candidate — clean-machine verify

**Version:** ${version}  
**Built:** ${stamp}  
**Package:** @securist/operator (private — not npm-published)

## Honest status

- This is a **release candidate** for the free Local Operator.
- **Not** public \`npx @securist/operator\` until the human publish gate completes.
- Requires Node.js >= 20.

## Install (offline)

\`\`\`bash
# Unpack the tarball somewhere writable
tar -xzf securist-operator-${version}-rc.tgz
cd securist-operator-${version}-rc
\`\`\`

## Golden path

\`\`\`bash
export SECURIST_HOME="\$(pwd)/.verify-home"
mkdir -p "\$SECURIST_HOME"

# 1. Doctor — expect Runtime verified
node bin/securist.mjs doctor
# exit 0 · "Runtime verified" · synthesis unavailable

# 2. Assess — use any path with package.json / manifests (no private secrets)
node bin/securist.mjs assess /path/to/public-or-dogfood-fixture \\
  --intended-use "Clean-machine RC verify"
# expect Local Decision Brief · deterministic_only · no absolute path leakage

# 3. MCP stdio — tools list only
printf '%s\\n' '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' \\
  | node bin/securist.mjs mcp
# expect get_brief, list_gaps, get_run_metadata only

# 4. Tamper — must fail
cp dist/cli.js dist/cli.js.bak
echo '// tamper' >> dist/cli.js
node bin/securist.mjs doctor
# expect non-zero · runtime_digest_mismatch or signature failure
mv dist/cli.js.bak dist/cli.js
\`\`\`

## Automated verify (from monorepo checkout holding this pack)

\`\`\`bash
node scripts/operator-rc-verify-clean.mjs --rc-dir /path/to/securist-operator-${version}-rc
\`\`\`

## Non-claims

- No Team Graph / shared durable decisions
- No cloud fallback
- No customer private data in this RC process
`

  writeFileSync(join(stage, 'VERIFY.md'), verifyMd)

  const files = {}
  for (const rel of copyList) {
    files[rel] = { sha256: sha256File(join(stage, rel)) }
  }

  const identity = JSON.parse(readFileSync(identityPath, 'utf8'))
  const manifest = {
    kind: 'securist_operator_release_candidate',
    packageName: pkg.name,
    version,
    private: true,
    publicNpxClaim: false,
    stampedAt: new Date().toISOString(),
    contentDigest: identity.contentDigest,
    signerKeyId: identity.signerKeyId,
    artifacts: identity.artifacts || copyList.filter((f) => f !== 'runtime-identity.json' && f !== 'keys/README.md' && f !== 'package-artifacts.mjs'),
    files,
    nonGoals: [
      'npm publish',
      'public npx @securist/operator',
      'Team Graph',
      'Vercel mutation',
    ],
  }
  writeFileSync(join(stage, 'MANIFEST.json'), JSON.stringify(manifest, null, 2) + '\n')

  const tgz = join(OUT, `${dirName}.tgz`)
  await tarGzDir(stage, tgz)
  const tgzSha = sha256File(tgz)

  const summary = {
    ok: true,
    tarball: relativeToRoot(tgz),
    tarballSha256: tgzSha,
    stageDir: relativeToRoot(stage),
    version,
    contentDigest: identity.contentDigest.hex,
    signerKeyId: identity.signerKeyId,
    verify: `node scripts/operator-rc-verify-clean.mjs --rc-dir ${relativeToRoot(stage)}`,
    publicNpxClaim: false,
  }

  writeFileSync(join(OUT, 'latest-rc.json'), JSON.stringify(summary, null, 2) + '\n')

  // Evidence summary under gitignored .operator-rc/
  const evidenceDir = join(OUT, 'evidence')
  mkdirSync(evidenceDir, { recursive: true })
  writeFileSync(
    join(evidenceDir, 'rc-summary.json'),
    JSON.stringify(
      {
        ...summary,
        note: 'Tarball path is local (.operator-rc, gitignored).',
      },
      null,
      2,
    ) + '\n',
  )

  console.log('\noperator:rc ok')
  console.log('  stage:', summary.stageDir)
  console.log('  tarball:', summary.tarball)
  console.log('  sha256:', tgzSha)
  console.log('  verify:', summary.verify)
  console.log('  public npx claim: false')
}

function relativeToRoot(p) {
  return p.startsWith(ROOT) ? p.slice(ROOT.length + 1) : p
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
