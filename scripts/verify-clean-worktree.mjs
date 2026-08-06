#!/usr/bin/env node
/** Fail when tracked or untracked, non-ignored repository files are dirty. */
import { execFileSync } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')

try {
  const status = execFileSync(
    'git',
    ['status', '--porcelain=v1', '--untracked-files=all'],
    {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  ).trim()

  if (status) {
    console.error('verify:clean-worktree failed')
    console.error(
      'Commit, intentionally remove, or gitignore every generated file:',
    )
    console.error(status)
    process.exitCode = 1
  } else {
    console.log('verify:clean-worktree ok')
  }
} catch (error) {
  console.error(`verify:clean-worktree failed: ${String(error)}`)
  process.exitCode = 1
}
