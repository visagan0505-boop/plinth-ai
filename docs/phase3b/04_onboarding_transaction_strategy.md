# Onboarding Transaction Strategy

## The Multi-Insert Problem
Because Next.js runs stateless Edge/Serverless functions and Supabase exposes a REST API (PostgREST), we cannot wrap sequential API calls in a standard `BEGIN...COMMIT` block from Node.js.

## The Solution: Supabase RPC (PL/pgSQL)
To ensure absolute transactional safety without stranding data, the server action will call a custom PostgreSQL function: `rpc('bootstrap_tenant', payload)`.

### Function Logic
1. `BEGIN` (implicit in PL/pgSQL).
2. `INSERT INTO public.tenants`.
3. `INSERT INTO public.office_locations`.
4. `INSERT INTO public.disciplines`.
5. `INSERT INTO public.staff`.
6. `INSERT INTO public.staff_rate_periods`.
7. `COMMIT`.

### Fallback Node.js Strategy
If a custom RPC function is not desirable due to schema migration complexity, the Node.js layer MUST use idempotent `ON CONFLICT DO NOTHING` inserts using deterministic UUIDs generated on the server (e.g., using `crypto.randomUUID()`) prior to executing the sequence. 

However, given the strict rule for operational correctness and no partial states, the PL/pgSQL RPC approach is the gold standard for transactional safety here.
