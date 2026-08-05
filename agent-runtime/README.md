# Securist Agent Runtime (Eve)

**Separate** from the public hub. Scaffold later with `npx eve@latest init` under the TARX Vercel team.

This directory holds **spec-only** agent definitions until the Eve app is deployed. Hub does not import Eve packages.

## Placement

Eve proposes → hub gateway (`src/lib/eve-gateway`) → Decision Graph / policy → humans approve writes.

## Agents (see `agents/*/instructions.md`)

1. scout  
2. change_analyst  
3. policy_explainer  
4. validation_planner  
5. contribution_planner  

## Tools Eve is allowed to call (conceptually)

- `POST` hub `submitEveCandidateEvidence` (and related) with service auth  
- Read public GitHub/HF APIs  
- Sandbox file work for draft patches  

## Tools Eve must not get

- Direct DB access to Decision Graph  
- Approval mutation APIs  
- Long-lived GitHub PATs with org-wide write  
- Access to operator private workspaces  

## Vertical slice order

See `docs/EVE-RUNTIME.md` and `@securist/contracts` `VERTICAL_SLICE_STAGES`.
