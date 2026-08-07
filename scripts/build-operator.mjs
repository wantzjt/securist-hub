#!/usr/bin/env node
/**
 * Bundle operator CLI to packages/operator/dist/cli.js (no runtime tsx/npx).
 * After build, the signed package digest must include dist/cli.js.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

let esbuild
try {
  esbuild = require('esbuild')
} catch {
  console.error(
    'esbuild not found (expected via vite in monorepo). npm install first.',
  )
  process.exit(1)
}

const operatorDir = join(root, 'packages/operator')
const outfile = join(operatorDir, 'dist', 'cli.js')
mkdirSync(dirname(outfile), { recursive: true })

await esbuild.build({
  entryPoints: [join(operatorDir, 'src/cli.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile,
  packages: 'bundle',
  logLevel: 'info',
})

const js = readFileSync(outfile, 'utf8')
if (/\bnpx\b/.test(js) || /\btsx\b/.test(js)) {
  console.error('Built CLI unexpectedly references npx/tsx')
  process.exit(1)
}

const { computePackageContentDigest, PACKAGE_ARTIFACT_RELS } = await import(
  pathToFileURL(join(operatorDir, 'package-artifacts.mjs')).href
)
const digest = computePackageContentDigest(operatorDir)
if (!digest.ok) {
  console.error('Post-build package digest failed:', digest.error)
  process.exit(1)
}

console.log('operator build ok:', outfile)
console.log('package digest (unsigned until sign):', digest.hex.slice(0, 16) + '…')
console.log('artifacts:', PACKAGE_ARTIFACT_RELS.join(', '))
