# DOC-050 — contractors-GWS Configuration vs Code Rules

**Status:** Canonical  
**Effective Date:** February 3, 2026  
**Version:** 1.0  
**Timestamp:** 20260203-1221 (CST)  
**Governing Documents:** DOC-000 — contractors-GWS System Charter & Product Promise, DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries, DOC-020 — contractors-GWS Canonical Data Model, DOC-030 — contractors-GWS Back Office & CRM Operational Principles, DOC-040 — contractors-GWS Security, Authentication & Operational Trust Rules

---

## Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1221 | Initial release |

---

## Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

This document defines the absolute boundary between configuration and code for the contractors-GWS product. It exists to prevent demo-level behavior, hidden logic in configuration, hard-coded business rules, and silent drift between deployments.

---

## 1. Governing Principle

The boundary between configuration and code is absolute and non-negotiable.

**Configuration customizes vocabulary and presentation.**

**Code defines logic, behavior, and guarantees.**

Configuration must never contain logic. A configuration value must never cause the system to make a different decision, execute a different code path, or behave in a fundamentally different way.

Code must never depend on undocumented configuration behavior. If code expects configuration to have a certain structure, value range, or semantic meaning, that expectation must be documented and enforced.

When the boundary is unclear, the answer is code. Logic belongs in code. Configuration provides inputs to logic; configuration does not contain logic.

---

## 2. What Is Configuration

Configuration is data that adapts the system's presentation and vocabulary without altering its fundamental behavior.

### 2.1 Configuration Defined

Configuration is:

- **Categorization:** Defining available categories, types, and groupings
- **Labeling:** Naming things in industry-appropriate terminology
- **Ordering:** Specifying display sequence and priority
- **Defaults:** Establishing initial values for new records
- **Presentation terminology:** Adapting language to business context

### 2.2 Allowed Configuration

The following may be configured:

- Pipeline stages: names, order, colors
- Lead sources: available options for manual entry
- Engagement statuses: names, order, colors
- Service types: available project/service categories
- Display labels: industry-specific terminology (e.g., "Project" vs "Deal" vs "Engagement")
- Currency and formatting: symbol, decimal places
- Business identity: company name, tagline, description
- Contact details: address, phone, email
- Social links: external profile references
- Website presentation: service area, business hours, branding references

### 2.3 Properties of Configuration

Configuration:

- Is read at runtime
- Is changeable by administrators through the Back Office
- Does not execute logic
- Does not make decisions
- Does not alter what code does, only what code displays or accepts as input
- Is visible and transparent to administrators

### 2.4 Configuration Does Not Decide

Configuration provides options. Code decides.

If a pipeline has five stages, configuration names those stages. Code enforces which transitions are allowed. Configuration does not determine transition rules.

If engagement types exist, configuration lists them. Code enforces that engagements must have a type. Configuration does not determine validation rules.

---

## 3. What Is Code

Code is the logic that defines how the system behaves, regardless of configuration.

### 3.1 Code Defined

Code is:

- **Business logic:** Rules governing how operations work
- **State transitions:** Which changes are allowed from which states
- **Validation rules:** What input is accepted and rejected
- **Invariants:** Conditions that must always be true
- **Security enforcement:** Authentication and authorization decisions
- **Authorization checks:** Who may perform which operations
- **Data lifecycle enforcement:** Creation, modification, preservation, and deletion rules
- **Audit logging behavior:** What gets logged and when
- **Error handling behavior:** How failures are detected, reported, and recovered

### 3.2 Properties of Code

Code:

- Is versioned in source control
- Is reviewed before deployment
- Is tested for correctness
- Is identical across all deployments running the same version
- Defines guarantees that configuration cannot override
- Contains all conditional logic

### 3.3 Code Is Identical Across Deployments

Two deployments running the same code version must behave identically given identical inputs. Configuration may differ, but behavior differences must be limited to:

- What labels are displayed
- What options are available in dropdowns
- What default values are applied
- What terminology is used

Behavior differences must never include:

- What is permitted vs prohibited
- What is validated vs accepted
- What is logged vs ignored
- What is secure vs exposed

---

## 4. What Must Never Be Configurable

The following must never be controlled by configuration. They must be implemented in code.

### 4.1 Security and Access

- Authorization rules (who may access what)
- Authentication behavior (how identity is verified)
- Security checks (what requests are permitted)
- Session management (how sessions are created, validated, expired)
- Rate limiting behavior (how abuse is prevented)

### 4.2 Data Integrity

- Data deletion rules (what can be deleted and when)
- Data preservation requirements (what must be retained)
- Referential integrity enforcement (what relationships must exist)
- Audit logging behavior (what events create Activities)
- Data isolation boundaries (what deployment can access what data)

### 4.3 Business Logic

- Lifecycle transition rules (what state changes are allowed)
- Validation requirements (what input is accepted)
- Conversion logic (how Lead becomes Client)
- Cross-entity logic (how entities affect each other)
- Conditional workflows (what happens based on state)

### 4.4 Error Handling

- Error detection (what constitutes an error)
- Error reporting (how errors are communicated)
- Error recovery (how the system responds to failure)
- Failure modes (what happens when operations fail)

### 4.5 The Decision Test

If changing a configuration value would alter what the system decides—not just what it displays—that value must not be configuration.

---

## 5. Configuration Influence Boundaries

Configuration may influence code within strict boundaries.

### 5.1 How Configuration May Influence Code

Code may reference configuration values as inputs:

- To populate dropdown options
- To display labels and terminology
- To apply default values to new records
- To render presentation elements
- To determine available categories

### 5.2 How Configuration Must Not Influence Code

Code must not:

- Branch behavior based on configuration values in ways that alter guarantees
- Skip validation because a configuration value has a certain name
- Apply different security rules based on configuration
- Execute different logic paths based on configured labels
- Make decisions based on configuration presence or absence

### 5.3 Missing Configuration Handling

When configuration is missing or incomplete:

- The system must fail explicitly
- The system must not assume defaults that mask the problem
- The system must not silently degrade functionality
- The administrator must be informed of the configuration issue

### 5.4 Invalid Configuration Handling

When configuration is invalid:

- The save must be rejected
- The reason must be explained
- The previous valid configuration must remain in effect
- No partial or inconsistent configuration may be applied

### 5.5 Legacy Values

When operational data references configuration values that no longer exist:

- The data must be preserved
- The legacy value must be displayed (possibly with indication)
- The system must not automatically modify, delete, or reassign data
- Code behavior must not depend on whether a value is "current" or "legacy"

---

## 6. Anti-Patterns and Violations

The following patterns are governance violations. Their presence indicates a defect requiring correction.

### 6.1 Logic Hidden in Configuration Values

Configuration values must not trigger special behavior based on their content.

Prohibited:

- A pipeline stage named "SKIP_VALIDATION" that bypasses validation
- A service type named "internal" that receives different treatment
- A lead source value that triggers automated processing
- Any value whose name or content affects code execution

### 6.2 Special-Case Behavior Triggered by Labels

Labels are presentation. They must not affect logic.

Prohibited:

- Code that checks if a label contains certain words
- Code that behaves differently for "numbered" vs "named" stages
- Code that interprets configuration values semantically
- Any logic that parses configuration for meaning beyond identification

### 6.3 Feature Flags Disguised as Configuration

Feature toggles must not be hidden in configuration.

Prohibited:

- Configuration that enables or disables code features
- Configuration that activates "beta" or "advanced" functionality
- Configuration that changes what code paths execute
- Any configuration that functions as a feature flag

Feature toggles, if needed, must be explicit, documented, versioned, and managed as code decisions, not configuration values.

### 6.4 Configuration Used to Bypass Code Paths

Configuration must not provide escape routes from code enforcement.

Prohibited:

- Configuration that disables validation
- Configuration that skips security checks
- Configuration that bypasses audit logging
- Any configuration that reduces what code enforces

### 6.5 Customer-Specific Logic in Configuration

No "just for this customer" behavior may exist in configuration.

Prohibited:

- Configuration values that only one deployment uses for special behavior
- Configuration structures that differ between deployments in ways that affect logic
- Configuration that works around bugs for specific customers
- Any configuration that creates deployment-specific code behavior

### 6.6 These Are Violations, Not Design Choices

The patterns above are not alternative approaches. They are governance violations.

When discovered, they must be:

- Identified as defects
- Corrected in code
- Removed from configuration
- Documented in change history

---

## 7. Deployment Consistency Rules

All deployments of contractors-GWS must maintain consistency in behavior, regardless of configuration differences.

### 7.1 Same Version, Same Behavior

All deployments running the same code version must:

- Enforce the same validation rules
- Apply the same security checks
- Execute the same business logic
- Produce the same audit trails for equivalent actions
- Handle the same errors in the same ways

Configuration may differ. Behavior must not differ.

### 7.2 Configuration Differences Do Not Change Guarantees

A deployment with different pipeline stages, service types, or labels must:

- Maintain all data integrity guarantees
- Enforce all security requirements
- Log all auditable events
- Validate all required fields
- Preserve all required data

Configuration adapts presentation. Configuration does not weaken guarantees.

### 7.3 White-Label Customization Boundaries

Customer-specific deployments may customize:

- Branding and visual identity
- Terminology and labels
- Available categories and options
- Default values and preferences

Customer-specific deployments may not customize:

- Security rules
- Validation logic
- Data lifecycle rules
- Audit requirements
- Any code behavior

### 7.4 Bugs Are Fixed in Code

When a bug is discovered:

- The fix must be implemented in code
- The fix must be deployed to all affected versions
- The fix must not be "worked around" through configuration
- Configuration changes that mask bugs are prohibited

A bug that can be worked around through configuration indicates a governance violation: configuration is influencing logic.

---

## 8. Detection and Enforcement

Violations of this document are defects. Detection and enforcement are ongoing responsibilities.

### 8.1 What Constitutes a Violation

A violation exists when:

- Configuration is used to alter logic or decisions
- Code depends on undocumented configuration expectations
- Deployments at the same version behave differently due to configuration
- Special-case behavior is triggered by configuration values
- Configuration bypasses code enforcement
- Feature flags exist in configuration instead of code

### 8.2 How Violations Are Treated

When a violation is identified:

- It must be classified as a defect
- It must be prioritized for correction
- It must be fixed in code, not accommodated in documentation
- Configuration must be normalized to remove logic influence

### 8.3 No Exception Process

There is no exception process for governance violations.

Prohibited justifications:

- "This customer needed it"
- "It was faster this way"
- "We'll fix it later"
- "It's just a small special case"
- "Configuration was more convenient"

Violations are defects. Defects are corrected. There are no exceptions.

### 8.4 Ongoing Compliance

Every change must be evaluated against this document:

- New configuration must not contain logic
- New code must not depend on undocumented configuration
- Existing violations discovered must be corrected
- No new violations may be introduced

---

## 9. Binding Nature

### 9.1 Authority of This Document

This document defines the absolute boundary between configuration and code for contractors-GWS.

All implementation decisions must conform to this specification:

- New features must respect the boundary
- Existing features that violate the boundary must be corrected
- Configuration structures must not contain logic
- Code must not depend on configuration for behavioral decisions

### 9.2 Violations Are Defects

A governance violation is not:

- A design choice
- A trade-off
- A technical debt item
- A known limitation

A governance violation is a defect requiring correction.

### 9.3 Convenience Does Not Override Governance

Implementation convenience does not justify violations:

- "It's easier to configure" does not permit logic in configuration
- "It's faster to deploy" does not permit customer-specific logic
- "It avoids a code change" does not permit configuration workarounds
- "The customer wants it" does not permit special-case behavior

Governance ensures the system remains predictable, maintainable, and trustworthy. Convenience that undermines governance undermines the system.

### 9.4 All Implementations Must Comply

Every deployment of contractors-GWS must comply with this document:

- Development environments
- Testing environments
- Staging environments
- Production environments
- Customer deployments
- Internal demonstrations

There are no environments where governance does not apply.

### 9.5 Relationship to Governing Documents

This document is subordinate to:

- DOC-000 — contractors-GWS System Charter & Product Promise
- DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries
- DOC-020 — contractors-GWS Canonical Data Model
- DOC-030 — contractors-GWS Back Office & CRM Operational Principles
- DOC-040 — contractors-GWS Security, Authentication & Operational Trust Rules

When this document conflicts with a governing document, the governing document prevails. In all other cases, this document is authoritative for configuration vs code decisions.

### 9.6 Change Control

This document may be revised through formal change control when:

- Product requirements evolve
- Operational experience reveals necessary adjustments
- Governing documents change

Revisions require:

- Documented rationale
- Impact analysis on existing configuration and code
- Updated version number and timestamp

This boundary does not weaken through omission, exception, or accumulated deviation.

---

*End of document.*
