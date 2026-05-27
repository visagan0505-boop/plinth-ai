# Producer Statement Future Strategy

This document establishes the strategic boundaries to ensure the Deliverables architecture is strictly compatible with the future generation and tracking of Producer Statements (e.g., PS1, PS4 in the NZ context).

## 1. Producer Statements are Deliverables
- A Producer Statement (PS) will eventually be modeled as a highly specialized `Deliverable` subtype.
- By enforcing the strict `Deliverable -> Revision -> Transmittal` lineage now, we ensure that future Producer Statements inherit the immutability, auditability, and transmittal tracking required by building consent authorities.

## 2. Metadata Extensibility
- Producer Statements require specialized metadata (e.g., Design Codes, Building Consent Numbers, Authoring Engineer CPEng numbers).
- The `deliverables` table will be designed with a `metadata jsonb` column to support the future injection of this highly specific structural schema without requiring aggressive database migrations.

## 3. Separation of Concerns
- The current Phase 3F implementation will NOT generate PDF Producer Statements. It strictly builds the container and tracking architecture required to *house* them.
- This ensures the operational delivery core remains decoupled from the highly localized, jurisdiction-specific compliance generation logic.
