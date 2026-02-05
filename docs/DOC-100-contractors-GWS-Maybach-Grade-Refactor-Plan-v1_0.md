# DOC-100 — contractors-GWS Maybach-Grade Refactor Plan (5–10 Phases)

**Status:** Canonical (Execution Plan)  
**Effective Date:** February 3, 2026  
**Version:** 1.0  
**Timestamp:** 20260203-1227 (CST)  
**Governing Documents:** DOC-000, DOC-010, DOC-020, DOC-030, DOC-040, DOC-050

---

## Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1227 | Initial release |

---

## Document Standards

This is a binding execution plan. All phases must comply with governing canon. If a phase conflicts with any DOC-000 through DOC-050, the phase must be revised before execution.

---

## 1. Executive Summary

### 1.1 What This Plan Achieves

This plan transforms contractors-GWS from a functional demonstration into a production-grade product suitable for commercial deployment to paying customers.

The transformation addresses:

- All audit findings (A1–A10) identified in the CTO audit
- Full compliance with canonical governance documents (DOC-000 through DOC-050)
- Elimination of demo-level behaviors, fake saves, and silent failures
- Establishment of a reproducible clone-based deployment model

### 1.2 What "Done" Means

The refactor is complete when:

- Every administrative action in the Back Office produces the effect it promises
- Every CRM operation persists data reliably and is auditable
- Configuration governs vocabulary and presentation only; code governs all logic
- Security boundaries are enforced consistently across all code paths
- The system can be cloned for a new customer with configuration-only changes
- No audit finding remains unresolved

### 1.3 Non-Negotiable Quality Gates

The following must be true before any phase is marked complete:

- Save operations that indicate success must persist data (verifiable by reload)
- No code path bypasses authentication for protected resources
- No configuration value alters system logic or decisions
- All state-changing CRM operations create Activity records
- All deployments at the same version behave identically given identical inputs

---

## 2. Refactor Strategy Principles

### 2.1 How We Avoid Demo Thinking

Demo thinking produces systems that appear to work. Production thinking produces systems that actually work.

Rules:

- A feature is not complete until it persists data correctly
- A UI control that does nothing must not exist
- A save that does not save is a critical defect, not a known limitation
- "It works in happy path" is not working
- Partial implementation must not be presented as complete functionality

### 2.2 How Canon Governs Engineering

Every engineering decision is evaluated against:

- **DOC-000:** Does this serve the product promise?
- **DOC-010:** Does this respect domain boundaries?
- **DOC-020:** Does this comply with the data model?
- **DOC-030:** Does this meet operational behavior requirements?
- **DOC-040:** Does this satisfy security requirements?
- **DOC-050:** Does this maintain the configuration/code boundary?

When engineering convenience conflicts with canon, canon wins. There are no exceptions.

### 2.3 How Clone-Based Deployments Stay Consistent

The clone-based delivery model requires:

- **Identical code:** All deployments at a given version run identical code
- **Configuration-only customization:** Customer differences exist only in configuration
- **No customer-specific logic:** No code branches based on deployment identity
- **Versioned releases:** Every clone tracks which canonical version it derives from
- **Centralized fixes:** Bugs are fixed in the canonical codebase, not per-deployment

A deployment that requires code changes to function for a specific customer indicates a governance violation.

---

## 3. Phase Plan

### Phase 1 — Foundation: Settings Infrastructure Repair

**Objective**

Establish a working CRM Settings infrastructure where configuration changes are saved, persisted, and applied reliably.

**Canonical Constraints**

- DOC-030: Save means persisted; reload must reflect saved state
- DOC-050: Configuration is data, not logic

**Scope**

- Implement complete API handler coverage for CRM Settings (all required HTTP methods)
- Correct update semantics so existing settings documents are properly updated
- Verify that save operations persist and reload operations retrieve
- Ensure configuration changes take effect immediately upon save

**Non-Scope**

- Dynamic configuration consumption by CRM entities (Phase 2)
- Security hardening (Phase 4)
- Rate limiting (Phase 5)

**Deliverables**

- Corrected Settings API with full CRUD support
- Verification test: save, reload, verify cycle passes
- Documentation of Settings API contract

**Verification / Acceptance Criteria**

- Administrator can modify any CRM Settings value
- Save operation completes without error
- Page reload displays the saved values
- No data loss or silent reversion occurs
- Verification performed on three separate occasions with different values

**Failure Modes to Watch**

- API returns success but does not persist (silent failure)
- Cache serves stale data after save
- Partial save where some fields persist and others do not

**Exit Gate**

Settings save, persist, and reload cycle works correctly 100% of the time across all Settings fields.

---

### Phase 2 — Configuration Consumption: Dynamic CRM Behavior

**Objective**

Make CRM entities (Leads, Deals, Engagements) consume configuration values dynamically instead of relying on hard-coded enums.

**Canonical Constraints**

- DOC-050: Configuration provides vocabulary; code provides logic
- DOC-020: Configuration influences operational data through defined relationships
- DOC-030: Configuration changes take effect immediately

**Scope**

- Replace hard-coded status/stage enums with dynamic configuration reads
- Ensure validation accepts any value defined in current configuration
- Ensure legacy values (values no longer in configuration) are preserved and displayed
- Update all dropdowns, filters, and displays to source from configuration

**Non-Scope**

- Changing what transitions are allowed (that remains in code)
- Adding new configuration categories
- UI redesign

**Deliverables**

- Refactored validation logic that reads from CRM Settings
- Refactored UI components that populate from CRM Settings
- Legacy value handling that preserves data integrity
- Test coverage for configuration-driven behavior

**Verification / Acceptance Criteria**

- Administrator can add a new pipeline stage in Settings
- New stage immediately appears in Lead status dropdown
- Existing Leads with old stages retain their values
- Validation accepts the new stage for new Leads
- No hard-coded enum prevents configuration from taking effect

**Failure Modes to Watch**

- Validation rejects values that exist in configuration
- Validation accepts values that do not exist in configuration
- Legacy values cause errors or are silently modified
- Configuration changes require restart or cache clear

**Exit Gate**

All CRM entity statuses/stages/types are driven by configuration, with no hard-coded enum blocking customization.

---

### Phase 3 — Operational Integrity: No Silent Failure

**Objective**

Ensure every Back Office and CRM operation either succeeds completely or fails explicitly with user feedback.

**Canonical Constraints**

- DOC-030: No silent failure; save means persisted; errors must be visible
- DOC-030: Every visible control must have a real effect

**Scope**

- Audit all save operations for actual persistence
- Audit all API endpoints for proper error responses
- Implement consistent error handling across all administrative operations
- Remove or disable non-functional UI controls
- Ensure all state-changing operations create Activity records

**Non-Scope**

- New feature development
- UI redesign beyond control removal
- Performance optimization

**Deliverables**

- Audit report of all save operations and their persistence status
- Corrected save operations that actually persist
- Consistent error response format across all APIs
- Activity logging for all CRM state changes
- Removal or correction of non-functional controls

**Verification / Acceptance Criteria**

- Every save operation either persists data or returns an error
- Every error is displayed to the administrator with actionable information
- Every CRM state change creates an Activity record
- No UI control exists that has no effect
- Reload after any save shows the saved data

**Failure Modes to Watch**

- Error caught in code but not surfaced to user
- Optimistic UI update that never reconciles with server
- Activity logging fails silently while operation succeeds
- Partial failure presented as complete success

**Exit Gate**

Zero silent failures exist in the Back Office and CRM. Every operation is honest about its outcome.

---

### Phase 4 — Security Hardening: Authentication and Headers

**Objective**

Establish production-grade security posture including consistent authentication enforcement, secure headers, and elimination of unsafe practices.

**Canonical Constraints**

- DOC-040: All protected resources require authentication; fail closed
- DOC-040: No security-through-obscurity; no temporary weakening
- DOC-040: Security checks must be consistent across all code paths

**Scope**

- Audit all protected endpoints for authentication enforcement
- Consolidate and correct security header configuration
- Remove unsafe-inline and unsafe-eval where possible; document exceptions
- Eliminate duplicated header logic between configuration sources
- Ensure authentication cannot be bypassed via any API or UI path

**Non-Scope**

- Role-based access control (out of scope per DOC-000)
- Third-party security integrations
- Penetration testing (separate engagement)

**Deliverables**

- Authentication audit report covering all protected endpoints
- Consolidated security header configuration
- Documentation of any remaining unsafe directives with justification
- Verification that no unauthenticated access to protected resources is possible

**Verification / Acceptance Criteria**

- Every protected endpoint returns 401/403 without valid authentication
- Security headers are applied consistently without duplication
- No endpoint exposes CRM data without authentication
- CSP violations are logged; no production code requires unsafe-eval for core functionality

**Failure Modes to Watch**

- New endpoint added without authentication check
- Header configuration conflicts between sources
- Client-side routing bypasses server authentication
- Development convenience weakens production security

**Exit Gate**

All protected resources are protected. Security headers are consolidated and correct. No authentication bypass exists.

---

### Phase 5 — Abuse Resistance: Production-Grade Rate Limiting

**Objective**

Implement reliable, consistent rate limiting for public endpoints that functions correctly in the deployment environment.

**Canonical Constraints**

- DOC-040: Rate limiting is a security requirement, not an optimization
- DOC-040: Abuse resistance is a trust requirement
- DOC-030: Automatic lead capture must not be abusable

**Scope**

- Replace in-memory rate limiting with persistent, deployment-appropriate mechanism
- Ensure rate limits persist across function invocations
- Implement consistent rate limit behavior for all public submission endpoints
- Provide clear feedback when rate limits are exceeded

**Non-Scope**

- DDoS protection (infrastructure concern)
- Bot detection beyond rate limiting
- CAPTCHA implementation (may be future enhancement)

**Deliverables**

- Persistent rate limiting implementation
- Rate limit configuration (requests per time window)
- Rate limit exceeded response format
- Verification that limits persist and reset correctly

**Verification / Acceptance Criteria**

- Submitting forms beyond the rate limit returns a rate limit error
- Rate limits persist across multiple serverless invocations
- Rate limits reset correctly after the time window
- Legitimate single submissions are never rate limited

**Failure Modes to Watch**

- Rate limit state lost between invocations
- Rate limit applied inconsistently
- Legitimate requests incorrectly limited
- Rate limit bypass via request manipulation

**Exit Gate**

Public endpoints are protected by reliable, persistent rate limiting that functions correctly under the deployment model.

---

### Phase 6 — Secrets and Deployment Hygiene

**Objective**

Establish secure secrets management practices and clean deployment artifacts that contain no sensitive material.

**Canonical Constraints**

- DOC-040: Secrets must never be committed, logged, or exposed
- DOC-040: Convenience never overrides secrecy
- DOC-050: Configuration and secrets are distinct

**Scope**

- Audit all repositories and artifacts for exposed secrets
- Establish secrets management process (environment-based, not file-based)
- Document secret rotation procedures
- Create deployment checklist that verifies no secrets in artifacts
- Remove any secrets from version control history if present

**Non-Scope**

- Specific secrets management tooling selection
- Automated rotation implementation
- Infrastructure provisioning

**Deliverables**

- Secrets audit report
- Secrets management process documentation
- Deployment checklist including secrets verification
- Clean repository with no secrets in current or historical commits

**Verification / Acceptance Criteria**

- Repository scan finds no secrets in any commit
- Deployment artifacts contain no secrets
- Secrets are injected at runtime from secure source
- Documentation exists for rotating each secret type

**Failure Modes to Watch**

- Secrets removed from current commit but remain in history
- New secrets added without following process
- Deployment fails due to missing secrets (indicates dependency)
- Logging accidentally captures secrets

**Exit Gate**

No secrets exist in version control or deployment artifacts. Process exists and is documented for secure secrets management.

---

### Phase 7 — Admin Access Model: Clone-Ready Authentication

**Objective**

Replace hard-coded admin allowlists with a configuration-driven authentication model suitable for clone-based deployment.

**Canonical Constraints**

- DOC-040: Authentication is required; no bypass
- DOC-050: Configuration does not control authorization logic
- DOC-000: Single admin model; no role hierarchy

**Scope**

- Move admin identity configuration from code to deployment configuration
- Ensure authentication process reads from deployment-specific configuration
- Document the admin provisioning process for new clones
- Verify that changing admin configuration does not require code changes

**Non-Scope**

- Multi-user role systems
- Self-service admin registration
- Admin management UI

**Deliverables**

- Configuration-driven admin authentication
- Documentation for provisioning admin access per deployment
- Verification that admin changes require only configuration
- Clone deployment checklist including admin provisioning

**Verification / Acceptance Criteria**

- New deployment can be configured with different admin identity
- No code change required to change admin access
- Authentication still enforced consistently
- Invalid admin configuration results in explicit failure, not degraded access

**Failure Modes to Watch**

- Fallback to hard-coded admin if configuration missing
- Configuration exposure through public endpoints
- Admin identity configuration shared across deployments
- Code drift where some deployments have different auth logic

**Exit Gate**

Admin authentication is fully configuration-driven with no hard-coded identities. Clone deployments can be provisioned without code changes.

---

### Phase 8 — Clone Deployment Model: Version Tracking and Consistency

**Objective**

Establish the canonical clone deployment process with version tracking, consistency verification, and customization boundaries.

**Canonical Constraints**

- DOC-050: All deployments at same version behave identically
- DOC-050: Customer differences exist only in configuration
- DOC-000: Clone → adapt → deploy model

**Scope**

- Define canonical release versioning scheme
- Create clone deployment checklist
- Implement version identification in deployed instances
- Define customization boundaries (what may change per clone)
- Create consistency verification process

**Non-Scope**

- Automated deployment tooling
- Customer self-service deployment
- Multi-region deployment

**Deliverables**

- Version identification mechanism (deployed instances report their version)
- Clone deployment checklist
- Customization boundary documentation
- Consistency verification checklist

**Verification / Acceptance Criteria**

- Deployed instance reports its canonical version
- Clone can be created with only configuration changes
- Two clones at same version behave identically given identical inputs
- Customization beyond defined boundaries requires explicit versioning

**Failure Modes to Watch**

- Version number not updated on release
- Customer-specific changes made to canonical codebase
- Configuration changes that affect behavior (DOC-050 violation)
- Clone deployed from wrong base version

**Exit Gate**

Clone deployment process is documented, versioned, and produces consistent, traceable deployments.

---

## 4. Audit Findings Coverage Matrix

| Finding | Description | Phase(s) | Remediation Summary | Verification Criterion |
|---------|-------------|----------|---------------------|----------------------|
| A1 | CRM Settings save broken (UI PUT, server no PUT) | Phase 1 | Implement complete API handler coverage | Save → reload → verify cycle passes |
| A2 | Settings update semantics (create-if-not-exists) | Phase 1 | Correct update logic to modify existing documents | Existing settings modified, not duplicated |
| A3 | Hard-coded enums violate configurable CRM | Phase 2 | Replace enums with dynamic configuration reads | New config values immediately usable |
| A4 | Tenant/deployment isolation must be explicit | Phase 8 | Define clone model with isolation guarantees | Two clones share no state |
| A5 | Rate limiting demo-grade (in-memory) | Phase 5 | Implement persistent rate limiting | Limits persist across invocations |
| A6 | Secrets hygiene unsafe | Phase 6 | Establish secrets management process | No secrets in repo/artifacts |
| A7 | Allowlist hard-coded | Phase 7 | Configuration-driven admin authentication | Admin change requires no code change |
| A8 | CSP/headers not Maybach | Phase 4 | Consolidate and harden security headers | Headers consistent, unsafe minimized |
| A9 | No silent failure not enforced | Phase 3 | Audit and correct all save operations | Zero silent failures |
| A10 | Config vs Code boundary not enforced | Phase 2, 8 | Dynamic config consumption; clone consistency | Config changes do not alter logic |

---

## 5. Claude Code Onboarding & Execution Protocol (Binding)

### 5.1 Mandatory Canon Reading

Before any code changes, Claude Code must:

1. Read all documents in /docs or /mnt/project (DOC-000 through DOC-050)
2. Acknowledge understanding of each document's constraints
3. Identify which DOCs are relevant to the current task
4. State explicitly how the planned change complies with each relevant DOC

No code change may proceed until this reading is complete and acknowledged.

### 5.2 Task Scoping Rules

Each task must be:

- Scoped to a single concern within a single phase
- Small enough to verify completely
- Explicitly bounded (what is in scope, what is not)
- Traceable to a specific audit finding or canon requirement

Prohibited:

- Multi-phase changes in a single task
- Speculative improvements not tied to audit findings
- Rewrites of modules without first reading existing implementation
- "While I'm here" scope expansion

### 5.3 Evidence Requirements Per Phase

For each phase completion, Claude Code must provide:

- List of files changed with summary of changes
- Verification steps performed
- Canon compliance statement for each relevant DOC
- Explicit confirmation that exit gate criteria are met

### 5.4 No Speculative Changes

Claude Code must not:

- Rewrite code without reading and understanding existing code
- Introduce architectural changes not required by audit findings
- Add features not specified in this plan
- "Improve" code in ways not tied to canon compliance

Every change must be justified by reference to an audit finding or canon requirement.

### 5.5 Preventing Code Drift Across Clones

To maintain clone consistency:

- All changes target the canonical codebase only
- No customer-specific code paths may be introduced
- Configuration-driven behavior must be tested with multiple configurations
- Version identification must be updated with each release

---

## 6. Release & Deployment Model for White-Label Clones

### 6.1 What Must Remain Identical

Across all clones at the same version:

- All code (application logic, API handlers, validation, security)
- All schemas (data model definitions)
- All UI components and behavior
- All error handling and feedback
- All audit logging behavior

### 6.2 What May Be Customized

Per clone, via configuration only:

- Business identity (name, logo, contact information)
- Branding (colors, visual identity within supported themes)
- CRM configuration (pipeline stages, service types, labels)
- Website content (services, projects, testimonials)
- Admin identity (who is authorized to access)

### 6.3 Version and Timestamp Tracking

Every canonical release must:

- Have a unique version identifier (semantic versioning recommended)
- Include a release timestamp
- Be tagged in version control

Every deployed clone must:

- Report its canonical version through a defined mechanism
- Track when it was deployed
- Track when it was last updated

### 6.4 Preventing Customer-Specific Logic

Rules:

- No code may check deployment identity to branch behavior
- No configuration value may trigger special code paths
- No "just for this customer" changes to the canonical codebase
- If a customer needs different behavior, it is a product requirement for all customers

Violations indicate:

- A governance defect (DOC-050)
- A product scope decision needed (DOC-000)
- An architectural boundary violation (DOC-010)

---

## 7. Definition of Done (Maybach)

The refactor is complete when all of the following are true:

### 7.1 Audit Findings Resolved

- [ ] A1: CRM Settings save works correctly (PUT implemented, update semantics correct)
- [ ] A2: Settings update modifies existing documents, not create-only
- [ ] A3: All CRM statuses/stages are configuration-driven, no hard-coded enums
- [ ] A4: Clone deployment model is documented and enforces isolation
- [ ] A5: Rate limiting persists correctly in deployment environment
- [ ] A6: No secrets in repository or deployment artifacts
- [ ] A7: Admin authentication is configuration-driven, no hard-coded allowlist
- [ ] A8: Security headers consolidated and hardened
- [ ] A9: Zero silent failures in Back Office and CRM
- [ ] A10: Configuration/code boundary enforced in implementation and clone process

### 7.2 Canon Compliance Verified

- [ ] DOC-000: Product delivers website, back office, and CRM as integrated whole
- [ ] DOC-010: Domain boundaries respected; no cross-domain authority violations
- [ ] DOC-020: Data model invariants enforced; no data loss possible
- [ ] DOC-030: Every save persists; every error surfaces; every action audits
- [ ] DOC-040: Every protected resource authenticated; security headers correct
- [ ] DOC-050: Configuration provides vocabulary; code provides logic; no mixing

### 7.3 Clone Readiness Verified

- [ ] New clone can be deployed with configuration-only changes
- [ ] Clone deployment checklist exists and is complete
- [ ] Version tracking is implemented and accurate
- [ ] Two clones at same version behave identically

### 7.4 Operational Readiness

- [ ] Administrator can complete full CRM workflow (lead → client → engagement)
- [ ] All data persists correctly across sessions
- [ ] All errors provide actionable feedback
- [ ] System is documented sufficiently for customer onboarding

---

*End of document.*
