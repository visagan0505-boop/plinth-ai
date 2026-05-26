# Invoice Service Architecture

## Invoice Lifecycle Boundaries
Invoices maintain a strict forward-only flow for formalized states:
- `DRAFT`: Fully mutable. Line items can be added, totals adjusted. Time entries linked to the draft are considered "locked for billing".
- `ISSUED`: Immutable. The invoice is formalized, sequence number assigned. It represents legally realized revenue.
- `PAID`: Immutable. The cash is received.
- `CANCELLED`: Only valid for `DRAFT` invoices. Reverts the invoice and unlinks the time entries, returning them to the unbilled WIP pool.

## Invoice Issuance Semantics
The transition from `DRAFT` to `ISSUED` is the primary financial watershed:
1. Validates the invoice balance > 0.
2. Acquires the `tenant_sequences` lock and assigns `INV-YYYY-NNNN`.
3. Sets `issued_at = now()`.
4. Dispatches the `invoice.issued` domain event.
5. Soft-locks all associated time entries via `linked_invoice_id`.

## Immutable Numbering
Invoice numbers strictly utilize `public.generate_next_sequence(tenant_id, 'INVOICE', year)`. Gaps in sequences are acceptable due to transaction rollbacks, but duplication or manual overriding is fundamentally rejected.

## Line-Item Attribution
An invoice consists of `invoice_line_items`, each tying to a specific `job_id` (and optionally `job_phase_id`). This multi-line architecture ensures that a single invoice can accurately draw down the fee budget of distinct phases independently.

## Approved Mutation Boundaries
- `updateInvoice()`: Only permitted when `status = 'DRAFT'`.
- `issueInvoice()`: Irreversible structural lock.
- `markInvoicePaid()`: Permitted on `ISSUED` invoices.
