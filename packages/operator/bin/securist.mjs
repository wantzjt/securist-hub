#!/usr/bin/env node
/**
 * Product entry: run built JS only. No npx, no tsx, no network.
 * Monorepo: npm run operator:build
 */
import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const distCli = join(root, 'dist', 'cli.js')

if (!existsSync(distCli)) {
  console.error(
    'securist: built CLI missing (packages/operator/dist/cli.js).\n' +
      'From the securist-hub monorepo run: npm run operator:build\n' +
      'This package is private and not published to npm.',
  )
  process.exit(1)
}

const result = spawnSync(process.execPath, [distCli, ...process.argv.slice(2)], {
  stdio: 'inherit',
  env: process.env,
})
process.exit(result.status ?? 1)
