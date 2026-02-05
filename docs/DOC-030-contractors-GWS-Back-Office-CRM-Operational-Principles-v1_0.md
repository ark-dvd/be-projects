# DOC-030 — contractors-GWS Back Office & CRM Operational Principles

**Status:** Canonical  
**Effective Date:** February 3, 2026  
**Version:** 1.0  
**Timestamp:** 20260203-1214 (CST)  
**Governing Documents:** DOC-000 — contractors-GWS System Charter & Product Promise, DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries, DOC-020 — contractors-GWS Canonical Data Model

---

## Revision History

| Version | Timestamp (CST) | Changes |
|---------|-----------------|---------|
| 1.0 | 20260203-1214 | Initial release |

---

## Document Standards

Canonical documents must include a CST timestamp in either the document body, the filename, or both.

This document defines how the Back Office and CRM must behave in practice. It translates the data model and architecture boundaries into day-to-day operational expectations. All implementation decisions regarding user-facing behavior must conform to this specification.

---

## 1. Operational Philosophy

### 1.1 Reliability Over Cleverness

The system must do what it appears to do. Predictable, consistent behavior is required. Sophisticated behavior that sometimes fails or behaves unexpectedly is prohibited.

When choosing between a reliable simple approach and an unreliable clever approach, reliability wins. The administrator must be able to depend on the system without understanding its internals.

### 1.2 Explicit Over Implicit Behavior

The system must not assume, infer, or act on the administrator's behalf without clear indication. Actions happen because the administrator requested them. State changes happen because the administrator initiated them.

The system does not:

- Guess what the administrator meant
- Anticipate and pre-execute likely actions
- Apply corrections the administrator did not request
- Perform background operations without visibility

### 1.3 No Silent Failure

When an operation fails, the administrator must know. When data cannot be saved, the administrator must be told. When a request cannot be completed, the administrator must receive feedback.

The system never:

- Swallows errors
- Discards input without notification
- Pretends success when failure occurred
- Logs errors without surfacing them
- Returns empty results when errors prevented retrieval

### 1.4 Administrative Intent Must Be Respected and Visible

When an administrator takes an action, that action must take effect. When an administrator views data, that data must reflect actual persisted state.

The gap between intent and outcome must be zero under normal operation. If the administrator clicks Save, data must be saved. If the administrator views a Lead, the displayed Lead must match stored data.

---

## 2. Back Office Principles

The Back Office is the administrative interface through which the business owner operates the system. It must behave as a trustworthy operational tool.

### 2.1 Every Visible Control Must Have a Real Effect

If a button, field, dropdown, toggle, or other control is visible to the administrator, it must function. Controls that appear interactive but do nothing are defects.

Requirements:

- A Save button must save
- A status dropdown must change status
- A configuration field must configure
- A delete action must delete (or explicitly refuse with reason)

Controls that are disabled must appear disabled. Controls that are unavailable must not be shown. The interface must not invite actions it cannot perform.

### 2.2 Save Means Persisted

When the administrator performs a save action and receives confirmation of success, the data must be persisted.

Persisted means:

- The data survives page reload
- The data survives session end
- The data survives system restart
- The data is retrievable by any authorized query

A save operation that completes without error but does not persist data is a critical defect. There is no acceptable scenario in which save indicates success and data is lost.

### 2.3 Reload Must Reflect Saved State

When the administrator reloads a page or returns to a screen, the displayed state must match the persisted state. If the administrator saved changes and reloads, those changes must be visible.

This prohibits:

- Stale cache preventing updated data from appearing
- Race conditions where old data overwrites new
- Timing windows where data appears saved but reverts
- Optimistic UI updates that never reconcile with storage

The formula is: save, reload, verify. If verification fails, the system is defective.

### 2.4 No Preview-Only Controls Presented as Real

The interface must not present demonstration, preview, or placeholder functionality as operational controls.

Requirements:

- If a feature is not implemented, the control must not exist
- If a control exists for future use, it must be clearly marked as unavailable or hidden entirely
- The administrator must never interact with a control believing it functions when it does not

A settings screen that displays but does not save is a defect. A pipeline that renders but does not support status changes is a defect. Partial implementation presented as complete functionality is prohibited.

### 2.5 Administrative Actions Are Deliberate

Administrative actions require affirmative user intent. The system does not:

- Auto-save without indication
- Auto-submit without confirmation
- Execute batch operations without explicit selection
- Apply defaults without visibility

The administrator knows what action they are taking because they initiated it explicitly.

### 2.6 Reversibility Is Explicit

Some actions are reversible. Some are not. The administrator must know which is which before taking action.

Reversible actions (within allowed transitions):

- Lead status changes
- Content edits prior to publication
- Configuration value changes

Irreversible actions:

- Lead to Client conversion
- Engagement completion or cancellation
- Activity creation
- Content deletion after publication (prohibited; only unpublish allowed)

When an action is irreversible, the system must communicate this before the action is taken, not after. The communication must be unambiguous.

---

## 3. CRM Operational Principles

The CRM manages customer relationships from inquiry through engagement. It must function reliably in daily business use.

### 3.1 Lead Capture

**Automatic lead capture**

When a visitor submits the public website contact form, a Lead must be created without administrative action. This is immediate.

The Lead must:

- Contain all submitted information without loss
- Be visible in the CRM immediately upon creation
- Have a clear indicator of automatic origin
- Generate an Activity recording its creation

Automatic lead capture that silently fails is a critical defect. If form submission succeeds from the visitor's perspective, a Lead must exist.

**Manual lead capture**

When an administrator creates a Lead manually, the Lead must:

- Be persisted immediately upon save
- Be visible in the CRM immediately
- Have a clear indicator of manual origin
- Generate an Activity recording its creation

The distinction between automatic and manual origin is preserved permanently and displayed consistently.

### 3.2 Lead Progression and Visibility

All Leads must be visible in the CRM. There is no hidden state, no background queue, no delayed appearance.

Lead status progression:

- Occurs only through explicit administrative action
- Is recorded as an Activity
- Is immediately reflected in all views
- Does not revert without explicit action

If the administrator sees status "Contacted," the Lead is Contacted. If the administrator changes it to "Quote Sent" and saves, it is Quote Sent everywhere, immediately.

### 3.3 Conversion to Client

Lead to Client conversion is an explicit, deliberate administrative action. It is never automatic. It is never implicit.

Conversion requirements:

- Administrator must initiate conversion explicitly
- System must confirm the action will create a Client
- Lead record is preserved with full history
- Client record is created with source Lead reference
- Activity is logged on both Lead and Client
- Conversion is irreversible

What conversion is not:

- Automatic when Lead reaches any status
- Implied by any other action
- Reversible after completion
- A transformation that destroys the Lead

The Lead continues to exist. The Client is a new entity linked to the Lead. Both records persist permanently.

### 3.4 Engagement Creation and Lifecycle Visibility

Engagements are created through explicit administrative action, always associated with a Client.

Creation requirements:

- Administrator specifies the Client
- Client association is set at creation and cannot change
- Engagement is immediately visible
- Activity is logged recording creation

Lifecycle visibility:

- Current status is always displayed accurately
- Status changes are explicit and logged
- Completed and Cancelled states are terminal and visible
- Historical Engagements remain visible permanently

An Engagement that exists is visible. There is no archival that removes records from view without explicit administrative action.

### 3.5 Activity Logging Expectations

Activities provide the audit trail for CRM operations. Activity logging is mandatory.

Activities must be created for:

- Lead creation (automatic or manual)
- Lead status changes
- Lead to Client conversion (on both entities)
- Client creation
- Engagement creation
- Engagement status changes
- Manual notes added by administrator

Activities must never be:

- Modified after creation
- Deleted
- Created with inaccurate timestamps
- Missing for any loggable event

The Activity timeline for any CRM entity is the complete, accurate, immutable history of that entity.

### 3.6 Search Behavior

Search must be complete, fresh, and trustworthy.

**Completeness**

Search must find records that exist and match the query. A Lead that exists and matches a search term must appear in results.

Search must not:

- Miss records due to indexing delay
- Return stale results after data changes
- Exclude records arbitrarily
- Fail silently and return empty results

**Freshness**

Search results must reflect current state. If a Lead was created moments ago, it must be searchable. If a Client's name was just updated, the new name must be searchable.

**Trust**

The administrator must be able to trust that search works. If search returns no results, no matching records exist. If search returns results, those results reflect actual current data.

Search that cannot be trusted is operationally useless and therefore defective.

---

## 4. Configuration Behavior

Configuration governs how the system categorizes and labels CRM data. Configuration behavior must be predictable and non-destructive.

### 4.1 When Configuration Changes Take Effect

Configuration changes take effect when saved. There is no delayed application, no cache invalidation period, no next-session activation.

When the administrator saves configuration changes and navigates to any CRM screen, the changes are visible immediately. New pipeline stages appear. Renamed stages display their new names. New service types are available in dropdowns.

### 4.2 How Configuration Changes Are Surfaced

Configuration changes must be acknowledged to the administrator:

- Save success must be confirmed
- Save failure must be reported with reason
- Changed values must be visible upon reload

The administrator knows that configuration changed because they changed it and the system confirmed it.

### 4.3 What Happens to Existing Data When Configuration Changes

Configuration changes do not alter existing data retroactively.

When a pipeline stage is renamed:

- Existing Leads in that stage retain their association
- The new name is displayed
- Historical Activities retain their original text

When a pipeline stage is removed:

- Existing Leads in that stage are not deleted
- Existing Leads in that stage are flagged or surfaced for attention
- Data is not silently orphaned or corrupted

When a service type is removed:

- Existing Leads and Engagements with that type retain their value
- Those values are displayed as legacy or flagged for update
- Historical record is not overwritten or erased

### 4.4 How Misconfiguration Is Handled

If the administrator creates an invalid configuration:

- The save must fail
- The reason must be explained
- The previous valid configuration remains in effect
- No partial configuration is applied

The system must not accept configuration that would break CRM operations.

### 4.5 Legacy Values

When operational data contains values that no longer exist in configuration:

- The data is preserved exactly as stored
- The value is displayed, possibly with a legacy indicator
- The administrator can update the record to a current value
- The system does not automatically reassign or clear values

Historical data integrity takes precedence over configuration tidiness.

### 4.6 What Configuration Must Never Do

Configuration must never:

- Delete or modify CRM records
- Override saved data with default values
- Cause validation to reject existing valid records
- Change system behavior beyond categorization and labeling
- Control access, permissions, or visibility
- Execute logic or workflows

Configuration categorizes. Configuration labels. Configuration presents options. Configuration does not decide, does not act, and does not destroy.

---

## 5. Error Handling and User Feedback

Errors are operational reality. The system must handle them visibly and correctly.

### 5.1 Error Visibility

Every error that affects the administrator's action must be visible to the administrator.

This includes:

- Save failures
- Validation rejections
- Network errors
- Server errors
- Timeout conditions
- Conflict conditions

The error must communicate:

- What operation failed
- Why it failed (to the extent determinable)
- What the administrator can do about it

### 5.2 Partial Failure Handling

When an operation partially succeeds, the system must not report complete success.

Requirements:

- Indicate what succeeded and what failed
- Ensure the administrator can address the failure
- Never present partial success as complete success

If saving configuration partially applies some values but fails on others, the administrator must know which values are active and which are not.

### 5.3 Validation Feedback

Validation errors must be immediate and specific:

- The offending field must be identified
- The reason for rejection must be stated
- The administrator must be able to correct and retry

Validation must be consistent:

- The same input must produce the same validation result
- Validation on save must not differ from validation on entry
- Validation rules must be predictable

Validation that rejects without explanation, rejects valid input, or accepts invalid input is defective.

### 5.4 Blocking vs Non-Blocking Errors

**Blocking errors** prevent the operation from completing. The administrator must address them before proceeding:

- Required field missing
- Invalid data format
- Referential constraint violation
- Server unavailability

**Non-blocking warnings** inform but allow proceeding:

- Potential duplicate record
- Value outside recommended range
- Irreversible consequences notification

Blocking errors must block. The system must not allow bypass. Non-blocking warnings inform; the administrator decides.

### 5.5 When the System Must Refuse an Action

The system must refuse actions that would:

- Violate data model invariants
- Create orphaned or inconsistent records
- Delete data that must be preserved
- Bypass audit requirements
- Break referential integrity

Refusal must be explicit. The system must state why the action is refused, not simply fail to perform it.

---

## 6. Data Safety and Trust

Data safety is a system property. Trust is earned through consistent correct behavior.

### 6.1 No Data Loss

Data entered by the administrator and accepted by the system must not be lost.

This means:

- Saved data persists
- Browser crashes do not lose confirmed saves
- Network interruptions after successful save do not corrupt data
- System errors do not silently discard records

Data loss is a critical defect. There is no acceptable level of data loss.

### 6.2 No Hidden State

All relevant state is visible to the administrator.

There is no:

- Background queue the administrator cannot see
- Pending state that differs from displayed state
- Draft state that exists without indication
- Deleted state that might reappear

What the administrator sees is what exists. What exists is what the administrator sees.

### 6.3 No Background Mutation Without Visibility

The system does not change CRM data except in response to:

- Explicit administrator action
- Automatic lead capture (visible and logged)
- Documented scheduled operations with audit trail

Arbitrary background processes that modify data, change statuses, or alter records without visibility are prohibited.

### 6.4 Auditability of Meaningful Actions

Meaningful actions must be auditable through the Activity log:

- Who took the action (system or administrator)
- What action was taken
- When it occurred
- What entity was affected

The Activity log is the audit trail. If an action changes CRM state, it must be logged.

### 6.5 Trust as a System Property

Trust is not a UX convenience. Trust is a system property that emerges from:

- Consistent behavior
- Accurate display
- Reliable persistence
- Visible error handling
- Complete audit trails

An administrator who cannot trust the system will maintain parallel records and eventually abandon the system. Trust is built by operational correctness. Trust is destroyed by any violation of these principles.

---

## 7. Forbidden Behaviors

The following behaviors are explicitly prohibited. Their presence constitutes a system defect requiring immediate correction.

### 7.1 Save That Does Not Save

A save operation that completes without error must persist data. A save button that does nothing, a save that silently fails, or a save that appears to succeed but loses data is a critical defect.

### 7.2 UI That Diverges from Persisted State

The interface must display persisted state. A UI that shows stale data, cached data contradicting storage, or optimistic updates that never reconcile is defective.

### 7.3 Hidden Automation That Alters CRM State

No background process, scheduled task, or automated routine may alter CRM data without visibility and audit trail. Automation that changes Leads, Clients, Engagements, or Activities without logging is prohibited.

Automatic lead capture is permitted because it is documented, expected, and logged. Arbitrary background mutation is not.

### 7.4 Implicit Conversions or Deletions

Lead to Client conversion must be explicit. Record deletion must be explicit. No status change, workflow completion, or configuration change may trigger conversion or deletion implicitly.

### 7.5 Back Office Actions Without Audit Trail

Administrative actions that change CRM state must create Activities. An action that modifies data but leaves no trace is defective.

### 7.6 Configuration That Destroys Data

Configuration changes must not delete, overwrite, or corrupt existing data. Pipeline stage removal does not delete Leads. Service type removal does not clear values. Configuration governs future behavior; it does not rewrite history.

### 7.7 Silent Error Swallowing

Errors must be surfaced. An error that occurs but is not communicated to the administrator is defective. This includes errors caught and logged but not displayed, errors that result in empty states without explanation, and errors that cause operations to silently have no effect.

### 7.8 Controls Without Function

Interface elements that appear interactive but have no effect are defective. A button that does nothing, a dropdown that changes nothing, or a field that accepts input but ignores it must not exist.

### 7.9 Partial Implementation Presented as Complete

Features that are partially implemented must not be presented as complete. A settings screen that displays but does not save, a search that appears but does not search, or a pipeline that displays but does not support status changes must not be presented to administrators as functional.

### 7.10 State That Exists Only in Memory

CRM state must be persisted. State that exists only in browser memory, only in session storage, or only until page refresh is not state. All operational state must survive reload.

---

## 8. Binding Nature

### 8.1 Authority of This Document

This document defines how the Back Office and CRM must behave operationally. It translates the data model and architecture into behavioral expectations.

All implementation decisions regarding user-facing behavior must conform to this specification:

- User interface behavior must follow these principles
- API responses must support these expectations
- Workflow implementations must satisfy these requirements
- Error handling must meet these standards

### 8.2 Violations Are Defects

Behavior that violates these principles is defective.

A violation is not:

- A UX trade-off
- A performance optimization
- A temporary workaround
- An acceptable limitation
- A known issue to be addressed later

A violation is a defect requiring correction. The severity of the defect corresponds to the severity of the violated principle.

### 8.3 Convenience Does Not Override Correctness

Implementation convenience, deadline pressure, or UX polish do not justify violations.

If implementing a feature correctly is difficult, the feature must still be implemented correctly or not implemented at all. A broken feature is worse than a missing feature. A feature that appears to work but does not is worse than both.

### 8.4 Governing Documents

This document is subordinate to:

- DOC-000 — contractors-GWS System Charter & Product Promise
- DOC-010 — contractors-GWS System Architecture & Responsibility Boundaries
- DOC-020 — contractors-GWS Canonical Data Model

When this document conflicts with a governing document, the governing document prevails. In all other cases, this document is authoritative for operational behavior decisions.

### 8.5 Change Control

This document may be revised through formal change control when:

- Operational experience reveals necessary adjustments
- Business requirements evolve
- Governing documents change

Revisions require:

- Documented rationale
- Impact analysis on existing behavior
- Updated version number and timestamp

These principles do not change through omission, workaround, or accumulated deviation.

---

*End of document.*
