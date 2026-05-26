# Financial Execution Plan

## Implementation Order
The physical execution of Phase 4A must strictly follow this order to ensure dependent states are structurally sound before building higher-level layers:
1. **Financial Database Schema:** Generate migrations for `invoices`, `invoice_line_items`, `adjustments`, and `wip_ledger`.
2. **Financial DTO Schemas:** Define immutable Zod definitions for mutations.
3. **Sequence Infrastructure Update:** Ensure invoice numbering ties into the existing atomic `tenant_sequences` system.
4. **WIP Engine Services:** Build the deterministic drawdown engine querying `time_entries` and `wip_ledger`.
5. **Invoice Services:** Build the lifecycle mutation services (`DRAFT`, `ISSUED`, `PAID`, `CANCELLED`).
6. **Profitability Reduction Services:** Build the historical reconstruction aggregation engine.
7. **Server Actions:** Safely wrap the engines, isolating context via `getOperationalContext()`.
8. **Financial Validation Automation:** Implement integration hooks validating mathematical integrity across the new modules.

## Migration Sequencing
The migrations must ensure temporal truth, capturing `tenant_id`, `created_at`, `created_by` securely. The sequence is:
- **00000000000010_invoices.sql**
- **00000000000011_invoice_line_items.sql**
- **00000000000012_adjustments.sql**

## Rollout Safety
- Development must happen incrementally.
- No historical data is migrated or mutated; the system operates on the fresh ledger.
- Profitability logic must be wrapped in heavy unit/integration validation before being connected to the UI.

## Validation Stages
- **Stage 1 (Schema):** Ensure `tenant_id` constraints and basic constraints (e.g., non-negative amounts unless specifically a credit).
- **Stage 2 (WIP Engine):** Validate fee drawdown does not hallucinate balances.
- **Stage 3 (Profitability):** Ensure historical replay validation aligns mathematically with manual assertions.
