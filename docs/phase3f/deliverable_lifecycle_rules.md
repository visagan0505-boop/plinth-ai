# Deliverable Lifecycle Rules

This document defines the strict lifecycle semantics for engineering deliverables within the operational platform.

## 1. Deliverable Identity
- A **Deliverable** is a conceptual container representing an engineering output (e.g., "S101 - Foundation Plan"). 
- It exists independent of its files. The physical files are attached to its **Revisions**.
- Deliverables belong strictly to a `job_id`. They may optionally be linked to a `phase_id` or `scope_id` for granular operational tracking.

## 2. Deliverable Status Semantics
A deliverable does not have a status of its own (like "In Progress" or "Done"). Instead, its status is derived dynamically from its latest Revision.
- If no revisions exist, the deliverable is "Planned".
- If the latest revision is `DRAFT`, the deliverable is "WIP".
- If the latest revision is `ISSUED`, the deliverable is "Issued (Rev X)".

## 3. Forbidden Document Management Patterns
- **No Freeform File Uploads**: You cannot simply "upload a file" to a Job. All files must be structurally attached to a named Revision of a named Deliverable.
- **No Folder Hierarchies**: The platform does not support generic nested folders. Organization is achieved via metadata (Job -> Phase -> Deliverable).

## 4. Immutable Deletion Rules
- A deliverable can only be deleted if it has **zero issued revisions**.
- Once any revision of a deliverable has been transmitted/issued, the deliverable itself becomes a permanent part of the engineering record and cannot be deleted. It can only be marked as "Superseded" or "Void".
