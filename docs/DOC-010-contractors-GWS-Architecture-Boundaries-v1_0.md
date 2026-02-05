# DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries

**Status:** Canonical  
**Effective Date:** February 3, 2026  
**Version:** 1.0 
**Timestamp:** 20260203-1200 (CST)  
**Governing Document:** DOC-000 — contractors-GWS System Charter & Product Promise

---

### Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1200 | Initial release |

---

### Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

---

## 1. Architectural Overview

contractors-GWS is a composed system built from distinct responsibility domains. Each domain owns a specific concern, operates within defined boundaries, and interacts with other domains through explicit interfaces.

The system follows a clone-based deployment model. A single canonical codebase is replicated per customer, adapted for their business, and deployed as an independent instance. Each deployment is complete and self-contained. No deployment shares runtime state, configuration, or data with any other deployment.

Separation of concerns is not advisory. It is structural. Each domain has explicit ownership of specific capabilities and explicit prohibitions against assuming ownership of others. This separation remains invariant across all cloned deployments regardless of customer-specific adaptation.

The architectural principle is: each domain does what it owns, reads what it needs, and never compensates for what another domain should provide.

---

## 2. Responsibility Domains

### 2.1 Website Domain

**Responsibilities**

The Website Domain owns the public-facing presentation of the customer's business.

- Rendering pages visible to the public
- Displaying content retrieved from the Content & Media Domain
- Presenting contact forms and capturing form submissions
- Delivering submissions to the CRM Domain for lead creation
- Reflecting the current state of published content accurately

**Non-Responsibilities**

The Website Domain does not own:

- Content creation, editing, or management
- Lead status, pipeline progression, or CRM state
- Authentication or access control
- Business logic beyond presentation
- Configuration of any other domain

**Boundary Constraints**

- The Website Domain must not modify content; it only renders what the Content & Media Domain provides.
- The Website Domain must not interpret or transform CRM data; it only delivers form submissions.
- The Website Domain must not cache content in ways that contradict the authoritative state held by the Content & Media Domain.
- The Website Domain must not assume form submission succeeded unless the CRM Domain confirms it.

---

### 2.2 Back Office Domain

**Responsibilities**

The Back Office Domain owns the administrative interface through which the business owner operates the system.

- Providing authenticated access to administrative functions
- Presenting interfaces for content management
- Presenting interfaces for CRM operations
- Presenting interfaces for configuration
- Coordinating user intent with the appropriate owning domain

**Non-Responsibilities**

The Back Office Domain does not own:

- The data it displays (owned by Content, CRM, or Configuration domains)
- The business logic for persistence (owned by respective domains)
- Authentication decisions (owned by Authentication & Access Domain)
- The public website rendering

**Boundary Constraints**

- The Back Office Domain must not persist data directly; it must delegate to the owning domain.
- The Back Office Domain must not display state that contradicts the authoritative source.
- The Back Office Domain must not silently discard user input; failures must be surfaced.
- The Back Office Domain must not assume an operation succeeded without confirmation from the owning domain.

---

### 2.3 CRM Domain

**Responsibilities**

The CRM Domain owns the operational customer relationship lifecycle.

- Creating, storing, and managing Lead records
- Creating, storing, and managing Client records
- Creating, storing, and managing Deal/Engagement records
- Recording Activity logs against CRM entities
- Enforcing status progression rules
- Providing search and retrieval across CRM entities
- Accepting lead submissions from the Website Domain

**Non-Responsibilities**

The CRM Domain does not own:

- Website content or presentation
- User authentication or access control
- Pipeline stage definitions (owned by Configuration Domain)
- Media or file storage

**Boundary Constraints**

- The CRM Domain must persist all accepted data reliably; silent data loss is a defect.
- The CRM Domain must not invent or infer data not explicitly provided.
- The CRM Domain must reject invalid input explicitly; it must not silently coerce or compensate.
- The CRM Domain must read configuration from the Configuration Domain; it must not hardcode operational categorizations.
- The CRM Domain must log state changes as Activities; state transitions without audit trail are defects.

---

### 2.4 Content & Media Domain

**Responsibilities**

The Content & Media Domain owns all website content and media assets.

- Storing and retrieving textual content (services, projects, testimonials, site settings)
- Storing and retrieving media assets (images, logos, documents)
- Providing authoritative content state to the Website Domain
- Providing authoritative content state to the Back Office Domain for editing

**Non-Responsibilities**

The Content & Media Domain does not own:

- CRM data
- Configuration settings unrelated to content
- Authentication or access control
- Rendering or presentation logic

**Boundary Constraints**

- The Content & Media Domain is the single source of truth for all content; no other domain may store or cache content authoritatively.
- The Content & Media Domain must persist changes reliably; content edits must survive and be retrievable.
- The Content & Media Domain must not interpret or transform content based on CRM state.
- The Content & Media Domain must not reject valid media uploads silently.

---

### 2.5 Configuration Domain

**Responsibilities**

The Configuration Domain owns operational settings that govern system behavior.

- Pipeline stage definitions (names, order, colors)
- Lead status definitions
- Deal status definitions
- Service/project type categorizations
- Display labels and terminology
- Default values for operational fields

**Non-Responsibilities**

The Configuration Domain does not own:

- User roles or permissions (not in scope per DOC-000)
- Authentication settings
- CRM entity data
- Content or media

**Boundary Constraints**

- Configuration must be read by consuming domains; consuming domains must not hardcode values that Configuration owns.
- Configuration changes must take effect when applied; dormant configuration is a defect.
- Configuration must not silently revert or fail to persist.
- Configuration scope is limited to operational categorization; it does not extend to access control, approval workflows, or permission differentiation.

---

### 2.6 Authentication & Access Domain

**Responsibilities**

The Authentication & Access Domain owns identity verification and access decisions for the Back Office.

- Verifying administrator identity
- Granting or denying access to the Back Office
- Maintaining session state for authenticated users
- Enforcing that unauthenticated users cannot access administrative functions

**Non-Responsibilities**

The Authentication & Access Domain does not own:

- User roles or granular permissions (not in scope per DOC-000)
- CRM data access rules beyond authenticated/unauthenticated
- Content visibility rules
- Public website access (which requires no authentication)

**Boundary Constraints**

- Authentication decisions are binary: authenticated or not. There is no role hierarchy.
- The Authentication & Access Domain must not leak session state to unauthorized parties.
- The Authentication & Access Domain must not grant access based on assumed or inferred identity.
- Authentication failure must be explicit; silent access denial without feedback is a defect.

---

### 2.7 Deployment & White-Label Boundary Domain

**Responsibilities**

The Deployment & White-Label Boundary Domain owns the adaptation and isolation constraints of each cloned deployment.

- Ensuring each deployment serves exactly one customer
- Ensuring no operational data crosses deployment boundaries
- Permitting customer-specific branding and configuration within defined limits
- Enforcing that canonical product rules remain intact across all deployments

**Non-Responsibilities**

The Deployment & White-Label Boundary Domain does not own:

- Runtime behavior within a deployment (owned by respective functional domains)
- Cross-deployment data sharing (prohibited by design)
- Multi-tenant isolation (not applicable; each deployment is independent)

**Boundary Constraints**

- Deployment adaptation must not violate canonical domain boundaries.
- Customer-specific configuration must operate within the Configuration Domain's defined scope.
- No deployment may introduce capabilities, roles, or behaviors that contradict DOC-000 or this document.
- Isolation between deployments is absolute; no shared state, no shared data, no shared configuration.

---

## 3. Boundary Rules

The following rules govern interactions between domains and are non-negotiable.

**Rule 1: No Silent Compensation**

No domain may silently compensate for another domain's failure or absence. If a domain requires data or confirmation from another domain and does not receive it, the operation must fail explicitly. Masking failures by inventing defaults, assuming success, or degrading silently is prohibited.

**Rule 2: No Authority Bypass**

No domain may bypass another domain's authority. If the CRM Domain owns lead persistence, no other domain may persist leads. If the Configuration Domain owns pipeline stages, no other domain may define or override them. Authority is exclusive within each domain's scope.

**Rule 3: No Implicit Side Effects**

Cross-domain operations must have explicit ownership. If the Website Domain delivers a form submission, the CRM Domain explicitly accepts or rejects it. The Website Domain does not assume success. The CRM Domain does not silently create records the Website Domain did not request.

**Rule 4: Deployment Does Not Relax Boundaries**

Clone-based deployment does not permit boundary violations. A customer deployment may adapt branding, configure operational categories, and customize content. It may not redefine domain responsibilities, introduce cross-domain shortcuts, or disable boundary enforcement for convenience.

**Rule 5: Read Access Does Not Imply Write Authority**

A domain may read data owned by another domain to fulfill its responsibilities. Read access does not grant write authority. The Back Office Domain reads CRM data to display it; only the CRM Domain may modify it. The Website Domain reads content; only the Content & Media Domain may change it.

---

## 4. Conflict Resolution Principles

When conflicts arise between domains, the following resolution principles apply.

**UI vs. Persisted State**

Persisted state prevails. If the Back Office displays data that contradicts what the owning domain has persisted, the display is incorrect. The UI must be corrected to reflect authoritative state. User-visible state that disagrees with stored state is a defect.

**Configuration vs. Behavior**

Configuration prevails. If system behavior contradicts configured settings, the behavior is incorrect. Configuration defines intended behavior; implementation must conform. Behavior that ignores configuration is a defect.

**Website vs. CRM State**

CRM state prevails for CRM data. If the Website Domain displays lead or client information, it must reflect CRM Domain state. The Website Domain has no authority over CRM data accuracy.

**Deployment Customization vs. Canonical Rules**

Canonical rules prevail. If a deployment customization contradicts DOC-000 or this document, the customization is invalid. White-label adaptation operates within canonical constraints, not outside them.

**Ambiguity**

When domain ownership is ambiguous, the conflict must be escalated to documentation revision. No domain may claim authority by default. Undocumented authority is not authority.

---

## 5. Immutability and Authority

### 5.1 Domains That May Mutate State

The following domains are authorized to create, update, or delete records within their scope:

- **CRM Domain**: Leads, Clients, Deals, Activities
- **Content & Media Domain**: Content records, media assets
- **Configuration Domain**: Operational settings
- **Authentication & Access Domain**: Session state

### 5.2 Domains That Are Read-Only by Definition

The following domains do not own persistent state and operate in read-only mode relative to data:

- **Website Domain**: Reads content and delivers form submissions; does not own data.
- **Back Office Domain**: Reads and presents data; delegates mutations to owning domains.

### 5.3 Changes Requiring Explicit Administrative Intent

The following changes must not occur automatically or inferentially:

- Lead conversion to Client
- Deal status changes
- Content publication or unpublication
- Configuration changes
- Any deletion of CRM, content, or configuration records

These changes require explicit user action through the Back Office Domain, confirmed by the owning domain.

### 5.4 Invariants Across All Deployments

The following boundaries are invariant and must hold in every cloned deployment:

- Domain responsibilities as defined in this document
- Boundary rules as defined in Section 3
- Conflict resolution principles as defined in Section 4
- The prohibition on silent compensation, authority bypass, and implicit side effects
- The requirement that persisted state is authoritative over displayed state

Customer adaptation may not relax these invariants.

---

## 6. Binding Nature

This document constrains all implementation, customization, and operational decisions for the contractors-GWS product.

**Violations Are Defects**

Code, configuration, or behavior that violates the boundaries defined in this document is defective. Violations are not interpretations, trade-offs, or acceptable shortcuts. They must be corrected.

**White-Label Adaptation Does Not Justify Violations**

Customer-specific deployments operate within canonical boundaries. The clone-based deployment model permits adaptation; it does not permit redefinition of domain responsibilities or relaxation of boundary enforcement.

**Convenience Does Not Override Boundaries**

Implementation convenience, deadline pressure, or perceived user benefit do not justify boundary violations. If a convenient solution requires one domain to assume another's responsibility, the solution is invalid.

**Authority of This Document**

This document is subordinate only to DOC-000 — contractors-GWS System Charter & Product Promise. When this document and DOC-000 conflict, DOC-000 prevails. In all other cases, this document is authoritative for architectural responsibility boundaries.

All future design decisions, implementation work, and deployment customizations must comply with this document unless it is formally revised through documented change control.

---

*End of document.*
