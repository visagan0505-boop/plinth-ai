# Issue History Strategy

This document outlines how the system satisfies the engineering requirement for an "Issue History Ledger" (often referred to as a Document Register).

## 1. The Derived Ledger Principle
- The system does NOT maintain a separate, manually editable "Document Register" table. 
- The Issue History is a **strictly derived view** (or query projection) constructed by joining `deliverables` -> `revisions` -> `transmittal_items` -> `transmittals`.
- This eliminates the risk of data desynchronization where a document is issued but the register is not updated.

## 2. Deterministic Tracking
- Because the Issue History is dynamically derived, it perfectly reflects the exact timestamp, `issue_reason`, and `revision_number` of every document released from the platform.

## 3. UI Matrix Rendering
- In the UI layer, the Issue History will be rendered as a matrix: Deliverables on the Y-axis, Transmittals/Dates on the X-axis, and Revision Numbers in the intersecting cells. This perfectly mimics the traditional engineering "Document Transmittal Matrix" required by QA standards (e.g., ISO 9001).
