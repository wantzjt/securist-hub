/**
 * Admission packs (WO-031) — versioned in-repo scaffolds.
 *
 * Opinionated intended-use prompts + evidence checklists for three classes:
 * coding-agent, MCP server, model/weights.
 *
 * Not a compliance certification. Not Team Graph live. Not a public registry install.
 * No PQC hero claims. Public-source checklists only.
 *
 * Canonical JSON copies live under ops/admission-packs/v1/.
 */
export const ADMISSION_PACK_CATALOG_VERSION = '1' as const
export const ADMISSION_PACK_VERSION = '1.0.0' as const

export const ADMISSION_PACK_IDS = [
  'coding-agent',
  'mcp-server',
  'model-weights',
] as const

export type AdmissionPackIdV1 = (typeof ADMISSION_PACK_IDS)[number]

export type AdmissionPackClassV1 = 'coding-agent' | 'mcp' | 'model'

export type AdmissionPackChecklistItemV1 = {
  id: string
  label: string
  required: boolean
  publicSourceHint: string
}

export type AdmissionPackSampleV1 = {
  label: string
  url: string
  note: string
}

export type AdmissionPackV1 = {
  id: AdmissionPackIdV1
  version: typeof ADMISSION_PACK_VERSION
  catalogVersion: typeof ADMISSION_PACK_CATALOG_VERSION
  class: AdmissionPackClassV1
  title: string
  summary: string
  admitted: string
  intendedUsePrompt: string
  environmentDefault: 'research' | 'development' | 'staging' | 'production'
  deploymentBoundaryDefault:
    'local_only' | 'controlled_cloud' | 'external_service'
  evidenceChecklist: AdmissionPackChecklistItemV1[]
  unknownDefaults: string[]
  evidenceGapDefaults: string[]
  reReviewTriggers: string[]
  outOfScope: string[]
  disclaimers: string[]
  sampleSources: AdmissionPackSampleV1[]
  dogfoodNotes: string
}

const SHARED_OUT_OF_SCOPE = [
  'Compliance certification or audit letter',
  'Team Graph live admission or durable shared record (R1 not live)',
  'Public registry install of @securist/operator',
  'Pentest, SCA scan, or invented vulnerability claims',
  'Post-quantum / PQC hero claims (packs do not assert ML-KEM or PQ signatures)',
  'Paid policy marketplace',
] as const

const SHARED_DISCLAIMERS = [
  'Admission pack is a scaffold — not a compliance certification.',
  'Team Graph is not live; this pack does not create a durable admission record.',
  'Public registry install of @securist/operator is not available.',
  'Not a pentest, SCA scan, or production approval.',
  'No PQC / post-quantum property is asserted by this pack.',
] as const

export const CODING_AGENT_PACK: AdmissionPackV1 = {
  id: 'coding-agent',
  version: ADMISSION_PACK_VERSION,
  catalogVersion: ADMISSION_PACK_CATALOG_VERSION,
  class: 'coding-agent',
  title: 'Coding agent',
  summary:
    'Admit a coding agent (IDE assistant, CLI agent, or PR bot) to write or review code under a stated use — not a production deploy authority.',
  admitted:
    'A coding agent whose public repository can be named, licensed, and scoped. Human review of diffs remains required. No production merge or deploy authority is granted by this pack.',
  intendedUsePrompt:
    'Admit this coding agent to generate and review application code in development. No production deploy authority. No secret exfiltration. A human reviews all diffs before merge.',
  environmentDefault: 'development',
  deploymentBoundaryDefault: 'local_only',
  evidenceChecklist: [
    {
      id: 'public_repo',
      label: 'Public GitHub repository URL on default branch',
      required: true,
      publicSourceHint: 'GitHub repo API (public)',
    },
    {
      id: 'license',
      label: 'License SPDX or license file observed',
      required: true,
      publicSourceHint: 'GitHub license metadata or LICENSE file',
    },
    {
      id: 'capability_claims',
      label:
        'README or docs state what the agent may do (edit, shell, network)',
      required: true,
      publicSourceHint: 'Public README / docs',
    },
    {
      id: 'tool_surface',
      label:
        'Tool or permission surface documented (filesystem, network, shell)',
      required: true,
      publicSourceHint: 'Public docs — not a live tool enumeration',
    },
    {
      id: 'model_backend',
      label: 'Model or backend disclosed, or explicitly unknown',
      required: false,
      publicSourceHint: 'README / model card if published',
    },
    {
      id: 'security_policy',
      label: 'SECURITY.md or disclosure path if present',
      required: false,
      publicSourceHint: 'Public SECURITY.md',
    },
  ],
  unknownDefaults: [
    'Runtime tool allowlist was not observed from public metadata.',
    'Prompt-injection and secret-exfiltration controls were not evaluated.',
    'Model or backend provenance was not verified on this path.',
    'No Team Graph admission record exists (Team Graph is not live).',
  ],
  evidenceGapDefaults: [
    'agent_tool_surface',
    'model_governance',
    'secret_handling',
    'security',
  ],
  reReviewTriggers: [
    'Agent release tag or default-branch digest change',
    'Documented tool surface gain (shell, network, or write)',
    'Intended use or deployment boundary change',
    'Model or backend swap without a new brief',
  ],
  outOfScope: [...SHARED_OUT_OF_SCOPE],
  disclaimers: [...SHARED_DISCLAIMERS],
  sampleSources: [
    {
      label: 'Aider (public coding agent)',
      url: 'https://github.com/Aider-AI/aider',
      note: 'Public GitHub sample for /assess dogfood. Not an endorsement or approval.',
    },
  ],
  dogfoodNotes:
    'Public /assess collects GitHub metadata only. Use the sample URL to exercise the pack; Local Operator --pack coding-agent applies the same unknowns/gaps to a private tree without upload.',
}

export const MCP_SERVER_PACK: AdmissionPackV1 = {
  id: 'mcp-server',
  version: ADMISSION_PACK_VERSION,
  catalogVersion: ADMISSION_PACK_CATALOG_VERSION,
  class: 'mcp',
  title: 'MCP server',
  summary:
    'Admit an MCP server that exposes tools to a local or IDE client. Prefer stdio and read-only tools. Not a production control plane.',
  admitted:
    'An MCP server whose public repository can be named and whose documented tools can be listed as claims. This pack does not enumerate live tools/list output and does not enforce an allowlist.',
  intendedUsePrompt:
    'Admit this MCP server for local IDE context over stdio. Prefer read-only tools. No execute, approve, shell, or external-write tools. Not a production control plane.',
  environmentDefault: 'development',
  deploymentBoundaryDefault: 'local_only',
  evidenceChecklist: [
    {
      id: 'public_repo',
      label: 'Public GitHub repository URL on default branch',
      required: true,
      publicSourceHint: 'GitHub repo API (public)',
    },
    {
      id: 'license',
      label: 'License SPDX or license file observed',
      required: true,
      publicSourceHint: 'GitHub license metadata or LICENSE file',
    },
    {
      id: 'tool_list_docs',
      label: 'Documented tool list (names + what they touch)',
      required: true,
      publicSourceHint:
        'Public README / MCP tool docs — not a live tools/list call',
    },
    {
      id: 'transport',
      label: 'Transport stated (stdio preferred; HTTP/SSE called out if used)',
      required: true,
      publicSourceHint: 'Public docs',
    },
    {
      id: 'auth_secrets',
      label: 'Auth and secret handling documented (or explicitly unknown)',
      required: true,
      publicSourceHint: 'Public README / security notes',
    },
    {
      id: 'write_execute',
      label:
        'Execute / approve / external-write tools absent or explicitly scoped',
      required: true,
      publicSourceHint: 'Public tool docs',
    },
  ],
  unknownDefaults: [
    'Live MCP tools/list schema was not enumerated by this assess path.',
    'Network egress of tools was not verified.',
    'No runtime allowlist enforcement (Team Graph is not live).',
    'Secret material in tool arguments was not inspected.',
  ],
  evidenceGapDefaults: [
    'mcp_tool_surface',
    'secret_handling',
    'security',
    'transport_honesty',
  ],
  reReviewTriggers: [
    'New tool added to the documented MCP surface',
    'Transport change (stdio to HTTP/SSE or remote)',
    'Auth or secret-handling change',
    'Intended use or deployment boundary change',
  ],
  outOfScope: [...SHARED_OUT_OF_SCOPE],
  disclaimers: [...SHARED_DISCLAIMERS],
  sampleSources: [
    {
      label: 'MCP example servers (public)',
      url: 'https://github.com/modelcontextprotocol/servers',
      note: 'Public GitHub sample for /assess dogfood. Not an endorsement or approval.',
    },
  ],
  dogfoodNotes:
    'Public /assess does not speak MCP. Documented tool claims stay in the checklist; live schema is an explicit unknown. Local Operator --pack mcp-server applies the same defaults.',
}

export const MODEL_WEIGHTS_PACK: AdmissionPackV1 = {
  id: 'model-weights',
  version: ADMISSION_PACK_VERSION,
  catalogVersion: ADMISSION_PACK_CATALOG_VERSION,
  class: 'model',
  title: 'Model / weights',
  summary:
    'Admit a model or weight bundle for local or controlled-cloud inference. Weight digest is unknown unless separately evidenced. No PQC claim.',
  admitted:
    'A model or weight-related public repository that can be named, licensed, and scoped for inference. This pack does not verify weight blobs, training data, or eval suites.',
  intendedUsePrompt:
    'Admit these model weights for local or controlled-cloud inference under the stated environment. Not a production approval. Weight digest and training-data provenance remain unknown unless separately evidenced.',
  environmentDefault: 'research',
  deploymentBoundaryDefault: 'local_only',
  evidenceChecklist: [
    {
      id: 'public_repo',
      label: 'Public GitHub repository or model-card repo URL',
      required: true,
      publicSourceHint:
        'GitHub repo API (public). Hugging Face blobs are not fetched.',
    },
    {
      id: 'license',
      label: 'License or use-restriction text observed',
      required: true,
      publicSourceHint: 'GitHub license metadata or LICENSE / model card',
    },
    {
      id: 'architecture_claim',
      label: 'Architecture or parameter-size claim published',
      required: false,
      publicSourceHint: 'Public README / model card',
    },
    {
      id: 'weight_source',
      label: 'Weight distribution source named (GitHub Release, HF, other)',
      required: true,
      publicSourceHint: 'Public docs — digest not verified on this path',
    },
    {
      id: 'eval_notes',
      label: 'Published eval or safety notes if any',
      required: false,
      publicSourceHint: 'Public model card',
    },
    {
      id: 'adapter_lineage',
      label: 'Fine-tune / adapter lineage stated, or explicitly unknown',
      required: false,
      publicSourceHint: 'Public docs',
    },
  ],
  unknownDefaults: [
    'Weight content digest was not verified on this path.',
    'Training data was not inspected.',
    'Quantization and adapter lineage remain unknown unless observed.',
    'No PQC or crypto-agility property is asserted for this model.',
    'Hugging Face weight blobs are not collected by public GitHub assess.',
    'No Team Graph admission record exists (Team Graph is not live).',
  ],
  evidenceGapDefaults: [
    'model_governance',
    'weight_provenance',
    'eval_coverage',
    'license',
  ],
  reReviewTriggers: [
    'Weight digest, quantization, or adapter change',
    'License or use-restriction change',
    'Intended use or deployment boundary change',
    'New published eval that contradicts prior claims',
  ],
  outOfScope: [...SHARED_OUT_OF_SCOPE],
  disclaimers: [...SHARED_DISCLAIMERS],
  sampleSources: [
    {
      label: 'llama-models (public model-card repo)',
      url: 'https://github.com/meta-llama/llama-models',
      note: 'Public GitHub sample. Weight blobs are not fetched; digest remains an unknown. Not an endorsement or approval.',
    },
  ],
  dogfoodNotes:
    'Public /assess is GitHub-only. Hugging Face cards and GGUF blobs are out of band — listed as unknowns. Local Operator --pack model-weights applies the same defaults to a local tree.',
}

export const ADMISSION_PACKS: Record<AdmissionPackIdV1, AdmissionPackV1> = {
  'coding-agent': CODING_AGENT_PACK,
  'mcp-server': MCP_SERVER_PACK,
  'model-weights': MODEL_WEIGHTS_PACK,
}

export const ADMISSION_PACK_LIST: AdmissionPackV1[] = ADMISSION_PACK_IDS.map(
  (id) => ADMISSION_PACKS[id],
)

export function isAdmissionPackId(value: string): value is AdmissionPackIdV1 {
  return (ADMISSION_PACK_IDS as readonly string[]).includes(value)
}

export function getAdmissionPack(id: string): AdmissionPackV1 | undefined {
  if (!isAdmissionPackId(id)) return undefined
  return ADMISSION_PACKS[id]
}

export function unionUnique(
  base: readonly string[],
  extra: readonly string[],
): string[] {
  const out: string[] = []
  for (const item of [...base, ...extra]) {
    if (!out.includes(item)) out.push(item)
  }
  return out
}

export function applyAdmissionPack(
  pack: AdmissionPackV1,
  lists: {
    unknowns: string[]
    evidenceGaps: string[]
    reReviewTriggers: string[]
    policyHints: string[]
    disclaimers: string[]
  },
): {
  unknowns: string[]
  evidenceGaps: string[]
  reReviewTriggers: string[]
  policyHints: string[]
  disclaimers: string[]
} {
  return {
    unknowns: unionUnique(lists.unknowns, pack.unknownDefaults),
    evidenceGaps: unionUnique(lists.evidenceGaps, pack.evidenceGapDefaults),
    reReviewTriggers: unionUnique(
      lists.reReviewTriggers,
      pack.reReviewTriggers,
    ),
    policyHints: unionUnique(lists.policyHints, [
      `Admission pack ${pack.id}@${pack.version} (${pack.class}): scaffold only — not a compliance certification.`,
      'Team Graph is not live; this pack does not create a durable admission record.',
      'Public registry install of @securist/operator is not available.',
    ]),
    disclaimers: unionUnique(lists.disclaimers, pack.disclaimers),
  }
}

export const ADMISSION_PACK_HONESTY = {
  notComplianceCert: true,
  teamGraphLive: false,
  publicNpx: false,
  pqcHero: false,
} as const
