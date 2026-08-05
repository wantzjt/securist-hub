#!/usr/bin/env bash
# Deploy Securist hub to Vercel under TARX team only. Never Hobby.
set -euo pipefail
cd "$(dirname "$0")/.."

SCOPE=tarx
TEAM_ID=team_bfsWCYAbPeMELSnBhOAriqGF
PROJECT=securist-hub
EXPECTED_ORG=$TEAM_ID

if [[ -f .vercel/project.json ]]; then
  org=$(python3 -c 'import json;print(json.load(open(".vercel/project.json")).get("orgId",""))')
  name=$(python3 -c 'import json;print(json.load(open(".vercel/project.json")).get("projectName",""))')
  if [[ "$org" != "$EXPECTED_ORG" ]]; then
    echo "ERROR: .vercel/project.json orgId=$org is NOT TARX ($EXPECTED_ORG)."
    echo "Refusing deploy. Run: vercel link --yes --project $PROJECT --scope $SCOPE"
    exit 1
  fi
  if [[ "$name" != "$PROJECT" ]]; then
    echo "ERROR: linked project is '$name', expected '$PROJECT'."
    exit 1
  fi
else
  echo "No .vercel link — linking to tarx/$PROJECT"
  vercel link --yes --project "$PROJECT" --scope "$SCOPE"
fi

echo "Deploying tarx/$PROJECT (scope=$SCOPE)…"
VERCEL=1 vercel deploy --prod --yes --scope "$SCOPE"
echo "Verify: vercel domains verify secur.ist --scope $SCOPE"
