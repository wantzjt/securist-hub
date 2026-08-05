/**
 * Operator daemon ingest — share-safe metadata only.
 * Fail-open for local work is a client concern; hub validates before mutating graph.
 */
import { contentHash } from './hash'
import { getDecisionGraphStore } from './store'
import type { ActivityEventV2, VerificationState } from './types'

export type DaemonIngestPayload = {
  operatorId: string
  tenantId: string
  nonce: string
  timestamp: string
  /** Optional shared secret for development only */
  secret?: string
  event: {
    artifactId?: string
    whatHappened: string
    whyItMatters: string
    securistAction: string
    source?: string
    /** Must never include private paths/secrets — hub trusts operator minimization */
    verification?: VerificationState
  }
}

export type IngestResult =
  | { ok: true; eventId: string }
  | { ok: false; error: string; code: string }

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export function ingestDaemonEvent(payload: DaemonIngestPayload): IngestResult {
  const store = getDecisionGraphStore()
  const maxSkewMs = 10 * 60 * 1000
  const ts = Date.parse(payload.timestamp)
  if (Number.isNaN(ts)) {
    return { ok: false, code: 'bad_timestamp', error: 'Invalid timestamp' }
  }
  if (Math.abs(Date.now() - ts) > maxSkewMs) {
    return {
      ok: false,
      code: 'timestamp_skew',
      error: 'Timestamp outside allowed window',
    }
  }

  const devSecret = process.env.SECURIST_DAEMON_SECRET
  if (devSecret) {
    if (!payload.secret || !timingSafeEqual(payload.secret, devSecret)) {
      return {
        ok: false,
        code: 'auth_failed',
        error: 'Daemon secret rejected',
      }
    }
  }

  if (!payload.operatorId || !payload.nonce) {
    return { ok: false, code: 'missing_fields', error: 'operatorId and nonce required' }
  }

  if (!store.consumeNonce(payload.operatorId, payload.nonce)) {
    return {
      ok: false,
      code: 'nonce_replay',
      error: 'Duplicate nonce rejected',
    }
  }

  const e = payload.event
  if (!e?.whatHappened || !e.whyItMatters || !e.securistAction) {
    return {
      ok: false,
      code: 'schema',
      error: 'Event requires whatHappened, whyItMatters, securistAction',
    }
  }

  // Redaction guard: reject obvious private paths / secrets
  const blob = JSON.stringify(e)
  if (
    /-----BEGIN |api[_-]?key|password=|ghp_[A-Za-z0-9]|\/Users\/|C:\\\\/i.test(
      blob,
    )
  ) {
    return {
      ok: false,
      code: 'redaction',
      error: 'Payload appears to contain private material; minimize and retry',
    }
  }

  const eventId = `ing-${contentHash(payload.operatorId + payload.nonce + payload.timestamp)}`
  const activity: ActivityEventV2 = {
    id: eventId,
    tenantId: payload.tenantId || 'public-demo',
    source: e.source || 'operator',
    verification: e.verification || 'observed',
    artifactId: e.artifactId,
    whatHappened: e.whatHappened.slice(0, 500),
    whyItMatters: e.whyItMatters.slice(0, 500),
    securistAction: e.securistAction.slice(0, 500),
    visibility: 'organization',
    occurredAt: payload.timestamp,
    isSeed: false,
  }

  // organization-visible only by default — never force public
  store.appendActivity(activity)

  return { ok: true, eventId }
}
