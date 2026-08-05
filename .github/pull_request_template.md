## Work-Order

Work-Order: WO-XXX

<!-- Required. One active work order per PR. See ops/work-orders/ -->

## Summary

<!-- What changed and why. Link roadmap item if applicable (e.g. RM-001). -->

## Contracts affected

- [ ] None (docs/CI/ops only)
- [ ] `packages/contracts` / Decision Graph types
- [ ] `migrations/`
- [ ] `state-machine` / policy / outbox / store
- [ ] Surface contracts / docs (`CANONICAL-CONTRACTS`, `SYSTEM-MODEL`, …)

List paths:

```
```

## Verification

Commands run (paste results or CI link):

```bash
npm run lint
npm run typecheck
npm run test:lifecycle
npm run build
npm run verify:coordination
# npm run test:graph   # only if present on branch
```

- [ ] typecheck / lifecycle / build green
- [ ] coordination verify green
- [ ] no secrets in diff
- [ ] public-source only

## Non-goals

<!-- Explicit out of scope for this PR — copy from the work order when possible. -->

-

## legal_risk

-

## License / model card check

- [ ] N/A for this PR
- [ ] Checked (note artifacts)

## Review notes for Codex / human

- [ ] No silent scope expansion vs work order
- [ ] No new route-local domain models
- [ ] Human gates called out (credentials, migrations, external writes, deploy)
