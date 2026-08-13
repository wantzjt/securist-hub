/**
 * North-star re-review loop (WO-033).
 *
 * Fail-closed unless SECURIST_GRAPH_STORE=postgres.
 * Does not flip Team Graph product surface live.
 */
import { DecisionGraphConfigError, resolveDecisionGraphConfig } from './config'
import { contentHash } from './hash'
import { insertOutboxRow } from './postgres-outbox'
import { createPostgresStore } from './postgres-store'
import { applyMaterialTrigger } from './state-machine'
import type { SqlClient, SqlTxClient } from './sql'
import type { Decision } from './types'
import type {
  MaterialChangeInputV1,
  ReReviewLoopFailClosedV1,
  ReReviewLoopResultV1,
} from '../../../packages/contracts/src/re-review-loop'
import { reReviewFailClosed } from '../../../packages/contracts/src/re-review-loop'

export type ReReviewLoopDeps = {
  env?: NodeJS.ProcessEnv
  client?: SqlTxClient
}

function closed(
  error: ReReviewLoopFailClosedV1['error'],
  message?: string,
): ReReviewLoopFailClosedV1 {
  return reReviewFailClosed(error, message)
}

export async function requestReReviewOnMaterialChange(
  input: MaterialChangeInputV1,
  deps: ReReviewLoopDeps = {},
): Promise<ReReviewLoopResultV1> {
  const env = deps.env ?? process.env

  if (!String(input.tenantId || '').trim()) {
    return closed('tenant_required', 'tenantId required before persist')
  }

  let mode = 'memory'
  try {
    mode = resolveDecisionGraphConfig(env).mode
  } catch (err) {
    if (err instanceof DecisionGraphConfigError) {
      if (
        err.code === 'missing_database_url' ||
        err.code === 'missing_default_tenant_id' ||
        err.code === 'invalid_store_mode'
      ) {
        return closed(err.code)
      }
      return closed('graph_store_not_postgres', err.message)
    }
    throw err
  }

  if (mode !== 'postgres') {
    return closed('graph_store_not_postgres')
  }
  if (!deps.client) {
    return closed('missing_postgres_client')
  }

  return persistReReview(input, deps.client)
}

async function persistReReview(
  input: MaterialChangeInputV1,
  client: SqlTxClient,
): Promise<ReReviewLoopResultV1> {
  const store = createPostgresStore({
    client,
    defaultTenantId: input.tenantId,
  })
  const artifact = await store.getArtifact(input.artifactId, input.tenantId)
  if (!artifact) {
    return closed('artifact_not_found')
  }

  const snap = await store.getSnapshot(input.tenantId)
  const evidence = snap.evidence.filter((e) => e.artifactId === artifact.id)
  const decisions = snap.decisions
    .filter((d) => d.artifactId === artifact.id)
    .sort((a, b) => b.decidedAt.localeCompare(a.decidedAt))
  const latest = decisions.at(0)
  const priorStatus = latest ? latest.status : artifact.status
  const trigger = applyMaterialTrigger(priorStatus)
  if (!trigger.ok) {
    return closed('transition_denied', trigger.error)
  }

  const policyId = latest && latest.policyId ? latest.policyId : 'unbound'
  const policyVersion =
    latest && latest.policyVersion ? latest.policyVersion : 'unbound'
  const policyRow = snap.policies.find(
    (p) => p.id === policyId && p.version === policyVersion,
  )
  const policyName = policyRow?.name || policyId
  const now = input.occurredAt || new Date().toISOString()
  const seed = input.artifactId + input.trigger + now + input.whatChanged
  const changeEventId = 'chg-rr-' + contentHash(seed).slice(0, 16)
  const activityId = 'act-rr-' + contentHash(seed + 'activity').slice(0, 16)
  const decisionId = latest
    ? latest.id
    : 'dec-rr-' + contentHash(seed + 'decision').slice(0, 16)
  const ownerId = artifact.reviewOwner

  await client.withTransaction(async (tx) => {
    await persistTx(tx, {
      input,
      artifactId: artifact.id,
      tenantId: input.tenantId,
      newStatus: trigger.to,
      changeEventId,
      activityId,
      decisionId,
      hasExistingDecision: Boolean(latest),
      now,
      ownerId,
      policyId,
      policyVersion,
    })
  })

  return {
    ok: true,
    live: false,
    storeMode: 'postgres',
    productSurface: 'not_live',
    permissionReopened: true,
    request: {
      contractVersion: '1',
      kind: 'north_star_re_review_request',
      workOrder: 'WO-033',
      live: false,
      storeMode: 'postgres',
      productSurface: 'not_live',
      artifactId: artifact.id,
      artifactVersionId:
        input.artifactVersionId ||
        (latest ? latest.artifactVersionId : undefined),
      trigger: input.trigger,
      reason: input.whatChanged,
      requestedBy: input.requestedBy,
    },
    audit: {
      contractVersion: '1',
      kind: 're_review_audit_trail',
      workOrder: 'WO-033',
      whatChanged: input.whatChanged,
      whyItMatters: input.whyItMatters,
      trigger: input.trigger,
      policyId,
      policyVersion,
      policyName,
      whoMustReApprove: {
        ownerId,
        displayName: ownerId,
        accountableHuman: true,
      },
      priorStatus,
      newStatus: 'review_required',
      changeEventId,
      decisionId,
      activityId,
      evidenceIds: evidence.map((e) => e.id),
    },
  }
}

type PersistArgs = {
  input: MaterialChangeInputV1
  artifactId: string
  tenantId: string
  newStatus: Decision['status']
  changeEventId: string
  activityId: string
  decisionId: string
  hasExistingDecision: boolean
  now: string
  ownerId: string
  policyId: string
  policyVersion: string
}

async function persistTx(tx: SqlClient, args: PersistArgs): Promise<void> {
  const { input, artifactId, tenantId, newStatus, now } = args

  await tx.query(
    `UPDATE artifacts SET status = $1, updated_at = $2 WHERE id = $3 AND tenant_id = $4`,
    [newStatus, now, artifactId, tenantId],
  )

  if (args.hasExistingDecision) {
    await tx.query(
      `UPDATE decisions SET status = $1 WHERE id = $2 AND tenant_id = $3 AND artifact_id = $4`,
      [newStatus, args.decisionId, tenantId, artifactId],
    )
  } else {
    await tx.query(
      `INSERT INTO decisions (
         id, tenant_id, artifact_id, artifact_version_id, status, summary,
         risk_plain, action_plain, evaluation_id, evidence_ids, policy_id,
         policy_version, scope, decided_at, decided_by, expires_at, is_seed
       ) VALUES (
         $1,$2,$3,$4,$5,$6,$7,$8,NULL,'[]',$9,$10,NULL,$11,$12,NULL,FALSE
       )
       ON CONFLICT (id) DO NOTHING`,
      [
        args.decisionId,
        tenantId,
        artifactId,
        input.artifactVersionId ?? null,
        newStatus,
        'Permission reopened after material change (WO-033).',
        'Prior permission is stale until a named human re-approves.',
        'Re-review required; do not inherit silently.',
        args.policyId,
        args.policyVersion,
        now,
        args.ownerId,
      ],
    )
  }

  await tx.query(
    `INSERT INTO change_events (
       id, tenant_id, artifact_id, change_type, what_happened, why_it_matters,
       securist_action, verification, visibility, before_fingerprint,
       after_fingerprint, materiality, re_review_trigger, occurred_at, is_seed
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,TRUE,$13,FALSE
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      args.changeEventId,
      tenantId,
      artifactId,
      input.trigger,
      input.whatChanged,
      input.whyItMatters,
      'Reopen permission; named owner must re-approve.',
      'observed',
      'organization',
      input.beforeFingerprint ?? null,
      input.afterFingerprint ?? null,
      input.trigger,
      now,
    ],
  )

  await tx.query(
    `INSERT INTO activity_events (
       id, tenant_id, source, verification, artifact_id,
       what_happened, why_it_matters, securist_action,
       visibility, occurred_at, is_seed
     ) VALUES (
       $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,FALSE
     )
     ON CONFLICT (id) DO NOTHING`,
    [
      args.activityId,
      tenantId,
      'change',
      'observed',
      artifactId,
      input.whatChanged,
      input.whyItMatters,
      'Reopen permission; named owner must re-approve.',
      'organization',
      now,
    ],
  )

  await insertOutboxRow(tx, {
    id: 'ob-rr-' + args.changeEventId,
    tenantId,
    artifactId,
    eventType: 're_review.requested',
    actorType: 'system',
    payloadFingerprint: contentHash(args.changeEventId + input.whatChanged),
    createdAt: now,
    projected: false,
  })
}
