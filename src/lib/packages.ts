/**
 * Canonical package REPOS — single source for site /tools, daemon, flywheel, READMEs.
 *
 * Public beachhead packages: github.com/Securist-InfoSec/<id>
 * Product hub (this site / Local Operator monorepo): github.com/wantzjt/securist-hub
 *
 * Note: org constant lives here to avoid circular import with brand.ts
 */
/** Real public package org (not the empty user github.com/securist). */
export const GITHUB_ORG = 'Securist-InfoSec' as const
/** Product hub monorepo — open build + Operator source of truth. */
export const PRODUCT_HUB_REPO = 'wantzjt/securist-hub' as const

export type PackageRepo = {
  id: string
  opsRole: string
  stage: 'discover' | 'package' | 'field' | 'compound'
  summary: string
  securityNote: string
  githubPath: string
  clone: string
  siteHref: string
  agentPrompt: string
  hfModels?: string[]
}

export const REPOS: PackageRepo[] = [
  {
    id: 'hub',
    opsRole: 'Product hub',
    stage: 'compound',
    summary:
      'Public product hub (this site). Permission system: Assess · Local Operator · Team Graph (next). Beachhead packages live under Securist-InfoSec.',
    securityNote:
      'No secrets in git. Legal OSINT posture only. Beachheads are scaffolds, not production CTI platforms.',
    githubPath: `github.com/${PRODUCT_HUB_REPO}`,
    clone: `git clone https://github.com/${PRODUCT_HUB_REPO}.git`,
    siteHref: '/',
    agentPrompt: `You are a Securist fielding agent on Securist.
Product hub: ${PRODUCT_HUB_REPO}. Public package org: ${GITHUB_ORG}. Domain: secur.ist.
Rules: public-source only; no personal handles in operator-facing copy; TARX upstream only (not customer brand).
Packages under ${GITHUB_ORG} are beachhead scaffolds — not production CTI platforms.
1) Pull hub: git clone https://github.com/${PRODUCT_HUB_REPO}.git
2) npm install && ./startup.sh  # 0.0.0.0:8080
3) Verify /models HF Scout and /daemon GH Scout (honest org pointers).
Ethics gate: refuse unauthorized access.`,
    hfModels: ['BAAI/bge-small-en-v1.5'],
  },
  {
    id: 'scout-daemon',
    opsRole: 'GH Scout',
    stage: 'discover',
    summary:
      'Public-repo discovery scaffold (beachhead). Rate-limited, legal_risk tags, agent setup prompts.',
    securityNote:
      'Public repos only. No private access. Beachhead scaffold — not a production CTI platform.',
    githubPath: `github.com/${GITHUB_ORG}/scout-daemon`,
    clone: `git clone https://github.com/${GITHUB_ORG}/scout-daemon.git`,
    siteHref: '/daemon',
    agentPrompt: `You are a Securist GH Scout (public package org ${GITHUB_ORG}).
Rules: public repositories only; rate-limited; tag legal_risk; no private access.
Beachhead packages are scaffolds — not production CTI platforms.
1) Inventory ${GITHUB_ORG} public packages (honest org; not empty user github.com/securist).
2) Emit gh_scout events with repo + legal_risk + summary.
3) Pair discoveries with HF Scout on /models when models enrich the repo.
Ethics gate: refuse credential stuffing and unauthorized scanning.`,
    hfModels: ['ehsanaghaei/SecureBERT', 'microsoft/codebert-base'],
  },
  {
    id: 'implementer-sdk',
    opsRole: 'Package',
    stage: 'package',
    summary:
      'Typed implementer contracts and legal-use headers for fielding workflows (beachhead).',
    securityNote: 'Package telemetry only — no weight phone-home. Scaffold only.',
    githubPath: `github.com/${GITHUB_ORG}/implementer-sdk`,
    clone: `git clone https://github.com/${GITHUB_ORG}/implementer-sdk.git`,
    siteHref: '/tools',
    agentPrompt: `You are a Securist implementer agent (org ${GITHUB_ORG}).
Rules: legal-use headers; AUP; public-source fielding only.
1) Clone implementer-sdk from ${GITHUB_ORG} (not empty github.com/securist).
2) Wire package contracts without dark telemetry on model weights.
3) Log package events to activity kinds ops_package only.
Ethics gate: no unauthorized systems.`,
  },
  {
    id: 'geolite2-bridge',
    opsRole: 'Geo (city/ASN)',
    stage: 'package',
    summary:
      'MaxMind GeoLite2 bridge helpers (beachhead). City/ASN class only — no household GeoIP.',
    securityNote: 'Respect MaxMind GeoLite2 license and attribution. Scaffold only.',
    githubPath: `github.com/${GITHUB_ORG}/geolite2-bridge`,
    clone: `git clone https://github.com/${GITHUB_ORG}/geolite2-bridge.git`,
    siteHref: '/tools',
    agentPrompt: `You are a Securist geo bridge agent (org ${GITHUB_ORG}).
Rules: MaxMind honesty — city/ASN only; never claim household GeoIP.
1) Clone geolite2-bridge from ${GITHUB_ORG}; follow MaxMind download ToS.
2) Document attribution in field notes.
Ethics gate: no stalking / household identification claims.`,
    hfModels: [],
  },
  {
    id: 'redirect-intel',
    opsRole: 'Signal',
    stage: 'discover',
    summary: 'Public redirect / infrastructure intel helpers (beachhead scaffold).',
    securityNote: 'Public sources only. No credentialed scanning. Scaffold only.',
    githubPath: `github.com/${GITHUB_ORG}/redirect-intel`,
    clone: `git clone https://github.com/${GITHUB_ORG}/redirect-intel.git`,
    siteHref: '/tools',
    agentPrompt: `You are a Securist signal agent (org ${GITHUB_ORG}) for redirect-intel.
Rules: public infrastructure signals only; authorized targets only.
1) Clone redirect-intel from ${GITHUB_ORG}.
2) Record legal_risk on every hit.
Ethics gate: no covert intercept.`,
  },
  {
    id: 'tarx-bridge',
    opsRole: 'Field',
    stage: 'field',
    summary:
      'TARX upstream-only interop notes (beachhead). Local private runtime — do not vendor TARX; not customer brand.',
    securityNote: 'Integrate upstream; never rebrand proprietary TARX surfaces.',
    githubPath: `github.com/${GITHUB_ORG}/tarx-bridge`,
    clone: `git clone https://github.com/${GITHUB_ORG}/tarx-bridge.git`,
    siteHref: '/models#tarx',
    agentPrompt: `You are a Securist fielding agent for TARX bridge (org ${GITHUB_ORG}).
Rules: TARX is upstream local private runtime — integrate, do not vendor; not the Securist product brand.
1) Clone tarx-bridge from ${GITHUB_ORG}.
2) Pull HF models offline to operator metal only (huggingface-cli) when authorized.
3) Log model_pull offline=true + license_reviewed=true.
Ethics gate: no illegal weight rehost; no dark phone-home on weights.`,
    hfModels: [
      'TheBloke/Mistral-7B-Instruct-v0.2-GGUF',
      'BAAI/bge-small-en-v1.5',
    ],
  },
  {
    id: 'ecosystem-prompts',
    opsRole: 'Prompts',
    stage: 'package',
    summary: 'Agent prompt packs for dual-forge GH + HF fielding (beachhead).',
    securityNote:
      'Prompts must include ethics gates and honest Securist-InfoSec org naming.',
    githubPath: `github.com/${GITHUB_ORG}/ecosystem-prompts`,
    clone: `git clone https://github.com/${GITHUB_ORG}/ecosystem-prompts.git`,
    siteHref: '/use-cases',
    agentPrompt: `You are a Securist prompt curator (org ${GITHUB_ORG}).
Rules: every prompt includes legal public-source ethics gate; public package org is ${GITHUB_ORG} (not empty user securist).
1) Clone ecosystem-prompts from ${GITHUB_ORG}.
2) Align prompts with /models agent blocks and /daemon Scout setup.
Ethics gate: no classified cosplay; no personal handle marketing.`,
  },
  {
    id: 'sovereignty-lab-kit',
    opsRole: 'Sovereignty',
    stage: 'compound',
    summary: 'Local-first kit defaults and evidence-friendly checklists (beachhead).',
    securityNote: 'Offline-first evidence; no forced cloud identity. Scaffold only.',
    githubPath: `github.com/${GITHUB_ORG}/sovereignty-lab-kit`,
    clone: `git clone https://github.com/${GITHUB_ORG}/sovereignty-lab-kit.git`,
    siteHref: '/use-cases',
    agentPrompt: `You are a Securist sovereignty kit agent (org ${GITHUB_ORG}).
Rules: local-first; evidence checklist; dual-forge offline fielding.
1) Clone sovereignty-lab-kit from ${GITHUB_ORG}.
2) Pair with GGUF model_pull via tarx-bridge for offline SOC lab when authorized.
Ethics gate: authorized use only.`,
    hfModels: ['TheBloke/Mistral-7B-Instruct-v0.2-GGUF'],
  },
  {
    id: 'hf-model-scout',
    opsRole: 'HF Scout',
    stage: 'discover',
    summary:
      'Hugging Face public model discovery scaffold for Securist dual-forge (beachhead).',
    securityNote:
      'Public hub API only. License review before fielding. No illegal rehost. Scaffold only.',
    githubPath: `github.com/${GITHUB_ORG}/hf-model-scout`,
    clone: `git clone https://github.com/${GITHUB_ORG}/hf-model-scout.git`,
    siteHref: '/models',
    agentPrompt: `You are a Securist HF Model Scout (org ${GITHUB_ORG}).
Rules: public Hugging Face artifacts only; User-Agent securist-scout; ethics gates in prompts.
Do not claim a house HF org is live unless verified; use public third-party models with license review.
1) Clone hf-model-scout from ${GITHUB_ORG}.
2) Run hub search packs (CTI, embeddings, GGUF, code security).
3) Emit hf_scout events; pair with ${GITHUB_ORG} packages via /use-cases.
Ethics gate: no unauthorized data; no weight rehost.`,
    hfModels: ['BAAI/bge-small-en-v1.5', 'ehsanaghaei/SecureBERT'],
  },
]

export function packageById(id: string) {
  return REPOS.find((r) => r.id === id)
}

export function githubHttps(id: string) {
  if (id === 'hub') return `https://github.com/${PRODUCT_HUB_REPO}`
  return `https://github.com/${GITHUB_ORG}/${id}`
}
