# Revision Control Strategy

This document defines the operational invariants for engineering revision control.

## 1. Revision Lineage Guarantee
- Every revision belongs to exactly one Deliverable.
- Revisions must follow a sequential identifier pattern (e.g., Rev A, Rev B, Rev C, or Rev 0, Rev 1). The system does not strictly enforce the alphabet, but enforces uniqueness per deliverable.

## 2. The Immutability Invariant
- A Revision begins in a `DRAFT` state. During this state, the file payload, title, and metadata can be updated.
- When a Revision is included in a Transmittal, its status transitions to `ISSUED`.
- **CRITICAL INVARIANT**: An `ISSUED` revision is absolutely immutable. Its file URL, title, and metadata can NEVER be altered. 

## 3. The Supersession Principle
- To correct an error in an `ISSUED` revision, a user must create a *new* revision (e.g., Rev B replacing Rev A). 
- Silent updates to issued engineering records are considered catastrophic failures of quality assurance and are strictly prohibited by the architecture.

## 4. Auditability Requirements
- The creation, modification (while in draft), and locking (issuance) of a revision must dispatch structural domain events detailing the exact time and operator (staff_id) who performed the action.
