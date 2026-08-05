/**
 * Decision Graph store interface (async for Postgres-ready seam).
 * Memory adapter resolves immediately; Postgres adapter queries SQL.
 *
 * Tenant rules:
 * - Writes always require non-empty tenantId (tenant-before-persist).
 * - Reads accept optional tenantId; Postgres mode scopes by tenant
 *   (defaultTenantId or explicit argument). Cross-tenant get returns undefined.
 */
import type {
  ActivityEventV2,
  Artifact,
  ArtifactProfileBrief,
  DecisionGraphSnapshot,
  EvidenceRecord,
  PolicyEvaluation,
} from './types'

export type ActivityListFilter = {
  publicOnly?: boolean
  tenantId?: string
}

export type DecisionGraphStore = {
  getSnapshot: (tenantId?: string) => Promise<DecisionGraphSnapshot>
  getArtifact: (
    id: string,
    tenantId?: string,
  ) => Promise<Artifact | undefined>
  getProfile: (
    id: string,
    tenantId?: string,
  ) => Promise<ArtifactProfileBrief | undefined>
  listArtifacts: (tenantId?: string) => Promise<Artifact[]>
  listEvidence: (
    artifactId: string,
    tenantId?: string,
  ) => Promise<EvidenceRecord[]>
  listEvaluations: (
    artifactId: string,
    tenantId?: string,
  ) => Promise<PolicyEvaluation[]>
  listActivity: (filter?: ActivityListFilter) => Promise<ActivityEventV2[]>
  /** Activity projection write — not a source ledger; outbox-coherent */
  appendActivity: (event: ActivityEventV2) => Promise<void>
  /** Append-only evidence; id conflict is a no-op; outbox-coherent */
  appendEvidence: (record: EvidenceRecord) => Promise<void>
  /** Replay protection for operator ingest */
  consumeNonce: (
    operatorId: string,
    nonce: string,
    maxAgeMs?: number,
  ) => Promise<boolean>
}
