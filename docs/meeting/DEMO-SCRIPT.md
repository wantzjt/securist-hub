# 5-minute Securist demo script (intel firms)

**Goal:** Prove the decision object is real, honest, and different from a scanner.  
**Do not:** improvise enterprise multi-tenant claims or “npx install.”

**Prep (before the call):**

- [ ] Browser: [https://secur.ist/assess](https://secur.ist/assess)  
- [ ] Second tab: sample brief [art-scout-daemon](https://secur.ist/artifacts/art-scout-daemon)  
- [ ] Optional: signed RC unpacked in a clean dir (see §B) or monorepo Path A  
- [ ] Pick **one public GitHub repo** the firm knows (their OSS tool, a CTI collector, or a popular OSINT package)  
- [ ] Read [`NON-PROMISES.md`](./NON-PROMISES.md) once  

---

## Minute 0–1 · Frame (no slides required)

**Say:**

> Securist is a permission system for AI-accelerated software adoption.  
> It answers: what may enter production, on what evidence, and what forces us to reconsider when the artifact changes.  
> It is not a pentest and not a scanner feed.

**Show homepage** ([secur.ist](https://secur.ist)):

- Hero: *Permission for code and models*  
- Ladder: Public assess (Live) → Local Operator → Team Graph (Coming next)

**Say:**

> Everything we claim is on that ladder. Team Graph is not live yet — we will not fake shared durable decisions.

---

## Minute 1–3 · Public Decision Brief (must work)

1. Open `/assess`.  
2. Paste the **public** `github.com/owner/repo` URL.  
3. Intended use example:

   > Controlled research evaluation of public CTI discovery tooling in a lab environment  

4. Environment: research · Boundary: local_only or non_prod (as fits).  
5. Submit. Wait for Brief.

**Narrate the Brief fields (point, don’t invent findings):**

| Field | What to say |
|-------|-------------|
| Observed | Public facts only — provenance, license signals, release/commit where available |
| Scope | *Their* intended use — permission is use-bound |
| Unknowns / gaps | Explicit — e.g. security, model governance — not fake CVEs |
| Status | Not a production approval |

**Say:**

> Share-safe and ephemeral. No account. No private code. If GitHub is rate-limited, we fail honest — we do not attach privileged tokens to public assess.

**If assess fails (rate limit / timeout):**

- Switch to sample artifact profile (seed labeled).  
- Say: *Public path is honesty-first; Operator path is for private work.*  
- Do **not** apologize into over-claiming.

---

## Minute 3–4 · Local Operator (private path)

**Path A — monorepo (always available):**

```bash
git clone https://github.com/wantzjt/securist-hub.git
cd securist-hub && npm ci
npm run operator:build
npm run securist -- doctor
# unsigned monorepo: runtime_unavailable is correct honesty
```

**Path B — signed RC (preferred if you have the tarball):**

```bash
tar -xzf securist-operator-0.1.0-rc.tgz
cd securist-operator-0.1.0-rc
export SECURIST_HOME="$(pwd)/.securist-home" && mkdir -p "$SECURIST_HOME"
node bin/securist.mjs doctor
# expect: Runtime verified · synthesis unavailable
node bin/securist.mjs assess /path/to/repo --intended-use "Local engineering review"
```

**Say:**

> Private code stays on the machine. Local Decision Briefs are never automatically shareable.  
> Public npm install is not available — signed release candidates only, by design.  
> TARX is behind the curtain for local execution; Securist is the product name.

---

## Minute 4–5 · Paid future + design-partner ask

**Show** `/team` (Coming next) or ladder card only.

**Say:**

> Paid value is Team Graph: shared decision, owner, policy, evidence, and forced re-review when manifests or digests change.  
> Free path is individual and private. We charge when we become shared memory and control plane.

**Close questions (pick 2):**

1. Where do last three tooling adoptions live today — wiki, ticket, tribal knowledge?  
2. When a dependency or model digest changes, who notices and what happens to the old approval?  
3. Would you pilot 10–50 governed artifacts if shared re-review existed?

**Exit line:**

> Next step is a design-partner conversation, not a procurement theater. Repo and contracts are public.

---

## Demo failure playbook

| Failure | Move |
|---------|------|
| GitHub rate limit on assess | Sample profile + Operator path |
| Wi-Fi dies | Offline RC doctor + assess on local clone |
| Someone asks “replace Snyk?” | No — different job: permission under drift |
| Someone asks SOC2 / SSO today | Enterprise path post–Team Graph; not day-one pilot |
| Someone asks to “just npx it” | Not published; monorepo or signed RC only |

---

## Optional 10-minute extension

- Walk Decision Graph language: `not_reviewed` → review → material change → `review_required`  
- Show `docs/BUYER-MESSAGING.md` / open-build README honesty  
- Do **not** open Postgres, Eve, or daemon product flags  

Related: [`INTEL-ONE-PAGER.md`](./INTEL-ONE-PAGER.md) · [`PRE-MEETING-CHECKLIST.md`](./PRE-MEETING-CHECKLIST.md)
