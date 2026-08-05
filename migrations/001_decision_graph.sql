-- Securist Decision Graph — Postgres-compatible schema
-- Tenant-scoped. Evidence append-only (no UPDATE of assertion rows in app layer).

CREATE TABLE IF NOT EXISTS tenants (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifacts (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  purpose TEXT NOT NULL,
  recommended_boundary TEXT NOT NULL,
  domains JSONB NOT NULL DEFAULT '[]',
  canonical_url TEXT NOT NULL,
  provider TEXT NOT NULL,
  status TEXT NOT NULL,
  review_owner TEXT NOT NULL,
  next_review_at TIMESTAMPTZ,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS artifacts_tenant_idx ON artifacts(tenant_id);
CREATE INDEX IF NOT EXISTS artifacts_status_idx ON artifacts(tenant_id, status);

CREATE TABLE IF NOT EXISTS artifact_versions (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  version_label TEXT NOT NULL,
  commit_or_digest TEXT,
  released_at TIMESTAMPTZ,
  observed_at TIMESTAMPTZ,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS artifact_sources (
  id TEXT PRIMARY KEY,
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  source_type TEXT NOT NULL,
  url TEXT NOT NULL,
  last_snapshot_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS evidence_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  version_id TEXT,
  domain TEXT NOT NULL,
  assertion TEXT NOT NULL,
  source TEXT NOT NULL,
  observed_at TIMESTAMPTZ NOT NULL,
  verification TEXT NOT NULL,
  content_hash TEXT NOT NULL,
  framework_hint TEXT,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS evidence_artifact_idx ON evidence_records(artifact_id, observed_at DESC);

CREATE TABLE IF NOT EXISTS policies (
  id TEXT NOT NULL,
  version TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id, version)
);

CREATE TABLE IF NOT EXISTS policy_evaluations (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  policy_id TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  environment TEXT NOT NULL,
  data_classification TEXT NOT NULL,
  deployment_boundary TEXT NOT NULL,
  intended_use TEXT NOT NULL,
  verdict TEXT NOT NULL,
  explanation TEXT NOT NULL,
  failing_checks JSONB NOT NULL DEFAULT '[]',
  required_mitigation JSONB NOT NULL DEFAULT '[]',
  evidence_ids JSONB NOT NULL DEFAULT '[]',
  re_review_triggers JSONB NOT NULL DEFAULT '[]',
  evaluated_at TIMESTAMPTZ NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS decisions (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  artifact_version_id TEXT,
  status TEXT NOT NULL,
  summary TEXT NOT NULL,
  risk_plain TEXT NOT NULL,
  action_plain TEXT NOT NULL,
  evaluation_id TEXT,
  evidence_ids JSONB NOT NULL DEFAULT '[]',
  policy_id TEXT,
  policy_version TEXT,
  scope JSONB,
  decided_at TIMESTAMPTZ NOT NULL,
  decided_by TEXT NOT NULL,
  expires_at TIMESTAMPTZ,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS outbox_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  artifact_id TEXT,
  event_type TEXT NOT NULL,
  actor_type TEXT NOT NULL,
  payload_fingerprint TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  projected BOOLEAN NOT NULL DEFAULT FALSE,
  dead_letter BOOLEAN NOT NULL DEFAULT FALSE,
  error_code TEXT
);

CREATE TABLE IF NOT EXISTS validation_runs (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  operator_id TEXT NOT NULL,
  runtime TEXT NOT NULL,
  tool_versions JSONB NOT NULL DEFAULT '{}',
  artifact_digest TEXT,
  result_summary TEXT NOT NULL,
  data_classification TEXT NOT NULL,
  boundary TEXT NOT NULL,
  ran_at TIMESTAMPTZ NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS contribution_records (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  kind TEXT NOT NULL,
  url TEXT,
  summary TEXT NOT NULL,
  compatibility TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS change_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  artifact_id TEXT NOT NULL REFERENCES artifacts(id),
  change_type TEXT NOT NULL,
  what_happened TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  securist_action TEXT NOT NULL,
  verification TEXT NOT NULL,
  visibility TEXT NOT NULL,
  before_fingerprint TEXT,
  after_fingerprint TEXT,
  materiality TEXT,
  re_review_trigger BOOLEAN NOT NULL DEFAULT FALSE,
  occurred_at TIMESTAMPTZ NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS operator_agents (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  label TEXT NOT NULL,
  public_only BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS operator_ingest_nonces (
  operator_id TEXT NOT NULL,
  nonce TEXT NOT NULL,
  consumed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (operator_id, nonce)
);

CREATE TABLE IF NOT EXISTS activity_events (
  id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenants(id),
  source TEXT NOT NULL,
  verification TEXT NOT NULL,
  artifact_id TEXT,
  what_happened TEXT NOT NULL,
  why_it_matters TEXT NOT NULL,
  securist_action TEXT NOT NULL,
  visibility TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  is_seed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS activity_tenant_time_idx ON activity_events(tenant_id, occurred_at DESC);
