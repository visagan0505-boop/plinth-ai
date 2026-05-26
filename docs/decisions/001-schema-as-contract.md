# ADR 001 — Schema as Contract

The PostgreSQL schema is treated as a first-class architectural contract.

Rules:
- migrations are versioned
- schema drift is controlled
- lookup tables preferred over enums
- operational concepts are explicit
- future analytics compatibility matters
