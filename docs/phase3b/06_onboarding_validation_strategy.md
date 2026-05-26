# Onboarding Validation Strategy

## Two-Tier Validation

### 1. Zod Validation (Application Tier)
- Guarantees types, string lengths, numeric boundaries (e.g., positive rates), and structural integrity before hitting the network.
- Keeps frontend errors fast and informative.
- Extracts strongly typed payloads for the backend services.

### 2. Database Constraints (Data Tier)
- Enforces absolute integrity using PostgreSQL constraints.
- `UNIQUE (slug)` on `public.tenants` prevents duplicate tenant URLs.
- Foreign key constraints ensure staff map to valid tenant IDs.
- Non-overlapping exclusion constraints on `staff_rate_periods` ensure temporal truth.

## Idempotency Keys
- By generating UUIDs on the Next.js server *before* calling the database, we can safely retry the entire onboarding sequence without accidentally creating duplicate records if a timeout occurs.
