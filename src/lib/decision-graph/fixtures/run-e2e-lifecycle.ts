import { runE2ELifecycleFixture } from './e2e-lifecycle'

const result = runE2ELifecycleFixture()
console.log(JSON.stringify(result, null, 2))

if (!result.ok) process.exitCode = 1
