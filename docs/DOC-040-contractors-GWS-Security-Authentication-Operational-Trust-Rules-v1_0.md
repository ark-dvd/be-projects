# DOC-040 — contractors-GWS Security, Authentication & Operational Trust Rules

**Status:** Canonical  
**Effective Date:** February 3, 2026  
**Version:** 1.0  
**Timestamp:** 20260203-1217 (CST)  
**Governing Documents:** DOC-000 — contractors-GWS System Charter & Product Promise, DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries, DOC-020 — contractors-GWS Canonical Data Model, DOC-030 — contractors-GWS Back Office & CRM Operational Principles

---

## Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1217 | Initial release |

---

## Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

This document defines non-negotiable security, authentication, and trust guarantees for all deployments of contractors-GWS. All implementation decisions regarding security must conform to this specification.

---

## 1. Security Philosophy

### 1.1 Trust Is Earned, Not Assumed

No request, session, or identity is trusted by default. Every access to protected resources must be explicitly verified against established credentials. The absence of a denial is not equivalent to a grant.

The system assumes:

- Every request may be hostile until authenticated
- Every authenticated session may be compromised until verified
- Every action may be unauthorized until confirmed

### 1.2 Fail Closed, Not Open

When security verification fails, cannot be completed, or produces ambiguous results, access is denied. The system does not proceed with partial information, assumed defaults, or optimistic grants.

This means:

- Authentication failure results in access denial, not degraded access
- Authorization uncertainty results in denial, not permissive fallback
- System errors during security checks result in denial, not bypass

### 1.3 Explicit Authorization Over Implicit Access

Access is granted because a specific rule permits it, not because no rule prohibits it. The default state for any protected resource is inaccessible.

Every protected operation requires:

- Verified identity
- Explicit permission for that operation
- Confirmation that conditions for access are satisfied

### 1.4 No Security-Through-Obscurity

Security does not depend on:

- Undocumented endpoints remaining undiscovered
- Internal URLs being difficult to guess
- Attackers not knowing system architecture
- Implementation details remaining secret

Security depends on proper authentication, authorization, and enforcement. An attacker who knows everything about the system's structure must still be unable to access protected resources without valid credentials.

---

## 2. Authentication Rules

### 2.1 Administrator Authentication

Access to the Back Office and CRM requires authentication. There is no anonymous administrative access. There is no guest mode. There is no read-only unauthenticated view.

Authentication requires:

- Verified identity through established credentials
- Valid, unexpired session
- Request origin consistent with session establishment

Authentication is binary: a request is authenticated or it is not. There is no partial authentication.

### 2.2 Session Validity and Expiration

Authenticated sessions have defined lifetimes. Sessions do not persist indefinitely.

Session rules:

- Sessions expire after a defined period of inactivity
- Sessions expire after a defined maximum duration regardless of activity
- Session expiration requires re-authentication
- Session invalidation is immediate upon logout
- Session credentials must not be predictable or reusable after invalidation

### 2.3 What Constitutes an Authenticated Request

A request is authenticated when:

- It includes valid session credentials
- Those credentials correspond to a verified identity
- The session has not expired
- The session has not been invalidated

A request is not authenticated when any of these conditions fail. Partial satisfaction is not authentication.

### 2.4 What Must Never Be Accessible Without Authentication

The following require authentication without exception:

- All Back Office interfaces
- All CRM data (Leads, Clients, Engagements, Activities)
- All configuration screens and settings
- All content management functions
- All media management functions
- All administrative APIs
- Any endpoint that reads, writes, or modifies protected data

There are no exceptions for convenience, testing, or internal use.

### 2.5 Authentication Boundary

Authentication protects the administrative boundary. It does not apply to:

- Public website pages
- Public content served to visitors
- Public lead submission endpoints (which have their own protections)

These public surfaces are explicitly unauthenticated by design and are isolated from administrative functions.

---

## 3. Authorization and Access Boundaries

### 3.1 What an Authenticated Administrator May Access

An authenticated administrator may:

- View all CRM data within their deployment
- Create, modify, and manage Leads, Clients, and Engagements
- View and manage Content and Media
- Modify Configuration settings
- Perform all administrative functions defined in DOC-030

Access is scoped to the deployment. An administrator authenticated to one deployment has no access to any other deployment.

### 3.2 What Authenticated Status Does Not Imply

Authentication does not grant:

- Access to other deployments
- Access to system internals beyond administrative functions
- Ability to modify security rules or authentication mechanisms
- Access to secrets, credentials, or infrastructure configuration
- Ability to bypass audit logging
- Ability to perform operations that violate data model invariants

Authentication establishes identity. Authorization determines what that identity may do. These are distinct.

### 3.3 Boundaries Between Read, Write, and Destructive Actions

Not all operations are equivalent. The system distinguishes:

**Read operations:** Viewing data without modification.

**Write operations:** Creating or modifying data that can be changed again.

**Destructive operations:** Actions that are irreversible or remove data from normal accessibility.

Destructive operations require explicit confirmation. The system does not perform destructive operations through ambiguous gestures or as side effects of other actions.

### 3.4 Why Single Admin Does Not Mean No Authorization Rules

contractors-GWS assumes a single administrator or small team with equivalent access per DOC-000. This does not mean authorization is unnecessary.

Authorization rules remain essential because:

- They define the boundary between public and private
- They protect against compromised sessions
- They ensure audit trails capture authorized actions only
- They prevent accidental operations through ambiguous interfaces
- They establish what the system promises to its users

A system with one user still has attackers, still has accidents, and still requires trust guarantees.

---

## 4. Public Surface Area Rules

### 4.1 Public Website Pages

Public website pages present content to visitors without authentication. This is intentional and correct.

Public pages:

- Display content from the Content & Media Domain
- Do not expose CRM data
- Do not expose configuration internals
- Do not expose administrative functions
- Do not reveal whether an administrator is logged in
- Do not expose session information

Public pages are read-only from the visitor's perspective. They cannot modify system state except through explicitly designed submission endpoints.

### 4.2 Public Lead Submission Endpoints

The public contact form creates Leads automatically. This is a designed public write operation with strict boundaries.

What public submission may do:

- Create a new Lead with submitted data
- Trigger Activity logging for the created Lead
- Return confirmation of successful submission

What public submission must never do:

- Read existing Leads, Clients, or Engagements
- Modify existing CRM records
- Access configuration or settings
- Enumerate existing data
- Reveal internal identifiers
- Expose error details that reveal system internals
- Accept or process data beyond defined form fields

### 4.3 Rate Limiting Expectations

Public submission endpoints must be rate limited. Rate limiting is a security requirement, not an optimization.

Rate limiting must:

- Prevent automated bulk submissions
- Protect against denial-of-service through resource exhaustion
- Limit the impact of abuse
- Operate consistently and predictably
- Apply to all requests regardless of apparent legitimacy

Rate limiting that can be trivially bypassed, that resets unpredictably, or that does not persist across requests is not rate limiting.

### 4.4 Abuse Resistance as a Trust Requirement

The system must resist abuse of public endpoints. Abuse resistance means:

- Malicious actors cannot flood the CRM with garbage leads
- Automated attacks cannot exhaust system resources
- Repeated submissions cannot corrupt or overwrite data
- Invalid input cannot cause system instability

Abuse resistance is not optional. A system that can be trivially abused cannot be trusted.

### 4.5 Visibility Guarantees for Automatically Created Data

Leads created through public submission must be immediately visible to authenticated administrators. There is no quarantine, approval queue, or hidden state that prevents administrators from seeing submitted data.

Automatic creation is visible creation. If a Lead exists, the administrator can see it.

---

## 5. Data Protection and Integrity

### 5.1 Data Isolation Per Deployment

Each contractors-GWS deployment is isolated. Isolation means:

- No data is shared between deployments
- No query can return data from another deployment
- No action can modify data in another deployment
- No identifier has meaning across deployments
- No session grants access to multiple deployments

Isolation is enforced by deployment separation, not by runtime access control. Each deployment is a complete, independent system.

### 5.2 Protection Against Accidental Cross-Deployment Access

The system architecture must make cross-deployment access impossible, not merely unauthorized.

This requires:

- No shared data storage that spans deployments
- No shared credentials that authenticate to multiple deployments
- No administrative interfaces that aggregate across deployments
- No reporting or analytics that combine deployment data

Accidental cross-deployment access is a critical defect. The architecture must prevent it structurally.

### 5.3 Protection Against Partial Writes and Corruption

Data operations must be atomic. A write operation either completes fully or fails completely.

Partial write protection means:

- No half-created records visible to users
- No partial updates that leave data inconsistent
- No operations that succeed in some subsystems and fail in others without visibility
- No corruption caused by interrupted operations

If an operation cannot complete atomically, it must fail and communicate the failure.

### 5.4 Preservation of Audit History

Audit history (Activities) must be preserved and protected:

- Activities cannot be modified after creation
- Activities cannot be deleted
- Activities cannot be created with false timestamps
- Activities cannot be bypassed for logged operations

Compromise of the audit history is a security breach. It destroys the ability to understand what happened and who did it.

### 5.5 What Constitutes a Data Integrity Breach

A data integrity breach occurs when:

- Data is visible to unauthorized parties
- Data is modified without authorization
- Data is destroyed without authorization
- Data becomes inconsistent or corrupted
- Audit history is modified, deleted, or falsified
- Cross-deployment data access occurs
- Referential integrity is violated

Any of these conditions indicates a security defect requiring immediate correction.

---

## 6. Secrets and Configuration Security

### 6.1 How Secrets Are Treated

Secrets are credentials, keys, and tokens that grant access to protected resources. Secrets are:

- Confidential by nature
- Never displayed in interfaces
- Never included in logs
- Never committed to version control
- Never transmitted except to authorized recipients
- Never stored in plain text where unauthorized access is possible

Secrets are not configuration. Secrets require protection beyond what normal configuration receives.

### 6.2 What Must Never Be Committed, Logged, or Exposed

The following must never appear in:

- Source code repositories
- Application logs
- Error messages shown to users
- Debugging output
- Configuration files in version control
- Transmitted responses (except to authorized authentication endpoints)

This includes:

- Authentication credentials
- API keys and tokens
- Session secrets
- Encryption keys
- Database credentials
- Third-party service credentials

Exposure of any of these constitutes a security incident requiring credential rotation.

### 6.3 Boundary Between Configuration and Secret Material

Configuration defines system behavior and may be visible, versioned, and documented.

Secrets grant access and must be protected.

The distinction:

- "The system uses external authentication" is configuration
- "The credentials for external authentication" are secrets
- "Pipeline stages are New, Contacted, Quoted" is configuration
- "The API token that accesses the data store" is a secret

Configuration may be discussed. Secrets may not be shared.

### 6.4 Why Convenience Never Overrides Secrecy

It may be convenient to:

- Commit secrets for easy deployment
- Log credentials for debugging
- Share secrets in communication channels
- Use simple, memorable secrets
- Reuse secrets across deployments

All of these are prohibited. Convenience that compromises security is not convenience—it is liability.

---

## 7. Error Handling and Security Visibility

### 7.1 What Security-Relevant Errors Must Be Visible

Security-relevant errors must be visible to those who can act on them:

**To administrators:**

- Authentication failures for their sessions
- Authorization failures for their actions
- System errors that affect their operations

**To operators/developers:**

- All authentication and authorization failures
- All security-relevant system errors
- All abuse detection triggers
- All anomalous access patterns

### 7.2 What Must Never Be Silently Ignored

The following must never be silently ignored:

- Authentication failures
- Authorization failures
- Rate limit violations
- Invalid session attempts
- Requests for non-existent protected resources
- Data integrity violations
- Cross-deployment access attempts (should be architecturally impossible)

Silent failure in security is security failure.

### 7.3 Difference Between User-Facing Errors and Internal Logging

**User-facing errors** inform the user that an operation failed without revealing security internals:

- "Authentication failed" not "Password hash mismatch"
- "Access denied" not "Session token expired at timestamp X"
- "Request could not be completed" not "Database connection failed to host Y"

**Internal logging** captures complete details for diagnosis and audit:

- Full error context
- Request details (excluding secrets)
- Timestamps and sequence information
- Correlation identifiers for tracking

Users receive actionable feedback. Operators receive diagnostic detail. Attackers receive nothing useful.

### 7.4 How Security Failures Affect System Behavior

Security failures result in:

- Denied access (fail closed)
- Logged incident (audit trail)
- User notification (appropriate level of detail)
- Continued protection (no degraded security mode)

Security failures do not result in:

- Degraded access (partial permissions)
- Silent continuation (ignored failure)
- Retry bypass (repeated attempts succeeding)
- Error disclosure (internal details exposed)

---

## 8. Forbidden Security Behaviors

The following are explicitly prohibited. Their presence constitutes a security defect.

### 8.1 Public Endpoints Exposing Internal State

Public endpoints must not reveal:

- Existence of specific Leads, Clients, or Engagements
- Internal identifiers or database keys
- Configuration values
- System architecture details
- Error messages with stack traces or internal paths
- Whether specific data exists or does not exist

### 8.2 Authentication Bypass Via UI or API

There must be no path to administrative functions that does not require authentication. This includes:

- Direct API access without session credentials
- Hidden URLs that skip authentication checks
- Development or debugging modes that disable authentication
- Client-side routing that displays protected data without verification

### 8.3 Relying on Client-Side Checks for Security

Security must be enforced server-side. Client-side checks are user experience conveniences, not security controls.

Prohibited reliance:

- Hiding UI elements as access control
- Client-side validation as the only validation
- Client-side session management without server verification
- Assuming client-provided data is trustworthy

### 8.4 Security Checks That Exist Only in Some Code Paths

Security checks must be consistent. A protected operation must be protected regardless of how it is accessed.

Prohibited inconsistency:

- API protected but UI unprotected (or vice versa)
- Main path protected but error path unprotected
- Normal request protected but malformed request unprotected
- New code path missing established security checks

### 8.5 Temporary Weakening of Security Controls

There is no temporary exception to security rules. Prohibited practices:

- Disabling authentication for testing
- Logging secrets for debugging
- Allowing insecure access during development
- Planning to add security later

Security is implemented correctly from the beginning or it is not implemented.

---

## 9. Operational Trust Guarantees

### 9.1 If an Action Succeeds, It Was Authorized

An administrator who performs an action and receives success confirmation can trust that:

- They were authenticated
- The action was within their authorization
- The action was logged
- The data was modified as indicated

Success means authorized success. The system does not report success for unauthorized actions.

### 9.2 If Access Is Denied, It Is Intentional

When access is denied, it is because:

- Authentication failed or is missing
- The requested operation is not permitted
- The requested resource does not exist or is not accessible

Denial is never accidental, never a side effect, and never a system error masquerading as policy.

### 9.3 If Data Is Visible, Access Was Legitimate

Data displayed to an administrator was accessed through proper authentication and authorization. The system does not display data through security bypasses, cached unauthorized access, or error conditions.

Visibility implies legitimacy.

### 9.4 If Data Is Hidden, It Is Inaccessible

Data not visible to a user is not accessible to that user through any means. The system does not:

- Hide data in the UI while exposing it in APIs
- Restrict display while permitting enumeration
- Show different data based on request method

Hidden means inaccessible, not merely undisplayed.

### 9.5 Trust as a System Property

These guarantees are not policies that might be violated. They are system properties that must be true.

An administrator trusts the system because:

- The system is designed to be trustworthy
- The system is implemented to be trustworthy
- Violations are defects, not risks

Trust is architectural, not aspirational.

---

## 10. Binding Nature

### 10.1 Security Rules Override Convenience

When security requirements conflict with other requirements, security wins.

This means:

- Features that cannot be secured are not shipped
- Deadlines do not justify security shortcuts
- User experience does not override security guarantees
- Technical difficulty does not excuse security omissions

### 10.2 Violations Are Defects, Not Trade-Offs

A security violation is not:

- A trade-off for performance
- An acceptable risk
- A known issue for future remediation
- A low-priority bug

A security violation is a defect requiring immediate correction. The system is not production-ready while security defects exist.

### 10.3 White-Label Customization Does Not Weaken Security

Customer-specific deployments may adapt branding, configuration, and content. They may not:

- Disable authentication
- Weaken authorization
- Bypass rate limiting
- Expose protected endpoints
- Modify audit logging
- Reduce data isolation

Customization operates within security constraints, not outside them.

### 10.4 All Implementations Must Comply

Every deployment of contractors-GWS must comply with this document. Compliance is not optional for:

- Development environments
- Testing environments
- Staging environments
- Production environments
- Customer deployments
- Internal demonstrations

The security posture is consistent across all instances.

### 10.5 Relationship to Governing Documents

This document is subordinate to:

- DOC-000 — contractors-GWS System Charter & Product Promise
- DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries
- DOC-020 — contractors-GWS Canonical Data Model
- DOC-030 — contractors-GWS Back Office & CRM Operational Principles

When this document conflicts with a governing document, the governing document prevails. In all other cases, this document is authoritative for security decisions.

### 10.6 Change Control

This document may be revised through formal change control when:

- Security requirements evolve
- Threat landscape changes
- Governing documents change
- Operational experience reveals necessary adjustments

Revisions require:

- Documented rationale
- Security impact analysis
- Updated version number and timestamp

Security rules do not weaken through omission, exception, or accumulated deviation.

---

*End of document.*
