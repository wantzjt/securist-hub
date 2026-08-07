#!/usr/bin/env node
/**
 * Bundle operator CLI to packages/operator/dist/cli.js (no runtime tsx/npx).
 * Uses monorepo esbuild from vite's dependency tree.
 */
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const require = createRequire(join(root, 'package.json'))

let esbuild
try {
  esbuild = require('esbuild')
} catch {
  console.error('esbuild not found (expected via vite in monorepo). npm install first.')
  process.exit(1)
}

const outfile = join(root, 'packages/operator/dist/cli.js')
mkdirSync(dirname(outfile), { recursive: true })

await esbuild.build({
  entryPoints: [join(root, 'packages/operator/src/cli.ts')],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile,
  // Bundle workspace contracts into the binary so dist is self-contained
  packages: 'bundle',
  logLevel: 'info',
})

// Marker for clean-package fixture
writeFileSync(
  join(root, 'packages/operator/dist/.built'),
  new Date().toISOString() + '\n',
)

// Sanity: dist must not reference tsx or npx
const js = readFileSync(outfile, 'utf8')
if (/\bnpx\b/.test(js) || /\btsx\b/.test(js)) {
  console.error('Built CLI unexpectedly references npx/tsx')
  process.exit(1)
}

console.log('operator build ok:', outfile)
