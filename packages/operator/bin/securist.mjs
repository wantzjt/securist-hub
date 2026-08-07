#!/usr/bin/env node
/**
 * securist CLI entry — delegates to TypeScript via tsx when available,
 * or node --experimental-strip-types if present.
 */
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const cli = join(root, 'src', 'cli.ts')
const args = process.argv.slice(2)

const tsx = spawnSync(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['tsx', cli, ...args],
  { stdio: 'inherit', cwd: process.cwd(), env: process.env },
)
process.exit(tsx.status ?? 1)
