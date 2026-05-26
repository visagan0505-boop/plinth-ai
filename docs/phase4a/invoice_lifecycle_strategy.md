# Invoice Lifecycle Strategy

## Invoice Lifecycle States
Invoices move through a strictly linear, auditable lifecycle:
- **DRAFT:** The invoice is being formulated. Linked time entries are soft-locked (marked as pending billing).
- **ISSUED:** The invoice has been formally sent to the client. The record is now **IMMUTABLE**.
- **PAID:** The invoice has been settled.
- **CANCELLED:** A draft invoice is voided, releasing the linked time entries back into the WIP pool. (Note: An ISSUED invoice cannot be cancelled, it must be subject to a credit note or adjustment).

## Invoice Numbering Governance
- Driven by the central `public.tenant_sequences` table via `public.generate_next_sequence()`.
- Format: `INV-YYYY-NNNN` (e.g., `INV-2026-0001`).
- Numbers are securely scoped to the `tenant_id` and are structurally immutable once allocated.

## Revenue Attribution Rules
- An invoice must strictly tie back to a specific `job_id`.
- The revenue recognized by the invoice dictates the realized revenue, which replaces the hypothetical "WIP value" in profitability calculations.

## Locked Financial Periods
- Invoices tied to a closed financial period (e.g., "March 2026") cannot be modified under any circumstances. Exceptions require high-level, audited adjustment workflows.
