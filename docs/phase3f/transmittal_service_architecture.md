# Transmittal Service Architecture

This document defines the backend architecture for the Transmittal Engine, which facilitates the formal release of engineering documents.

## 1. Core Transmittal Entity
- `transmittals` table: Represents the "cover letter" of a document release.
- **Fields**: `id`, `tenant_id`, `job_id`, `transmittal_number` (auto-incrementing sequence per job), `issue_date`, `issue_reason` (enum: For Info, For Consent, For Tender, For Construction), `created_by`.

## 2. Transmittal Line Items (The Ledger)
- `transmittal_items` table: The junction tying a Transmittal to specific Revisions.
- **Fields**: `transmittal_id`, `revision_id`.
- This ensures a transmittal knows exactly which revisions were attached, and a revision knows exactly which transmittal(s) it was issued under.

## 3. The `issueTransmittal` Service Workflow
When the service is invoked to issue a transmittal:
1. **Validation**: Ensure all provided `revision_ids` belong to the given `job_id`.
2. **Creation**: Insert the `transmittals` record.
3. **Ledger Insert**: Insert the `transmittal_items` linking records.
4. **Immutability Lock**: Execute an `UPDATE` on the `revisions` table, setting `status = 'ISSUED'` for all attached revisions.
5. **Event Dispatch**: Fire a `transmittal.issued` domain event.

All 5 steps MUST execute within a single ACID transaction block. If any step fails, the entire transmittal is rolled back.

## 4. Future Email Compatibility
- The transmittal engine does not currently send emails. However, the architecture (specifically the immutable ledger and `issue_reason`) is explicitly designed to act as the payload source for a future SMTP/email microservice.
