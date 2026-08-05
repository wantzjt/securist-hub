# Vercel scope lock — TARX only

**Do not use Hobby / personal / `tarx-75a403e7` for Securist.**

| Item | Value |
|------|--------|
| Team slug | **`tarx`** |
| Team name | **TARX** |
| Team ID | `team_bfsWCYAbPeMELSnBhOAriqGF` |
| Project | **`securist-hub`** |
| Project ID | `prj_VKeQgS5c1ZV2MDDbLEepyPtfSKLb` |
| Domain | **secur.ist** (+ www) owned by team **tarx** |
| Git | https://github.com/wantzjt/securist-hub |

## Forbidden scopes

| Scope | Why |
|-------|-----|
| `tarx-75a403e7` / team name **Hobby** | Old accidental home of `vantage-hub` — do not redeploy Securist here |
| Personal account | Not used for Securist |
| Any other team | Unless operator explicitly migrates |

## CLI rules (always)

```bash
# Preferred — explicit scope every time
vercel deploy --prod --yes --scope tarx
vercel env ls --scope tarx
vercel domains verify secur.ist --scope tarx

# Link (if .vercel missing)
vercel link --yes --project securist-hub --scope tarx
```

Local `.vercel/project.json` must show:

```json
{
  "projectId": "prj_VKeQgS5c1ZV2MDDbLEepyPtfSKLb",
  "orgId": "team_bfsWCYAbPeMELSnBhOAriqGF",
  "projectName": "securist-hub"
}
```

If `orgId` is `team_OLBxkrr2xfgpcruoeMn9Plh3` (Hobby), **stop** and re-link to tarx.

## Global CLI default

`~/.vercel` / `Library/Application Support/com.vercel.cli/config.json`:

```json
"currentTeam": "team_bfsWCYAbPeMELSnBhOAriqGF"
```

## Domains

- `secur.ist` lives under **tarx** team domains.
- Never attach secur.ist to Hobby project `vantage-hub` again.
