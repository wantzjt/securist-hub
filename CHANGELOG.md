# Changelog

All notable changes to this repository are recorded here.  
Format guided by [Keep a Changelog](https://keepachangelog.com/); versions may be monorepo tags rather than npm package versions until public Operator distribution.

**Release notes must include:** behavior change · compatibility/security impact · verification · rollback note.  
See [`docs/BUILDING-IN-PUBLIC.md`](docs/BUILDING-IN-PUBLIC.md).

---

## [Unreleased]

### Added
- Team Graph contract freeze (WO-032): Decision / owner / policy / evidence / re-review schemas and stub API. Coming next / not live. R1/Postgres remains John-only (WO-008). No package registry publish.
- Admission packs (WO-031): coding-agent, MCP server, model/weights scaffolds with intended-use prompts and evidence checklists on /assess and Local Operator. Not a compliance certification. Team Graph not live. No PQC hero.
- Public Decision Brief GitHub Action (WO-030): one ephemeral PR comment, GITHUB_TOKEN only, not production approval, Team Graph not live.
- Open-build front door (WO-013): README rewrite, community docs, building-in-public policy.

---

## 2026-08-07 — Securist V1 (R0) open checkpoint

### Added
- **Public assess** → ephemeral share-safe Decision Brief (WO-010 · PR #14).  
- **Local Operator** monorepo path: `doctor`, `assess`, stdio MCP, honest provenance (WO-012 · PR #19).  
- System graph + clean-worktree gates (WO-011 · PR #16).  
- Buyer messaging + Operator release lane docs (PR #20).  
- Dependabot, CodeQL, secret scanning posture (PR #21).  

### Security
- Anonymous `/assess` does not use privileged GitHub tokens.  
- Operator: no private signing key in product path; unsigned runtime blocks assess; signature covers `dist/cli.js`.  

### Known limits (not shipped)
- No public `npx @securist/operator`.  
- No shared Team Graph / multi-user durable decisions (R1).  
- No autonomous remediation or private cloud assess.  

### Verification
```bash
npm run lint && npm run typecheck && npm run test:lifecycle && npm run test:graph \
  && npm run test:public-assess && npm run test:decision-brief-contracts \
  && npm run operator:build && npm run test:operator && npm run build \
  && npm run verify:coordination && npm run verify:release-readiness \
  && npm run verify:system-graph && npm run verify:clean-worktree
```

### Rollback
Deploy previous Vercel production for hub UI; Operator is monorepo-local (no published package to unpublish).

---

## Earlier history

Pre-R0 work (Decision Graph contracts, Postgres seam, release ops, control plane) lives in git history and prior PRs (#2–#13). Summaries are not exhaustive here.
