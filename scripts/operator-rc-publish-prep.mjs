#!/usr/bin/env node
/**
 * WO-023 — offline publish-gate prep for Operator RC.
 *
 * Validates a production-signed RC under .operator-rc/ and writes:
 *   - SHA256SUMS.txt
 *   - RELEASE-NOTES-DRAFT.md
 *   - evidence/publish-prep-report.json
 *
 * Does NOT: create GitHub releases, npm publish, upload, or touch Vercel.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  copyFileSync,
} from 'node:fs'
import { createHash } from 'node:crypto'
import { join, dirname, basename } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, '.operator-rc')

function die(msg) {
  console.error(msg)
  process.exit(1)
}

function sha256File(abs) {
  return createHash('sha256').update(readFileSync(abs)).digest('hex')
}

function main() {
  console.log('operator:rc:publish-prep — offline GitHub Release draft (no upload)\n')

  const latestPath = join(OUT, 'latest-rc.json')
  if (!existsSync(latestPath)) {
    die(
      'Missing .operator-rc/latest-rc.json\nRun: SECURIST_OPERATOR_SIGNING_KEY=… npm run operator:rc',
    )
  }

  const latest = JSON.parse(readFileSync(latestPath, 'utf8'))
  if (latest.publicNpxClaim === true) {
    die('Refuse: latest RC claims publicNpxClaim true')
  }
  if (latest.dogfood === true) {
    die(
      'Refuse: latest RC is dogfood/ephemeral. Run production operator:rc with the offline signing key first.',
    )
  }
  if (latest.signerKeyId !== 'securist-operator-release-key') {
    die(
      `Refuse: signerKeyId must be securist-operator-release-key (got ${latest.signerKeyId})`,
    )
  }

  const stageDir = join(ROOT, latest.stageDir)
  const tarball = join(ROOT, latest.tarball)
  if (!existsSync(stageDir)) die(`stage missing: ${stageDir}`)
  if (!existsSync(tarball)) die(`tarball missing: ${tarball}`)

  const manifestPath = join(stageDir, 'MANIFEST.json')
  const identityPath = join(stageDir, 'runtime-identity.json')
  const trustPath = join(stageDir, 'keys/trust-root.pem')
  for (const p of [manifestPath, identityPath, trustPath]) {
    if (!existsSync(p)) die(`RC incomplete: missing ${p}`)
  }

  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (manifest.kind !== 'securist_operator_release_candidate') {
    die(`Unexpected MANIFEST.kind: ${manifest.kind}`)
  }
  if (manifest.publicNpxClaim !== false) {
    die('MANIFEST.publicNpxClaim must be false')
  }
  if (manifest.signerKeyId !== 'securist-operator-release-key') {
    die('MANIFEST.signerKeyId must be securist-operator-release-key')
  }

  const trustPem = readFileSync(trustPath, 'utf8')
  if (!/BEGIN PUBLIC KEY/.test(trustPem) || /BEGIN PRIVATE KEY/.test(trustPem)) {
    die('trust-root.pem must be public key only')
  }

  const tgzName = basename(tarball)
  const tgzSha = sha256File(tarball)
  const sums = `${tgzSha}  ${tgzName}\n`
  const sumsPath = join(OUT, 'SHA256SUMS.txt')
  writeFileSync(sumsPath, sums)

  const notesPath = join(OUT, 'RELEASE-NOTES-DRAFT.md')
  const notes = `# Local Operator ${latest.version} RC — signed · not npm

**Pre-release** of the free Securist Local Operator.

## Honest status

- **Signed** release candidate (\`signerKeyId=securist-operator-release-key\`).
- Package remains **private** — this is **not** public \`npx @securist/operator\`.
- **Not** Team Graph / shared durable decisions (R1 not live).
- **Not** an Electron app.

## Content digest

\`\`\`
${latest.contentDigest}
\`\`\`

## Tarball

- File: \`${tgzName}\`
- SHA-256: \`${tgzSha}\`

## Install (offline)

\`\`\`bash
tar -xzf ${tgzName}
cd securist-operator-${latest.version}-rc
export SECURIST_HOME="$(pwd)/.securist-home"
mkdir -p "$SECURIST_HOME"
node bin/securist.mjs doctor
# expect: Runtime verified · synthesis unavailable
node bin/securist.mjs assess /path/to/repo --intended-use "Local engineering review"
\`\`\`

Site guide: \`/operator\` Path B (signed RC). Monorepo Path A remains available for everyone.

## Verify integrity

\`\`\`bash
shasum -a 256 -c SHA256SUMS.txt
\`\`\`

## Non-goals of this release

- npm publish
- public npx install claim
- cloud upload of private source
- paid Team Graph activation

## Built from

- Stage: \`${latest.stageDir}\`
- Verify: \`${latest.verify}\`
`

  writeFileSync(notesPath, notes)

  // Convenience copies next to tarball for human upload
  copyFileSync(manifestPath, join(OUT, 'MANIFEST.publish.json'))

  const report = {
    kind: 'operator_rc_publish_prep',
    ok: true,
    at: new Date().toISOString(),
    version: latest.version,
    signerKeyId: latest.signerKeyId,
    contentDigest: latest.contentDigest,
    tarball: latest.tarball,
    tarballSha256: tgzSha,
    stageDir: latest.stageDir,
    outputs: {
      sha256sums: '.operator-rc/SHA256SUMS.txt',
      releaseNotesDraft: '.operator-rc/RELEASE-NOTES-DRAFT.md',
      manifestCopy: '.operator-rc/MANIFEST.publish.json',
    },
    nonGoals: [
      'github release create',
      'npm publish',
      'public npx',
      'vercel mutation',
    ],
    nextHuman: [
      'Edit RELEASE-NOTES-DRAFT.md if needed',
      'gh release create … --prerelease (see docs/OPERATOR-PUBLISH-GATE.md)',
      'Do not update site to claim public npx',
    ],
  }

  const evidenceDir = join(OUT, 'evidence')
  mkdirSync(evidenceDir, { recursive: true })
  writeFileSync(
    join(evidenceDir, 'publish-prep-report.json'),
    JSON.stringify(report, null, 2) + '\n',
  )

  console.log('publish-prep ok')
  console.log('  tarball sha256:', tgzSha)
  console.log('  wrote:', sumsPath)
  console.log('  wrote:', notesPath)
  console.log('  wrote:', join(OUT, 'MANIFEST.publish.json'))
  console.log('  wrote:', join(evidenceDir, 'publish-prep-report.json'))
  console.log('\nNext (human only): docs/OPERATOR-PUBLISH-GATE.md → gh release create')
  console.log('This script did NOT upload or publish anything.')
}

main()
