# Engineering Record Audit Strategy

This document defines the strict auditability requirements for engineering records (deliverables, revisions, and transmittals).

## 1. Domain Event Triggers
The platform's centralized `domain_events` table will capture the following operational lifecycle events for Phase 3F:
- `deliverable.created`
- `deliverable.voided`
- `revision.created`
- `revision.file_attached`
- `transmittal.issued`

## 2. Attribution of Liability
- Every `transmittal.issued` event MUST capture the exact `staff_id` of the user who executed the action. 
- Transmittals represent the transfer of engineering liability from the consultancy to an external party. As such, the system acts as the definitive legal record of *who* released the documents and *when*.

## 3. Non-Repudiation
- To ensure non-repudiation, the database RLS policies will strictly forbid `UPDATE` and `DELETE` commands on the `transmittals` and `transmittal_items` tables after their initial creation transaction commits. 
- An issued transmittal is an eternal operational fact.
