# Engineering Issue Control Principles

This document defines the strict governance rules for engineering issue control. It establishes the absolute truth of operational delivery and prevents the platform from degrading into a generic document management system.

## 1. Engineering Issue-Control Philosophy
The platform does not manage "files"; it manages the **operational release of engineering liability**. A deliverable is a commitment, a revision is a snapshot of that commitment, and a transmittal is the formal transfer of that commitment to an external entity. 

## 2. Revision Immutability Guarantees
- An `ISSUED` revision is a mathematically closed operational fact. 
- It is physically impossible (via database RLS and application logic) to alter the file payload, title, metadata, or issue status of an issued revision.

## 3. Transmittal Historical Integrity Rules
- Transmittals are append-only ledgers. 
- A transmittal cannot be deleted or modified once its creation transaction commits. 
- The exact state of the transmittal, including its date, reason for issue, and attached revisions, is permanently locked.

## 4. Operational Delivery Attribution Rules
- Every action that advances the lifecycle of a deliverable (creating a revision, issuing a transmittal) MUST strictly record the `staff_id` responsible.
- This attribution establishes the chain of custody required for professional engineering QA standards.

## 5. Engineering Record Lifecycle Guarantees
- A deliverable begins its life linked to a specific Job (and optionally Phase/Scope).
- Its lifecycle is permanently tracked through its revisions. 
- A deliverable with issued revisions can only be marked as `Superseded` or `Voided`, but never purged from the system.

## 6. Forbidden Issue-Control Mutations
- **No Silent Updates**: Correcting a typo in an issued drawing requires a new revision (e.g., Rev A -> Rev B). 
- **No Transmittal Backdating**: A transmittal's `issue_date` cannot be artificially manipulated post-creation to mask operational delays.

## 7. Operational Reconstruction Guarantees
- The system must mathematically guarantee that at any point in the future, an auditor can query a Job and reconstruct the exact sequence of documents issued, the exact files sent, and the exact personnel who authorized the release.
