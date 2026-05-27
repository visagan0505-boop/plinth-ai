# Engineering Records UI Principles

This document defines the strict governance rules for the user interface representing the Engineering Records module (Phase 3F). The UI must reflect absolute engineering realism and reject generalized Document Management System (DMS) patterns.

## 1. Engineering Records UX Philosophy
The interface exists to provide a mathematically precise, derived view of operational delivery liability. It must present a highly legible, immutable historical record of exactly what was committed to external parties, when, and by whom.

## 2. Revision-Lineage Visibility Rules
- **Sequential Lineage**: The UI must clearly articulate the lineage of a deliverable (e.g., Rev A -> Rev B). 
- **Status Explicitness**: A revision's status (`DRAFT` vs `ISSUED`) must be visually distinct. Users must immediately recognize which revisions are mutable work-in-progress and which are immutable historical facts.

## 3. Transmittal-History Visibility Rules
- **The Matrix View**: Issue history MUST be rendered as a matrix (Document Register). Deliverables form the Y-axis, Transmittal dates/numbers form the X-axis, and issued Revision IDs form the intersecting cells.
- **Derived Truth**: The matrix is read-only. It is mathematically derived from the underlying ledger and cannot be manually edited in the UI.

## 4. Operational Attribution Visibility Requirements
- Every transmittal record displayed in the UI must prominently display the `staff_id` (or resolved name) of the operator who executed the issuance, cementing professional accountability.

## 5. Forbidden Generic-DMS UX Patterns
- **No Drag-and-Drop Folder Trees**: Deliverables belong to Jobs (and Phases/Scopes). There are no arbitrary user-defined folder structures.
- **No Cloud-Drive Thumbnails**: The UI must focus on the metadata, revision control, and transmittal ledger, not visual previews of PDF files in a masonry grid.
- **No Check-in/Check-out Locks**: Revisions are sequential. Concurrency is handled by creating the next sequential revision, not by locking files like SharePoint.

## 6. Deterministic Issue-Control Interaction Rules
- **Irreversible Actions**: The "Issue Transmittal" interaction must clearly warn the user that the action is final, locking the selected revisions permanently.
- **Selection Constraints**: A transmittal generation wizard must mathematically prevent the selection of multiple `DRAFT` revisions for the same deliverable in a single transmittal.
