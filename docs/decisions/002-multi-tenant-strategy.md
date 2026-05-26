# ADR 002 — Multi-Tenant Strategy

Plinth is single-tenant initially but architected for multi-tenant SaaS from day one.

Rules:
- tenant ownership on business tables
- RLS enabled everywhere
- JWT tenant isolation
- bootstrap tenant temporary only
