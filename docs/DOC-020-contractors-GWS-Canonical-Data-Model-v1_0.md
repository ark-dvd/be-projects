# DOC-020 — contractors-GWS Canonical Data Model

**Status:** Canonical  
**Effective Date:** February 3, 2026  
**Version:** 1.0  
**Timestamp:** 20260203-1205 (CST)  
**Governing Documents:** DOC-000 — contractors-GWS System Charter & Product Promise, DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries

---

## Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1205 | Initial release |

---

## Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

This document defines the authoritative data model for the contractors-GWS product. All implementation decisions regarding data storage, retrieval, and manipulation must conform to this specification.

---

## 1. Data Model Overview

The contractors-GWS data model serves three operational purposes:

**Customer Relationship Management**  
Data representing the lifecycle of business relationships, from initial inquiry through active engagement. This domain captures who the potential and actual customers are, what they need, and the history of interaction with them.

**Content Presentation**  
Data representing the public identity of the business as presented through its website. This domain captures what the business offers, what it has accomplished, and what others say about it.

**Operational Configuration**  
Data representing how the system behaves for this particular business. This domain captures categorizations, labels, and operational parameters that adapt the generic system to the specific business context.

These three domains are distinct. Customer relationship data is operational and changes frequently through business activity. Content data is presentational and changes through deliberate editorial action. Configuration data is structural and changes infrequently through administrative decision.

The data model enforces separation between these domains. No entity serves multiple purposes. No relationship crosses domain boundaries except through explicit, documented interfaces.

---

## 2. Canonical Entities

### 2.1 Lead

**Purpose**  
A Lead represents a potential customer who has expressed interest in the business but has not yet become a customer. Leads are the entry point of the customer relationship lifecycle.

**Core Attributes**

- Identity: Full name of the person or organization expressing interest
- Contact information: Means by which the lead can be reached
- Origin: How the lead entered the system (automatic from website or manual entry)
- Source: Where the lead heard about the business (referral, advertising, etc.)
- Service interest: What the lead is interested in obtaining
- Estimated value: Anticipated monetary value if converted
- Priority: Relative importance for follow-up
- Pipeline status: Current stage in the sales process
- Original inquiry: The verbatim content of the initial contact, if applicable
- Internal notes: Private observations not visible to the lead
- Receipt timestamp: When the lead entered the system

**Ownership**  
CRM Domain

**Mutability Rules**

- Origin is immutable after creation. A lead cannot change how it entered the system.
- Original inquiry content is immutable. The verbatim record of first contact must be preserved.
- Receipt timestamp is immutable. When a lead arrived cannot be changed.
- All other attributes may be modified through authorized administrative action.
- Pipeline status changes must be recorded as Activities.

**What This Entity Must Never Represent**

- A confirmed customer with active business relationship (that is a Client)
- A specific project or engagement (that is an Engagement)
- A communication or event (that is an Activity)
- Configuration options (that is CRM Configuration)

---

### 2.2 Client

**Purpose**  
A Client represents a confirmed customer with whom the business has or has had an active relationship. Clients have progressed beyond initial interest into actual business engagement.

**Core Attributes**

- Identity: Full name of the person or organization
- Contact information: Means by which the client can be reached
- Address: Physical location relevant to service delivery
- Client status: Whether the relationship is currently active or historical
- Relationship start: When this entity became a client
- Internal notes: Private observations about the client
- Source lead: Reference to the lead that converted to this client, if applicable

**Ownership**  
CRM Domain

**Mutability Rules**

- Relationship start is immutable. When someone became a client cannot be changed.
- Source lead reference is immutable. The origin of a converted client must be preserved.
- Client status may transition from active to past. Transition from past to active requires a new Engagement.
- All other attributes may be modified through authorized administrative action.

**What This Entity Must Never Represent**

- A potential customer who has not committed (that is a Lead)
- A specific project or transaction (that is an Engagement)
- A business that is not a customer (no prospect records exist)

---

### 2.3 Engagement

**Purpose**  
An Engagement represents a specific project, transaction, or service relationship with a Client. It is the unit of work or business activity. The terminology varies by industry (Project, Deal, Transaction, Engagement) but the structural role is identical.

**Core Attributes**

- Title: Identifying name for the engagement
- Engagement type: Category of work or service
- Value: Monetary value of the engagement
- Status: Current stage in the engagement lifecycle
- Start date: When work began or is expected to begin
- End date: When work concluded or is expected to conclude
- Description: Scope and details of the engagement
- Internal notes: Private observations about the engagement
- Associated client: Reference to the client for whom this engagement exists

**Ownership**  
CRM Domain

**Mutability Rules**

- Associated client reference is immutable. An engagement cannot be reassigned to a different client.
- All other attributes may be modified through authorized administrative action.
- Status changes must be recorded as Activities.

**What This Entity Must Never Represent**

- A potential customer (that is a Lead)
- The customer themselves (that is a Client)
- A communication or event (that is an Activity)

---

### 2.4 Activity

**Purpose**  
An Activity represents a recorded event in the history of a CRM entity. Activities provide the audit trail and interaction history that makes the CRM operationally useful.

**Core Attributes**

- Activity type: Category of event (status change, note, call, email, etc.)
- Description: Human-readable account of what occurred
- Timestamp: When the activity occurred
- Associated lead: Reference to the lead this activity concerns, if applicable
- Associated client: Reference to the client this activity concerns, if applicable
- Associated engagement: Reference to the engagement this activity concerns, if applicable
- Performer: Who or what caused this activity (system or administrator)

**Ownership**  
CRM Domain

**Mutability Rules**

- Activities are append-only. Once created, an Activity cannot be modified.
- Activities cannot be deleted. Historical record must be preserved.
- Timestamp is immutable and must reflect actual occurrence time.
- Entity associations are immutable. An activity cannot be reassigned.

**What This Entity Must Never Represent**

- Current state (Activities are historical, not current)
- Configuration or settings
- Content or media

---

### 2.5 Content Item

**Purpose**  
A Content Item represents a discrete piece of information presented on the public website. This includes service descriptions, project showcases, testimonials, and general site content.

**Core Attributes**

- Content type: Category of content (service, project, testimonial, page content, etc.)
- Title: Identifying name for the content
- Body: The substantive content itself
- Display status: Whether the content is published or unpublished
- Display order: Relative position when multiple items are shown
- Associated media: References to media assets used by this content
- Creation timestamp: When the content was created
- Last modified timestamp: When the content was last changed

**Ownership**  
Content & Media Domain

**Mutability Rules**

- Creation timestamp is immutable.
- All other attributes may be modified through authorized administrative action.
- Changes to display status (publish/unpublish) should be logged.

**What This Entity Must Never Represent**

- CRM data (leads, clients, engagements)
- Configuration settings
- Media assets themselves (those are separate entities)

---

### 2.6 Media Asset

**Purpose**  
A Media Asset represents a file uploaded to the system for use in content presentation. This includes images, logos, documents, and other binary content.

**Core Attributes**

- Asset identifier: Unique reference to the stored asset
- Original filename: Name of the file as uploaded
- Asset type: Category of media (image, document, etc.)
- Upload timestamp: When the asset was added to the system
- Uploaded by: Who added the asset
- Associated content: References to content items using this asset

**Ownership**  
Content & Media Domain

**Mutability Rules**

- Asset identifier is immutable.
- Original filename is immutable. The record of what was uploaded must be preserved.
- Upload timestamp is immutable.
- Media assets may be replaced with new versions, but the replacement must be logged.
- Media assets may be deleted only if no content items reference them.

**What This Entity Must Never Represent**

- Content text or descriptions (that is Content Item)
- CRM data
- Configuration

---

### 2.7 CRM Configuration

**Purpose**  
CRM Configuration represents the operational parameters that govern how the CRM behaves for this business. It defines the categories, labels, and stages that organize CRM data.

**Core Attributes**

- Pipeline stages: Ordered list of stages through which leads progress, with names and visual identifiers
- Lead sources: List of valid sources for manual lead entry
- Service types: List of valid service or project categories
- Engagement statuses: Ordered list of stages through which engagements progress
- Default values: Initial values for new CRM records
- Display labels: Industry-specific terminology for entities and fields
- Currency: Monetary display format

**Ownership**  
Configuration Domain

**Mutability Rules**

- Configuration may be modified through authorized administrative action.
- Modification of pipeline stages must not invalidate existing leads. If a stage is removed, existing leads in that stage must be addressed.
- Modification of engagement statuses must not invalidate existing engagements.
- Configuration changes do not retroactively alter historical data.

**What This Entity Must Never Represent**

- User permissions or access control (explicitly out of scope per DOC-000)
- Operational data (leads, clients, engagements)
- Content or media
- Approval workflows or business logic beyond categorization

---

### 2.8 Website Configuration

**Purpose**  
Website Configuration represents the operational parameters that govern how the public website presents the business.

**Core Attributes**

- Business identity: Name, tagline, description
- Contact information: Address, phone, email displayed publicly
- Social links: References to external social media presence
- Branding elements: References to logo and visual identity assets
- Operational details: Business hours, service area, etc.

**Ownership**  
Configuration Domain (with media references owned by Content & Media Domain)

**Mutability Rules**

- All attributes may be modified through authorized administrative action.
- Changes take effect upon publication. There is no draft state for configuration.

**What This Entity Must Never Represent**

- CRM configuration
- Content items (those are separate)
- CRM operational data

---

## 3. Entity Relationships

### 3.1 Lead → Client

**Relationship Type:** One-to-one, optional

**Direction of Authority:** Lead precedes Client. A Client may reference its source Lead. A Lead may reference the Client it became.

**Cardinality:** One Lead may convert to at most one Client. One Client may have at most one source Lead. Not all Leads become Clients. Not all Clients originated as Leads.

**Constraints:**

- Conversion is a business event, not a data transformation. The Lead continues to exist after conversion.
- The conversion relationship, once established, is immutable.
- A Lead that has been converted cannot be converted again.
- A Client may exist without a source Lead (direct client creation).

**Forbidden:**

- A Lead converting to multiple Clients
- A Client having multiple source Leads
- Reversing a conversion (Client back to Lead)

---

### 3.2 Client → Engagement

**Relationship Type:** One-to-many

**Direction of Authority:** Client is the parent. Engagement belongs to exactly one Client.

**Cardinality:** One Client may have zero, one, or many Engagements. Each Engagement belongs to exactly one Client.

**Constraints:**

- An Engagement cannot exist without an associated Client.
- The Client association is established at Engagement creation and cannot be changed.
- Deleting a Client requires addressing all associated Engagements first.

**Forbidden:**

- Engagement without a Client
- Engagement associated with multiple Clients
- Reassigning an Engagement to a different Client

---

### 3.3 CRM Entity → Activity

**Relationship Type:** One-to-many, polymorphic

**Direction of Authority:** CRM entities (Lead, Client, Engagement) are parents. Activities belong to one or more CRM entities.

**Cardinality:** Each CRM entity may have zero or many Activities. Each Activity is associated with at least one CRM entity.

**Constraints:**

- Activities provide historical record for CRM entities.
- An Activity may be associated with multiple related entities (e.g., an Activity recording Lead conversion references both the Lead and the resulting Client).
- Activity associations are immutable once created.

**Forbidden:**

- Activities with no entity associations
- Modification of Activity entity associations after creation
- Deletion of Activities

---

### 3.4 Content Item ↔ Media Asset

**Relationship Type:** Many-to-many

**Direction of Authority:** Content Items reference Media Assets. Media Assets do not reference Content Items directly (the relationship is navigated from Content to Media).

**Cardinality:** One Content Item may reference zero or many Media Assets. One Media Asset may be referenced by zero or many Content Items.

**Constraints:**

- Media Assets may be removed only if no Content Items reference them, or if the removal is part of a coordinated content update.
- Content Items may add or remove Media Asset references through normal editing.

**Forbidden:**

- Media Asset deletion while referenced by published Content Items without explicit replacement or removal from those Content Items

---

### 3.5 Configuration → Operational Behavior

**Relationship Type:** Configuration governs, data conforms

**Direction of Authority:** Configuration defines valid categories and stages. Operational data must use values from Configuration.

**Constraints:**

- CRM data must use pipeline stages, service types, and engagement statuses defined in CRM Configuration.
- Configuration changes do not retroactively validate or invalidate existing data. Existing data with values removed from Configuration should be flagged, not corrupted.
- Configuration is read by consuming domains. Consuming domains do not write to Configuration.

**Forbidden:**

- Operational data using values not defined in Configuration (except for legacy data after Configuration changes)
- Configuration changes silently invalidating operational data
- Circular dependencies where data defines Configuration

---

## 4. Lifecycle Rules

### 4.1 Lead Lifecycle

**Stages**

1. **New:** Lead has entered the system but has not been acted upon.
2. **In Progress:** Lead is being actively worked (contacted, quoted, negotiating).
3. **Resolved:** Lead has reached a terminal state (won, lost, disqualified).

**Allowed Transitions**

- New → In Progress (any in-progress stage)
- In Progress → In Progress (progression through pipeline stages)
- In Progress → Resolved (won or lost)
- New → Resolved (immediate win or loss without intermediate steps)

**Irreversible Transitions**

- Resolved (Won) with Client conversion: The conversion relationship is permanent.

**Reversible Transitions**

- In Progress stages may move backward (e.g., re-contacting after quote rejection).
- Resolved (Lost) may be reopened to In Progress (revived opportunity).

**Conversion**

- Lead conversion to Client occurs when a Lead reaches a "won" state and administrative action creates the Client.
- Conversion preserves the Lead. The Lead record remains with its full history.
- Conversion creates a bidirectional reference: Lead references resulting Client; Client references source Lead.
- Conversion must create an Activity on both the Lead and the new Client.

---

### 4.2 Client Lifecycle

**Stages**

1. **Active:** Client has current or recent business relationship.
2. **Past:** Client has no current engagement and relationship is historical.

**Allowed Transitions**

- Active → Past (all engagements completed, no ongoing relationship)
- Past → Active (new engagement created)

**Preservation Requirements**

- Client records are never deleted. Past clients remain in the system.
- Client history (Activities, Engagements) must be preserved indefinitely.

---

### 4.3 Engagement Lifecycle

**Stages**

1. **Planning:** Engagement is being scoped or prepared.
2. **Active:** Work is underway.
3. **Completed:** Work has concluded successfully.
4. **Paused:** Work is temporarily suspended.
5. **Cancelled:** Engagement was terminated before completion.

**Allowed Transitions**

- Planning → Active
- Planning → Cancelled
- Active → Completed
- Active → Paused
- Active → Cancelled
- Paused → Active
- Paused → Cancelled

**Irreversible Transitions**

- Completed: A completed engagement cannot return to active. A new engagement must be created for additional work.
- Cancelled: A cancelled engagement cannot be resumed. A new engagement must be created.

**Preservation Requirements**

- Engagement records are never deleted.
- Completed and Cancelled engagements remain in the system as historical record.

---

### 4.4 Content Lifecycle

**Stages**

1. **Draft:** Content exists but is not publicly visible.
2. **Published:** Content is publicly visible.
3. **Unpublished:** Content was previously published but is no longer visible.

**Allowed Transitions**

- Draft → Published
- Published → Unpublished
- Unpublished → Published
- Draft → Deleted (draft content may be removed)

**Constraints**

- Published content that has been live cannot be deleted, only unpublished.
- Content deletion removes the content permanently. This is allowed only for content that was never published.

---

## 5. Invariants and Constraints

The following conditions must always be true. Violation of any invariant indicates a system defect.

### 5.1 Identity Invariants

**INV-001:** Every entity has a unique identifier within its type that does not change for the lifetime of the entity.

**INV-002:** No two Leads may have identical combinations of name, email, and phone without explicit administrative acknowledgment of intentional duplication.

**INV-003:** No two Clients may represent the same actual customer. Duplicate Clients are data quality defects.

### 5.2 Referential Invariants

**INV-004:** Every Engagement references exactly one Client that exists.

**INV-005:** Every Activity references at least one CRM entity (Lead, Client, or Engagement) that exists.

**INV-006:** If a Lead has a "converted to Client" reference, that Client must exist and must have a "source Lead" reference back to this Lead.

**INV-007:** If a Client has a "source Lead" reference, that Lead must exist and must have a "converted to Client" reference to this Client.

### 5.3 Temporal Invariants

**INV-008:** Activity timestamps must be sequential within an entity's history. An Activity cannot precede the entity's creation.

**INV-009:** Client relationship start cannot precede the source Lead's receipt timestamp, if a source Lead exists.

**INV-010:** Engagement start date cannot precede the associated Client's relationship start.

### 5.4 Historical Integrity Invariants

**INV-011:** Activities cannot be modified after creation.

**INV-012:** Activities cannot be deleted.

**INV-013:** Lead original inquiry content cannot be modified after creation.

**INV-014:** Conversion relationships (Lead → Client) cannot be severed or redirected.

### 5.5 Configuration Integrity Invariants

**INV-015:** Pipeline stages referenced by Leads must exist in CRM Configuration or be flagged as legacy values.

**INV-016:** Engagement statuses referenced by Engagements must exist in CRM Configuration or be flagged as legacy values.

**INV-017:** Configuration changes must not silently corrupt operational data.

### 5.6 Data Preservation Invariants

**INV-018:** No CRM entity (Lead, Client, Engagement) may be permanently deleted. Soft deletion or archival is permitted; data destruction is not.

**INV-019:** No Activity may be permanently deleted.

**INV-020:** Media Assets referenced by published Content Items cannot be deleted without first removing or replacing the reference.

---

## 6. Configuration vs Data

### 6.1 What Is Configuration

Configuration defines the operational vocabulary and categorization for the system:

- Pipeline stages and their sequence
- Valid lead sources
- Valid service or engagement types
- Valid engagement statuses
- Display labels and terminology
- Default values for new records
- Currency and formatting preferences
- Business identity and contact information

Configuration is stable. It changes infrequently and deliberately through administrative decision.

### 6.2 What Is Operational Data

Operational data represents actual business activity:

- Individual Leads with their specific details and history
- Individual Clients with their relationship records
- Individual Engagements with their status and value
- Individual Activities recording what happened
- Individual Content Items with their specific text and media
- Individual Media Assets with their binary content

Operational data is dynamic. It changes frequently through normal business operations.

### 6.3 How Configuration Influences Behavior

Configuration constrains operational data:

- New Leads are assigned a pipeline stage from the configured stages.
- New Engagements are assigned a status from the configured statuses.
- Dropdown selections throughout the system offer values from Configuration.
- Display labels and terminology come from Configuration.

Configuration does not contain business logic. Configuration is categorization, not rules. The system does not execute different code based on Configuration values.

### 6.4 What Configuration Must Never Do

**Configuration must never:**

- Define user permissions or access levels (explicitly out of scope)
- Contain conditional logic or rules that change system behavior
- Override or destroy operational data
- Cause operational data to become invalid retroactively
- Define approval workflows or state machine logic
- Control which users can see which data

Configuration categorizes. It does not decide.

---

## 7. Isolation and Deployment Boundary

### 7.1 Deployment Model

contractors-GWS uses a clone-based deployment model. Each customer receives an independent deployment derived from a common codebase.

At the data level, this means:

**One deployment = one customer = one complete data set**

### 7.2 Data Isolation Guarantees

**ISO-001:** No data entity in one deployment may reference or be referenced by any entity in another deployment.

**ISO-002:** No identifier in one deployment has any meaning in another deployment. Identifiers are deployment-scoped.

**ISO-003:** No query in one deployment may return data from another deployment.

**ISO-004:** No configuration in one deployment affects behavior in another deployment.

**ISO-005:** No administrative action in one deployment modifies data in another deployment.

### 7.3 What Is Not Shared

Between deployments, nothing is shared:

- No shared Leads
- No shared Clients
- No shared Engagements
- No shared Activities
- No shared Content
- No shared Media
- No shared Configuration
- No shared identifiers
- No shared state of any kind

### 7.4 Deployment Does Not Weaken Isolation

The clone-based model does not permit:

- Cross-deployment queries for "reporting" purposes
- Shared media asset libraries across customers
- Centralized configuration that affects multiple deployments
- Any mechanism by which data from one customer could be visible to another

Isolation is absolute. It is not a policy that can be relaxed for convenience.

---

## 8. Binding Nature

### 8.1 Authority of This Document

This document defines what data may exist, what it represents, and how it may behave in the contractors-GWS product.

All implementation decisions regarding data must conform to this specification:

- Storage schemas must implement these entities with these attributes.
- APIs must enforce these relationships and constraints.
- User interfaces must not permit operations that violate these rules.
- Migrations must preserve these invariants.

### 8.2 Violations Are Defects

Code, configuration, or operational procedure that violates this data model is defective.

A violation is not:

- An interpretation
- A trade-off
- A shortcut
- An optimization
- A temporary measure

A violation is a defect that must be corrected.

### 8.3 Convenience Does Not Justify Violations

Implementation convenience, deadline pressure, or perceived user benefit do not justify data model violations.

If a convenient solution requires:

- Deleting Activities
- Breaking referential integrity
- Allowing cross-deployment data access
- Silently corrupting data on Configuration changes
- Permitting duplicate Clients without acknowledgment

Then the solution is invalid. A compliant solution must be found.

### 8.4 Change Control

This document may be revised through formal change control when:

- Business requirements change deliberately
- Operational experience reveals necessary adjustments
- New capabilities require data model extension

Revisions require:

- Documented rationale
- Impact analysis on existing data
- Migration path that preserves invariants
- Updated version number and timestamp

This data model does not change through omission, assumption, or accumulated deviation.

### 8.5 Governing Documents

This document is subordinate to:

- DOC-000 — contractors-GWS System Charter & Product Promise
- DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries

When this document conflicts with DOC-000 or DOC-010, the governing document prevails. In all other cases, this document is authoritative for data model decisions.

---

*End of document.*
